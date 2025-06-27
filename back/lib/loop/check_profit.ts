import { checkProfit, getConsts, sendWS, delay, updateWallet } from "../u"
import type { Trader, Task } from "../u"

export async function chckProfit(activeTraders: Trader[], i: number, task: Task): Promise<Trader[]> {
    if (!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const taskId = task._id.toString()
    const { TAKE_PROFIT_PERCENTAGE, TraderStatus } = await getConsts()
    let address = activeTraders[i].wallet.address
    const profitPercent = await checkProfit(activeTraders[i])
    await sendWS({ type: "check_profit", message: `Checking profit for ${address}: ${profitPercent}% (Target: ${TAKE_PROFIT_PERCENTAGE}%)`, taskId })
    if (profitPercent >= TAKE_PROFIT_PERCENTAGE) {
        await sendWS({ type: "check_profit", message: `Take profit triggered for ${address} (${profitPercent}%)`, taskId })
        activeTraders[i].status = TraderStatus.SELLING
    }

    await updateWallet(address, { address: address, status: activeTraders[i].status })
    await delay(100, 200)
    return activeTraders
}