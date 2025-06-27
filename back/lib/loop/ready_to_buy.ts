import { getConsts, sendWS, getProvider, sendRawTx, loadEthers, updateWallet, getOptimalGasPrice, distributeEth } from '../u'
import type { Trader, Task } from '../u'

export async function buyTokens(trader: Trader, task: Task) {
    // Dynamically import ethers only when needed
    const { ethers } = await loadEthers()
    
    const provider = await getProvider(task)
    console.log(`Starting buy process for ${trader.wallet.address}`)
    
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20
    console.log(`Getting WETH address...`)
    
    let amountIn = 0n
    
        // Verify router is properly connected
    if (!trader.router.runner?.provider) {
        throw new Error('Router not properly connected to provider')
    }
    
    // Get WETH address and verify it
    const WETH = await trader.router.WETH()
    if (!ethers.isAddress(WETH)) {
        throw new Error(`Invalid WETH address: ${WETH}`)
    }
    console.log(`WETH address verified: ${WETH}`)
    
    // Setup swap path and verify addresses
    const path = [WETH, task.token]
    if (!path.every(addr => ethers.isAddress(addr))) {
        throw new Error('Invalid address in swap path')
    }
    console.log(`Swap path verified: ${path.join(' -> ')}`)
    
    const balance = await provider.getBalance(trader.wallet.address)
    console.log(`Wallet balance: ${ethers.formatEther(balance)} ETH`)

    // Get gas price and network congestion multiplier
    const gasPrice = await getOptimalGasPrice(task)
    console.log(`Current gas price: ${ethers.formatUnits(gasPrice, 'gwei')} gwei`)
    
    // Estimate future sell operation gas costs
    console.log('Estimating future sell operation gas costs...')
    
    // Get actual gas estimates for operations
    const [approveGasLimit, sampleSellGasLimit] = await Promise.all([
        // Estimate approve gas
        provider.estimateGas({
            from: trader.wallet.address,
            to: trader.token.target,
            data: trader.token.interface.encodeFunctionData('approve', [trader.router.target, ethers.MaxUint256])
        }),
        // Estimate sell gas using a sample amount
        provider.estimateGas({
            from: trader.wallet.address,
            to: trader.router.target,
            data: trader.router.interface.encodeFunctionData('swapExactTokensForETHSupportingFeeOnTransferTokens', [
                ethers.parseUnits("1", 18), // Sample amount
                0n,
                [task.token, WETH],
                trader.wallet.address,
                deadline
            ])
        }).catch(() => 250000n) // Fallback to 250k if estimation fails
    ])

    // Calculate total gas needed with congestion-based buffer
    const totalGasETH = (approveGasLimit * gasPrice + sampleSellGasLimit * gasPrice) * 3n
    
    console.log(`Total gas price: ${ethers.formatEther(totalGasETH)} ETH`)
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`)

    
    amountIn = balance - totalGasETH
    console.log(`Amount to swap: ${ethers.formatEther(amountIn)} ETH`)

    if (amountIn === 0n) {
        console.log(`Insufficient ETH balance for ${trader.wallet.address} to cover future gas costs`)
        return false
    }

    console.log('Estimating gas for buy swap...')

    let data = trader.router.interface.encodeFunctionData('swapExactETHForTokensSupportingFeeOnTransferTokens', [
        0n,
        path,
        trader.wallet.address,
        deadline
    ])


    let buyGasLimit = await provider.estimateGas({
        from: trader.wallet.address,
        to: trader.router.target,
        data: data,
        value: amountIn
    })

    amountIn -= ((buyGasLimit * gasPrice) * 2n)

    if(amountIn < 0){
        await distributeEth(trader.wallet, -1n * (amountIn) * 2n, task)
    }

    // Get expected output amount
    const [, expectedOutput] = await trader.router.getAmountsOut(amountIn, path)
    console.log(`Expected output: ${ethers.formatEther(expectedOutput)} tokens`)
    
    // Calculate minimum output with slippage
    const minOutput = (expectedOutput * BigInt(100 - task.slippage)) / 100n
    console.log(`Minimum output with ${task.slippage}% slippage: ${ethers.formatEther(minOutput)} tokens`)

    console.log(`Executing swap transaction...`)

    // Створюємо raw транзакцію
    data = trader.router.interface.encodeFunctionData('swapExactETHForTokensSupportingFeeOnTransferTokens', [
        minOutput,
        path,
        trader.wallet.address,
        deadline
    ])

    await sendRawTx({
        wallet: trader.wallet, 
        to: trader.router.target, 
        data: data, 
        value: amountIn.toString(), 
        comment: 'Buying tokens'
    }, task)

    return true
}

export async function ready_to_buy(trader: Trader, task: Task): Promise<Trader> {
    if (!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const taskId = task._id.toString()
    const { TraderStatus } = await getConsts()
    let address = trader.wallet.address
    await sendWS({ type: "ready_to_buy", message: `Attempting to buy for trader ${address}`, taskId }, task.socket)
    const buySuccess = await buyTokens(trader, task)
    if (buySuccess) {
        trader.status = TraderStatus.MONITORING
        await sendWS({ type: "ready_to_buy", message: `Successfully bought tokens for ${address}`, taskId }, task.socket)
    } else {
        trader.status = TraderStatus.READY_TO_BUY
        await sendWS({ type: "ready_to_buy", message: `Failed to buy tokens for ${address}`, taskId }, task.socket)
    }
    await updateWallet(address, { address, status: trader.status })
    return trader
}