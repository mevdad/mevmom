import { getDepositWallet, getProvider, sendRawTx } from "../u"
import type { Trader, Wallet, Task } from "../u"

export async function distributeEth(wallet: Wallet, amount: bigint, task: Task): Promise<boolean> {
    const depositWallet = await getDepositWallet(task)
    if (depositWallet !== null) {
        await sendRawTx({wallet: depositWallet, to: wallet.address, value: amount.toString() }, task)
        return true
    } else {
        console.error('Deposit wallet is null. Cannot distribute ETH.')
        return false
    }
}

export async function returnEthToDeposit(trader: Trader, task: Task) {
    const group = {
        name: "Test",
        rpc_url: process.env.RPC_BSC1 || '',
        userId: "0"
    }
    const provider = await getProvider(group)
    let balance = await provider.getBalance(trader.wallet.address)

    if (balance <= 0n) {
        console.log('Insufficient balance to cover gas costs for return')
        return
    }

    const depositWallet = await getDepositWallet(task)

    if(depositWallet !== null) {
        await sendRawTx({
            wallet: trader.wallet, 
            to: depositWallet.address, 
            value: balance.toString()
        }, task)
    }
}
