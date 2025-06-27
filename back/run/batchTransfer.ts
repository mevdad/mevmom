import { ethers } from "ethers";
import fs from "fs";
import { getProvider } from "../lib/u";
import dotenv from "dotenv";
dotenv.config();

const BATCH_SIZE = 2; // Process in batches of 20 to avoid rate limiting

async function batchTransfer() {
    const group = {
        name: "Test",
        rpc_url: process.env.RPC_BSC1 || '',
        userId: "0"
    };

    const jsonPath = '/pot/exel/output.json';
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // The destination wallet where all funds will be sent
    const depositWalletPk = process.env.DEPOSIT_WALLET_PK;
    if (!depositWalletPk) {
        throw new Error('DEPOSIT_WALLET_PK is not defined in environment variables');
    }
    
    const provider = await getProvider(group);
    const depositWallet = new ethers.Wallet(depositWalletPk, provider);
    
    // Filter wallets with sufficient balance
    const walletsWithBalance = json.filter((item: any) => 
        item.balanceETH && item.balanceETH > 0.0005 // Minimum balance to cover gas
    );
    
    console.log(`Found ${walletsWithBalance.length} wallets with sufficient balance`);
    
    // Process in smaller batches
    for (let i = 0; i < walletsWithBalance.length; i += BATCH_SIZE) {
        const batch = walletsWithBalance.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(walletsWithBalance.length/BATCH_SIZE)}`);
        
        // Process wallets in parallel but with rate limiting
        await Promise.all(batch.map(async (item: any, index: number) => {
            try {
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, index * 200));
                
                // Prepare wallet
                if (!item.PrivateKey.startsWith('0x')) item.PrivateKey = '0x' + item.PrivateKey;
                const wallet = new ethers.Wallet(item.PrivateKey, provider);
                
                // Get current balance
                const balance = await provider.getBalance(wallet.address);
                
                // Calculate gas costs
                const feeData = await provider.getFeeData();
                const gasPrice = (feeData.gasPrice || feeData.maxFeePerGas || 5000000000n);
                const gasLimit = 21000n; // Standard transaction gas
                const gasCost = gasLimit * gasPrice;
                
                // Calculate transfer amount (total balance minus gas cost)
                const transferAmount = balance > gasCost ? balance - gasCost : 0n;
                if (transferAmount > 0n && item.balanceETH > 0.0005) {
                    // Create transaction
                    const tx = {
                        to: depositWallet.address,
                        value: transferAmount,
                        gasLimit,
                        gasPrice,
                        nonce: await provider.getTransactionCount(wallet.address),
                        chainId: "56"
                    };
                    
                    // Send transaction
                    const signedTx = await wallet.signTransaction(tx);
                    const txResponse = await provider.broadcastTransaction(signedTx);
                    
                    console.log(`Transferred ${ethers.formatEther(transferAmount)} ETH from ${wallet.address} to ${depositWallet.address}, tx: ${txResponse.hash}`);
                    
                    // Wait for confirmation
                    await txResponse.wait(1);
                }
                
                
                
            } catch (error) {
                console.error(`Error processing wallet: ${error}`);
            }
        }));
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log("Batch transfer completed");
}

batchTransfer().catch(console.error);
