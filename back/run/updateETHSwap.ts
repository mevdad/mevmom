import { ponziContract, getDepositWallet, getProvider, getConsts, sendRawTx } from "../lib/u"
import type { Task } from "../lib/u"

export async function updateETHSwap() {
    const { PONZI_WALLET_PK } = await getConsts()
    const task: Task = {
        title: "updateETHSwap",
        description: "updateETHSwap",
        status: "pending",
        dueDate: new Date(),
        type: "updateETHSwap",
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
        sell_price: "0"
    }
    const provider = await getProvider()
    const depositWallet = await getDepositWallet(task)
    const ponzi = await ponziContract(task)
    if(ponzi === null || depositWallet === null) return
    console.log(await provider.getBalance(depositWallet.address))
    await sendRawTx({
        wallet: depositWallet, 
        to: ponzi.target, 
        data: ponzi.interface.encodeFunctionData('changeETHToSwap', ["7000000000000000"]),
        p: 2
    }, task)
}

updateETHSwap().catch(console.error)