import { 
    getDepositWallet, getProvider, getConsts, getGroupById, loadEthers, filterTraders, basicLoad, delay, sendWS, ready_to_buy, chckProfit, selling, return_eth, calcDepAmount, updateWallet
} from '../u'
import type { Trader, Task } from '../u'
import { multisend } from "../../run/multisend"

export async function runNeedDeposit(activeTraders: Trader[], task: Task) {
    if(!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const taskId = task._id.toString()
    const { TraderStatus } = await getConsts()
    const depAddrs: string[] = []
    const depAmounts: bigint[] = []
    let remainingDistributionAmount = await calculateRemainingDistributionAmount(activeTraders, task)
    for (let i = activeTraders.length - 1; i >= 0; i--) {
        if(activeTraders[i].status === TraderStatus.NEED_DEPOSIT) {
            depAddrs.push(activeTraders[i].wallet.address)
            const amount = await calcDepAmount(i, remainingDistributionAmount)
            activeTraders[i].depositAmount = amount
            depAmounts.push(amount)
            remainingDistributionAmount -= amount
        }
    }

    await sendWS({ type: "need_deposit", data: { depAddrs, depAmounts }, taskId }, task.socket)
    
    if(depAddrs.length > 0){
        await sendWS({ type: "need_deposit", message: `Depositing to ${depAddrs.length} wallets...`, taskId }, task.socket)
        await multisend(depAddrs, depAmounts, task)
        await sendWS({ type: "need_deposit", message: 'Deposits complete.', taskId }, task.socket)
        for (let i = activeTraders.length - 1; i >= 0; i--) {
            if(activeTraders[i].status === TraderStatus.NEED_DEPOSIT) {
                activeTraders[i].status = TraderStatus.READY_TO_BUY
                await updateWallet(activeTraders[i].wallet.address.toString(), { 
                    address: activeTraders[i].wallet.address.toString(),
                    status: activeTraders[i].status,
                    deposit_amount: activeTraders[i].depositAmount.toString()
                })
            }
        }
    }

    return activeTraders
}

export async function runTradingLoop(task: Task) {
    if(!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const taskId = task._id.toString()
    const statuses: string[] = []
    const { TraderStatus } = await getConsts()
    if(task.type === 'BUY'){
        statuses.push(TraderStatus.READY_TO_BUY, TraderStatus.NEED_DEPOSIT)
    } else if(task.type === 'SELL'){
        statuses.push(TraderStatus.MONITORING, TraderStatus.SELLING, TraderStatus.RETURNING_ETH)
    }
    let loadData = await basicLoad(task)
    let activeTraders: Trader[] = loadData.activeTraders
    for (let i = 0; i < activeTraders.length; i++) {
        if(task._id){
            sendWS(
                { type: "trading_loop", message: `Setup trader: ${activeTraders[i].wallet.address}`, taskId },
                task.socket
            )
        }
    }
    while (activeTraders.length > 0) {
        activeTraders = await runNeedDeposit(await filterTraders(activeTraders, statuses), task)

        for (let i = activeTraders.length - 1; i >= 0; i--) {
            await sendWS({ type: "active_trader", data: activeTraders[i], taskId }, task.socket)
            switch (activeTraders[i].status) {
                case TraderStatus.READY_TO_BUY:
                    if(task.type === 'BUY' && (statuses.length === 0 || statuses.includes(TraderStatus.READY_TO_BUY))){
                        activeTraders[i] = await ready_to_buy(activeTraders[i], task)
                        await delay(task.transactionTimeout || 0)
                    }
                    break

                case TraderStatus.MONITORING:
                    if(task.type === 'SELL' && (statuses.length === 0 || statuses.includes(TraderStatus.MONITORING))){
                        activeTraders = await chckProfit(activeTraders, i, task)
                        if(activeTraders[i].status === TraderStatus.SELLING){
                            activeTraders[i] = await selling(activeTraders[i], task)
                            await delay(task.transactionTimeout || 0)
                        }
                        if(activeTraders[i].status === TraderStatus.RETURNING_ETH){
                            activeTraders[i] = await return_eth(activeTraders[i], task)
                            activeTraders.splice(i, 1)
                            await delay(task.transactionTimeout || 0)
                        }
                    }
                    break

                case TraderStatus.SELLING:
                    if(task.type === 'SELL' && (statuses.length === 0 || statuses.includes(TraderStatus.SELLING))){
                        activeTraders[i] = await selling(activeTraders[i], task)
                        await delay(task.transactionTimeout || 0)
                        if(activeTraders[i].status === TraderStatus.RETURNING_ETH){
                            activeTraders[i] = await return_eth(activeTraders[i], task)
                            activeTraders.splice(i, 1)
                            await delay(task.transactionTimeout || 0)
                        }
                    }
                    break

                case TraderStatus.RETURNING_ETH:
                    if(task.type === 'SELL' && (statuses.length === 0 || statuses.includes(TraderStatus.RETURNING_ETH))){
                        activeTraders[i] = await return_eth(activeTraders[i], task)
                            activeTraders.splice(i, 1)
                        await delay(task.transactionTimeout || 0)
                    }
                    break
            }
                
        }

        activeTraders = await filterTraders(activeTraders, statuses)
      
        const statusCounts = activeTraders.reduce((acc: any, t: Trader) => {
            if (!t.status) return acc
            acc[t.status] = (acc[t.status] || 0) + 1
            return acc
        }, {})

    
        for (const [status, count] of Object.entries(statusCounts)) {
            await sendWS({ type: "active_traders", message: `- ${status}: ${count}`, taskId }, task.socket)
        }
        await sendWS({ type: "active_traders", message: `- Total active traders: ${activeTraders.length}`, taskId }, task.socket)

        if (activeTraders.length === 0) {
            await sendWS({ type: "active_traders", message: 'All traders are monitoring profit. Continuing to monitor...', taskId }, task.socket)
        }
    }
}


export async function calculateRemainingDistributionAmount(activeTraders: Trader[], task: Task): Promise<bigint> {
    const { ethers } = await loadEthers()
    const { TraderStatus } = await getConsts()
    const group = await getGroupById(task.groupId.toString())
    const provider = await getProvider(group)
    let totalDistributedBalance = 0n
    for (const trader of activeTraders) {
        if (trader.status !== TraderStatus.NEED_DEPOSIT && trader.depositAmount) {
            totalDistributedBalance += BigInt(trader.depositAmount)
        }
    }
    
    const depositWallet = await getDepositWallet(task)
    if (!depositWallet) {
        throw new Error("Deposit wallet not found in constants.")
    }
    const currentDepositBalance = await provider.getBalance(depositWallet.address)
    // Add current balance and already distributed amount to get true total
    const totalBalance = currentDepositBalance + totalDistributedBalance
    const totalDistributionAmount = (totalBalance * BigInt(task.distribution_percentage || '1')) / 100n
    
    // Calculate remaining amount after considering already distributed funds
    const remainingDistributionAmount = totalDistributionAmount - totalDistributedBalance

    console.log(`Current deposit balance: ${ethers.formatEther(currentDepositBalance)} ETH`)
    console.log(`Total balance (including distributed): ${ethers.formatEther(totalBalance)} ETH`)

    return remainingDistributionAmount
}