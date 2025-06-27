import { ethers } from "ethers"
import { 
    getProvider, filterTraders, getConsts, sendWS, delay, setupTraders, 
    newWallet, updateWallet, getWallets, getGroupById
} from "../u"
import type { Trader, Wallet, Task, CustomWallet } from "../u"

export async function updateWalletStatus(address: string, depositAmount: bigint, statusUpdate: string) {
    await updateWallet(address, {
        address: address,
        status: statusUpdate,
        deposit_amount: depositAmount.toString()
    })
}

export async function getActiveWallets(wallets: Wallet[], task: Task): Promise<Trader[]> {
    return await filterTraders(await setupTraders(wallets, task))
}


export async function runCreateWallets(length: number, groupId: string = "0", timeout: number = 0): Promise<Wallet[] & CustomWallet[]> {
    const wallets: Wallet[] & CustomWallet[] = []
    if (length > 0) {
        const { TraderStatus } = await getConsts()
        for (let i = 0; i < length; i++) {
            const wallet = ethers.Wallet.createRandom()
            const w: Wallet & CustomWallet = {
                address: wallet.address,
                privateKey: wallet.privateKey,
                status: TraderStatus.NEED_DEPOSIT,
                deposit_amount: '0',
                groupId: groupId
            }
            wallets.push(w)
            await newWallet(w)
            await delay(timeout)
        }
    }
    return wallets
}

export async function createWallets(task: Task): Promise<Wallet[]> {
    if (!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const group = await getGroupById(task.groupId.toString())
    let wallets: CustomWallet[] | Wallet[] = await getWallets(group)
    const taskId = task._id.toString()
    const provider = await getProvider(group)
    const { TraderStatus } = await getConsts()
    let customWallets: CustomWallet[] | Wallet[] = []
    if(task.customWallets.length > 0) {
        for(let i = 0; i < task.customWallets.length; i++) {
            if(wallets.find(w => w.address.toLowerCase() === task.customWallets[i].address.toLowerCase() === undefined)) {
                const wallet = new ethers.Wallet(task.customWallets[i].privateKey)
                const balance = await provider.getBalance(wallet.address)
                const w: Wallet & CustomWallet = {
                    address: wallet.address,
                    privateKey: wallet.privateKey || "", 
                    status: balance > 0n ? TraderStatus.READY_TO_BUY : TraderStatus.NEED_DEPOSIT,
                    deposit_amount: balance.toString(),
                    groupId: task.groupId.toString()
                }
                wallets.push(w)
                await newWallet(w)
                sendWS({ type: 'wallet_create', message: `New wallet created: ${wallet.address}`, data: { wallet }, taskId }, task.socket)
            }
        }
    } else {
        let activeWallets = await getActiveWallets(wallets, task)
        if(wallets) {
            sendWS({ 
                type: 'wallet_create', 
                message: `Current active wallets: ${activeWallets.length}, Required: ${wallets.length}`, 
                taskId: taskId
            }, task.socket)

            if (activeWallets.length <= wallets.length) {
                const walletsNeeded = wallets.length - activeWallets.length
                sendWS({ type: 'wallet_create', message: `Creating ${walletsNeeded} new wallets`, taskId: taskId.toString() }, task.socket)
                const newWallets = await runCreateWallets(walletsNeeded, taskId, task.transactionTimeout || 0)
                sendWS({ type: 'wallet_create', data: {wallets: newWallets}, taskId: taskId.toString() }, task.socket)
                wallets.push(...newWallets)
            }
        }
    }
    
    return wallets
}
