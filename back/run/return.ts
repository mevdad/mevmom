import { getProvider, checkNull } from "../lib/u"
import { ethers } from "ethers"
import type * as EthersType from 'ethers'
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

export async function ret() {
    let count = 0;
    const group = {
        name: "Test",
        rpc_url: process.env.RPC_BSC1 || '',
        userId: "0"
    }
    const depositWalletPk = process.env.DEPOSIT_WALLET_PK;
    if (!depositWalletPk) {
        throw new Error('DEPOSIT_WALLET_PK is not defined in environment variables');
    }
    const depositWallet = new ethers.Wallet(depositWalletPk, await getProvider(group));
    let total = 0;
    // Read the existing JSON file
    const jsonPath = '/pot/exel/output.json';
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

    for(const item of json) {
        
        // if privatekey start with 0x, remove it
        if (!item.PrivateKey.startsWith('0x')) item.PrivateKey = '0x' + item.PrivateKey;
        const wallet = new ethers.Wallet(item.PrivateKey, await getProvider(group))
        const provider = await getProvider(group)
        let balance = await provider.getBalance(wallet.address)
        console.log(`Processing wallet: ${wallet.address}, balance: ${balance.toString()}`)

        // Add balance in ETH (float format) to the wallet data
        item.balanceETH = parseFloat(ethers.formatEther(balance));
        total += item.balanceETH;
        item.balanceWei = balance.toString();
        json[count] = item; // Update the JSON object with the new balance
        count++;
        
        
        
        // if(depositWallet !== null && item.balanceETH > 0.0001) {
        //     try {
        //         const raw = {
        //             from: wallet.address,
        //             to: depositWallet.address,
        //             value: balance * 98n / 100n, // Sending 95% of the balance to cover gas costs
        //             data: "0x",
        //             gasLimit: 0n,
        //             gasPrice: 0n,
        //             chainId: "56",
        //             nonce: await provider.getTransactionCount(wallet.address)
        //         }
                
        //         let gasLimit: bigint = 0n
        //         gasLimit = await provider.estimateGas(raw)
            
        //         const feeData = await provider.getFeeData();

        //         const gasPrice = checkNull(feeData.gasPrice) + checkNull(feeData.maxFeePerGas) + checkNull(feeData.maxPriorityFeePerGas)
            
        //         raw.gasLimit = gasLimit * 2n
        //         raw.gasPrice = gasPrice
                
        //         // Sign and send the transaction with retry mechanism
        //         const signedTx = await wallet.signTransaction(raw)
        //         const txHashPromise = provider.send("eth_sendRawTransaction", [signedTx])
        //         const timeoutPromise = new Promise((_, reject) => {
        //             setTimeout(() => reject(new Error("RPC tipmeout reached")), 30000)
        //         })
                
        //         // Race the transaction against the timeout
        //         const txHash = await Promise.race([txHashPromise, timeoutPromise])
        //         console.log(`Transaction sent successfully, hash: ${txHash}`)
        //         let receipt: EthersType.TransactionReceipt | null = null
        //         const startTime = Date.now()
                
        //         // Poll for receipt until timeout
        //         while (receipt === null) {
        //             if (Date.now() - startTime > 30000) {
        //                 throw new Error("Receipt timeout reached")
        //             }
                    
        //             receipt = await provider.getTransactionReceipt(txHash)
                
        //             if (!receipt) {
        //                 await new Promise(resolve => setTimeout(resolve, 2000)) // Poll every 2 seconds
        //             } else if (receipt.status === 0) {
        //                 console.error("tx reverted:", receipt)
        //                 throw new Error(`tx reverted`)
        //             }
        //         }
        //     } catch (error) {
        //         console.error(`Error processing wallet ${wallet.address}:`, error);
        //         continue; // Skip to the next wallet
        //     }
                
        // }
        
        console.log(`${count}/${json.length}`)
    }
    
    // Write the updated JSON with balance information back to the file
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
    console.log(`Updated wallet balances saved to ${jsonPath}`);
    console.log(`Total balance processed: ${total} ETH`);
}

ret().then(() => {
    console.log("Done")
}).catch(err => {
    console.error("Error:", err)
});