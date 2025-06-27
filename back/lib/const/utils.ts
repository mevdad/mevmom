import type { Log, RawTx, Task } from "../u"
import { getProvider, getChainId, getOptimalGasPrice, addLog, getGroupById } from '../u'
import type * as EthersType from 'ethers'

/**
 * Converts a number to its hexadecimal representation as a string.
 *
 * @param {number | bigint} num - The number to convert to hexadecimal. 
 *                                If a number is passed, it will be converted to a BigInt internally.
 * @returns {string} The hexadecimal representation of the input number, prefixed with "0x".
 *
 * @throws {TypeError} Throws an error if the input is not a number or bigint.
 */
export function NumToHex(num: number): string {
    return "0x" + BigInt(num).toString(16)
}

export async function sendWS(data: Log, socket: WebSocket | null = null) {
    console.log(data)
    await addLog(data)
    if(socket !== null && socket.readyState === 1) {
        try {
            socket.send(JSON.stringify(data))
        } catch (error) {
            console.error("Error sending data to WebSocket:", error)
        }
    }
}

export async function delay(time: number = 1000) {
    const tf = Math.floor(time * 0.8)
    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (Math.floor(time * 1.2) - tf + 1) + tf)))
}

/**
 * Dynamically import heavy modules
 * @param importFn Function that returns a dynamic import
 */
export async function dynamicImport<T>(importFn: () => Promise<T>): Promise<T> {
  try {
    return await importFn()
  } catch (error) {
    console.error("Failed to dynamically import module:", error)
    throw error
  }
}

// Pre-define ethers type for TypeScript
export type Ethers = typeof EthersType

// Helper for ethers library
export const loadEthers = async (): Promise<Ethers> => {
  const ethers = await dynamicImport(() => import('ethers'))
  return ethers
}

export async function sendRawTransactionWithRetry(signedTx: string, task: Task, timeout = 30000) {
    const group = await getGroupById(task.groupId.toString())
    const prov = await getProvider(group)
    const txHashPromise = prov.send("eth_sendRawTransaction", [signedTx])
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("RPC tipmeout reached")), timeout)
    })
    
    // Race the transaction against the timeout
    const txHash = await Promise.race([txHashPromise, timeoutPromise])
    
    console.log(`Transaction sent successfully, hash: ${txHash}`)
    return txHash
}

export async function waitForTransactionReceiptWithRetry(txHash: string, task: Task, timeout = 60000) {
    // Dynamically import ethers
    await loadEthers()
    const group = await getGroupById(task.groupId.toString())
    const prov = await getProvider(group)
    let receipt: EthersType.TransactionReceipt | null = null
    const startTime = Date.now()
    
    // Poll for receipt until timeout
    while (receipt === null) {
        if (Date.now() - startTime > timeout) {
            throw new Error("Receipt timeout reached")
        }
        
        receipt = await prov.getTransactionReceipt(txHash)
       
        if (!receipt) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // Poll every 2 seconds
        } else if (receipt.status === 0) {
            console.error("tx reverted:", receipt)
            throw new Error(`tx reverted`)
        }
    }
    
    return receipt
}

export async function sendRawTx(obj: RawTx, task: Task, modifier = 2n) {
    const { wallet, to, value = "0", data = null, comment = null} = obj
    const group = await getGroupById(task.groupId.toString())
    const prov = await getProvider(group)
    const chainId = await getChainId(task)
    const raw = {
        from: wallet.address,
        to: to,
        value: value,
        data: data !== null ? data : "0x",
        gasLimit: 0n,
        gasPrice: 0n,
        chainId: chainId,
        nonce: await prov.getTransactionCount(wallet.address)
    }
    
    let gasLimit: bigint = 0n
    gasLimit = await prov.estimateGas(raw)

    const gasPrice = await getOptimalGasPrice(task)

    raw.gasLimit = gasLimit * 2n
    raw.gasPrice = gasPrice
    if(BigInt(value) > 0n && data === null) raw.value = (BigInt(raw.value) - (raw.gasLimit * raw.gasPrice) * modifier).toString()

    if(comment !== null) {
        console.log(comment)
    }
    
    // Sign and send the transaction with retry mechanism
    const signedTx = await wallet.signTransaction(raw)
    const txHash = await sendRawTransactionWithRetry(signedTx, task)
    const r = await waitForTransactionReceiptWithRetry(txHash, task)
    return r
}