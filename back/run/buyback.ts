import { ponziContract, getDepositWallet, getConsts, sendRawTx } from "../lib/u"
import type { Task } from "../lib/u"
export async function buyBack() {
    const { PONZI_WALLET_PK } = await getConsts()
    const task: Task = {
        title: "BuyBack",
        description: "BuyBack",
        status: "pending",
        dueDate: new Date(),
        type: "BUYBACK",
        walletsCount: 0,
        customWallets: [],
        deposit_wallet_pk: PONZI_WALLET_PK ? PONZI_WALLET_PK : "",
        slippage: 0,
        distribution_percentage: 0,
        transactionTimeout: 0,
        userId: "0",
        createdAt: new Date(),
        _id: "0",
        groupId: "0",
        token: "0x",
        sell_price: "0",
    }
    const ponzi = await ponziContract(task)
    if(ponzi !== null) {
        console.log("Swapping BuyBack")
        const depositWallet = await getDepositWallet(task)
        if(depositWallet === null) return
        await sendRawTx({
            wallet: depositWallet, 
            to: ponzi.target, 
            data: ponzi.interface.encodeFunctionData('performBuyback', [])
        }, task)
        console.log("BuyBack successful")
    }
    process.exit()
}

buyBack().catch(console.error)