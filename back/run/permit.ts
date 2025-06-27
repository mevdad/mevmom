import { getProvider, getDepositWallet, getChainId, getTaskById } from '../lib/u'
import { signPermitSigature } from 'ethers-js-permit'
import { ethers } from 'ethers'
// import { sendRawTx } from './utils/transaction-helper.js'

export async function permit() {
    const taskId = process.argv[2]
    const task = await getTaskById(taskId)
    if (!task || !task._id) {
        console.error('Invalid task or task ID')
        return
    }
    const provider = await getProvider(task)
    const depositWallet = await getDepositWallet(task)
    if(depositWallet === null) return
    const nonce = await provider.getTransactionCount(depositWallet.address)
    const chainId = await getChainId()
    // const permit = await permitContract()
    const token = "0x481de9dedc42af8a5cd2b5bac54d03a06c2a3b00"
    const spender = "0xFdCB5bCf2E687557c83aF9FD91ea44f343685681"
    const sigDeadline = Math.floor(Date.now() / 1000) + 60 * 60 * 24
    const details = {
        chainId: chainId,
        version: '1',
        name: 'Permit2',
        nonce: nonce
    }

    const amount = ethers.parseUnits('2', 18)

    // const signature = await signPermitSigature(
    //     depositWallet, 
    //     depositWallet.address, 
    //     token, 
    //     spender, 
    //     amount, 
    //     sigDeadline, 
    //     details
    // )

    // // Различные варианты форматирования permitted tuple
    // console.log("Варианты форматирования permitted tuple:")
    // console.log("1. Массив: ", [token, amount.toString()])
    
    // // Используем ethers для ABI-кодирования
    // const abiCoder = new ethers.AbiCoder()
    // const encoded = abiCoder.encode(["address", "uint256"], [token, amount])
    // console.log("2. ABI закодированное: ", encoded)
    
    // // Объект с именованными полями
    // console.log("3. Объект: ", {
    //     token: token,
    //     amount: amount.toString()
    // })
    
    // // Как JSON строка
    // console.log("4. JSON строка: ", JSON.stringify({
    //     token: token,
    //     amount: amount.toString()
    // }))

    // // Как обычный объект для функции смарт-контракта
    // const permitData = {
    //     permitted: [token, amount],
    //     nonce: nonce,
    //     deadline: sigDeadline,
    //     transferDetails: {
    //         to: spender,
    //         requestedAmount: amount
    //     },
    //     owner: depositWallet.address,
    //     signature: signature
    // }

    // const permitContract = await permitContract()
    
    // console.log("5. Для вызова смарт-контракта: ", permitData)
    process.exit()
}

permit().catch(console.error)