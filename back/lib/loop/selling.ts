import { getConsts, sendWS, sendRawTx, loadEthers, updateWallet, checkTokenBalance } from "../u"
import type { Trader, Task } from "../u"

export async function selling(trader: Trader, task: Task): Promise<Trader> {
    if (!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const taskId = task._id.toString()
    const { TraderStatus } = await getConsts()
    let address = trader.wallet.address
    await sendWS({ type: "sell_tokens", message: `Executing take profit for ${address}`, taskId }, task.socket)
    const sellSuccess = await sellTokens(trader, task)
    if (sellSuccess) {
        trader.status = TraderStatus.RETURNING_ETH
        await updateWallet(address, { address, status: trader.status })
    } else {
        trader.status = TraderStatus.MONITORING
        await sendWS({ type: "sell_tokens", message: `Failed to execute take profit for ${address}`, taskId }, task.socket)
    }
    return trader
}

export async function sellTokens(trader: Trader, task: Task) {
    // Dynamically import ethers only when needed
    const { ethers } = await loadEthers()
    
    const { TraderStatus, ROUTER_ADDRESS } = await getConsts()
    let tokenBalance: bigint = 0n
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20
    
    // Verify trader setup
    if (!trader || !trader.router || !trader.token || !trader.wallet) {
        throw new Error('Invalid trader setup')
    }

    // Get WETH address and verify it
    const WETH = await trader.router.WETH()
    if (!ethers.isAddress(WETH)) {
        throw new Error(`Invalid WETH address: ${WETH}`)
    }
    console.log(`WETH address verified: ${WETH}`)
    
    // Setup swap path and verify addresses
    const path = [task.token, WETH]
    if (!path.every(addr => ethers.isAddress(addr))) {
        throw new Error('Invalid address in swap path')
    }
    console.log(`Swap path verified: ${path.join(' -> ')}`)
    
    // Get token balance
    tokenBalance = await checkTokenBalance(trader)
    if (tokenBalance === 0n) {
        console.log(`No tokens to sell for ${trader.wallet.address}`)

        await updateWallet(trader.wallet.address, { address: trader.wallet.address, status: TraderStatus.RETURNING_ETH })
        return false
    }
    console.log(`Token balance: ${ethers.formatEther(tokenBalance)} tokens`)

    // Check allowance first
    const currentAllowance = await trader.token.allowance(trader.wallet.address, ROUTER_ADDRESS)
    console.log(`Current allowance: ${ethers.formatEther(currentAllowance)} tokens`)
    
    // Only approve if needed
    if (currentAllowance < tokenBalance) {
        console.log('Approving tokens...')

        await sendRawTx({
            wallet: trader.wallet, 
            to: trader.token.target, 
            data: trader.token.interface.encodeFunctionData('approve', [ROUTER_ADDRESS, tokenBalance])
        }, task)
    }

    // Get expected output amount
    console.log('Getting expected ETH output...')
    const [, expectedOut] = await trader.router.getAmountsOut(tokenBalance, path)
    console.log(`Expected output: ${ethers.formatEther(expectedOut)} ETH`)
    
    // Calculate minimum output with 1% slippage
    const minOut = (expectedOut * 90n) / 100n
    console.log(`Minimum output (1% slippage): ${ethers.formatEther(minOut)} ETH`)

    await sendRawTx({
        wallet: trader.wallet, 
        to: trader.router.target, 
        data: trader.router.interface.encodeFunctionData('swapExactTokensForETHSupportingFeeOnTransferTokens', [
            tokenBalance,
            minOut,
            path,
            trader.wallet.address,
            deadline
        ]),
        comment: "Selling tokens for ETH"
    }, task)
    
    return true
}


