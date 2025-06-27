import { getConsts, getProvider } from "../u"
import type { Trader, Task } from "../u"

export async function checkTokenBalance(trader: Trader): Promise<bigint> {
    const tokenBalance = await trader.token.balanceOf(trader.wallet.address)
    return tokenBalance
}

export async function checkProfit(trader: Trader, task: Task) {
    const { TraderStatus } = await getConsts()
    const provider = await getProvider()
    const initialEthBalance = await provider.getBalance(trader.wallet.address)
    const WETH = await trader.router.WETH()
    const tokenBalance = await checkTokenBalance(trader)
    
    if (trader.status !== TraderStatus.MONITORING || tokenBalance === 0n) {
        return 0
    }

    const amounts = await trader.router.getAmountsOut(
        tokenBalance,
        [task.token, WETH]
    )

    const invested = (BigInt(trader.depositAmount) - initialEthBalance)
    const currentEthPercent = Number(amounts[1] * 100n / invested)
    const profitPercentage = currentEthPercent - 100
    
    return profitPercentage
}
