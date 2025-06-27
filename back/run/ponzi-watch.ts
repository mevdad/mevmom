import { 
    ponziContract, getPonziWallet, getConsts, sendRawTx, getLastDistributed, updateLastDistributed, getLastSwap, updateLastSwap 
} from "../lib/u"
import type { Task } from "../lib/u"

export async function ponziWatch() {
    const { PONZI_WALLET_PK } = await getConsts()
    const task: Task = {
        title: "ponziWatch",
        description: "ponziWatch",
        status: "pending",
        dueDate: new Date(),
        type: "ponziWatch",
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
    const ponziWallet = await getPonziWallet()
    console.log("Ponzi Watcher started")
    const ponzi = await ponziContract(task)
    if(ponzi === null) return
    let now = Date.now()
    let lastSwap = await getLastSwap()
    let lastDistributed = await getLastDistributed()
    setInterval(async () => {
        console.log("Checking new actions")
        const ETHtoSwap = await ponzi.ETHtoSwap()
        const buyBackBalance = await ponzi.buyBackBalance()
        const bETH = await ponzi.tokensToETH(buyBackBalance)
        // comopare big numbers
        // console.log(ETHtoSwap, bETH, lastSwap, lastDistributed)
            
        console.log(Date.now() - lastSwap, ETHtoSwap, bETH, lastSwap, lastDistributed)

        if((Date.now() - lastSwap) / 1000 >= 5 * 60 && bETH >= ETHtoSwap){
            lastSwap = now
            await updateLastSwap(now)
            console.log("Swapping BuyBack tokens")
            await sendRawTx({
                wallet: ponziWallet, 
                to: ponzi.target, 
                data: ponzi.interface.encodeFunctionData('swapBuyBackTokens', [])
            }, task)
            return
          
        }

        const dBal = await ponzi.distrFeeBalance()
        const deth = await ponzi.tokensToETH(dBal)
        
        // const utilsBal = await provider.getBalance(await ponzi.utils())

        if((deth >= ETHtoSwap && new Date().getMinutes() === 0 && (Date.now() - lastDistributed) / 1000 >= 60)){ 
            console.log("Distributing rewards")
            await sendRawTx({
                wallet: ponziWallet, 
                to: ponzi.target, 
                data: ponzi.interface.encodeFunctionData('distributeRewards', [])
            }, task)
            lastDistributed = now
            await updateLastDistributed(now)
            return
        }
        
    }, 10 * 1000)
    
}

ponziWatch().catch(console.error)