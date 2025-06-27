import { returnEthToDeposit, updateWallet, getConsts, sendWS } from "../u"
import type { Trader, Task } from "../u"

export async function return_eth(trader: Trader, task: Task): Promise<Trader> {
    if(!task || !task._id) {
        throw new Error('Invalid task or task ID')
    }
    const taskId = task._id.toString()
    const { TraderStatus } = await getConsts()
    let address = trader.wallet.address
    await sendWS({ type: "return_eth", message: `Returning ETH to deposit for ${address}`, taskId }, task.socket)
    await returnEthToDeposit(trader, task)
    trader.status = TraderStatus.COMPLETED
    await sendWS({ type: "return_eth", message: `Trader ${address} successfully completed trading`, taskId }, task.socket)
    await updateWallet(address, { address, status: trader.status })
    return trader
}