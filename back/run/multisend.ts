import { multisenderContract, getDepositWallet, getConsts, sendRawTx } from '../lib/u'
import type { Task } from '../lib/u'

export async function multisend(addrs: string[] = [], amounts: bigint[] = [], task: Task) {
    if(addrs.length === 0 || amounts.length === 0) return
    const { MULTISENDER_ADDRESS } = await getConsts()
    const mulCon = await multisenderContract(task)
    if(!mulCon) return
    const data = mulCon.interface.encodeFunctionData('mulSndEth', [addrs, amounts])
    let value = 0n
    for(let amount of amounts) {
        value += amount
    }

    console.log(value.toString(), data)

    const depositWallet = await getDepositWallet(task)
    if(depositWallet !== null && MULTISENDER_ADDRESS) {
        await sendRawTx({
            wallet: depositWallet, 
            to: MULTISENDER_ADDRESS, 
            data: data,
            value: value.toString()
        }, task, 5n)
    }
}