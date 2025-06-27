import { getProvider, checkNull } from "../lib/u";
import { ethers } from "ethers";
import type * as EthersType from 'ethers';
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// Configuration
const BATCH_SIZE = 10; // Process in batches
const MINIMUM_BALANCE = 0.0005; // Minimum balance in ETH to process
const GAS_PERCENTAGE = 5; // Percentage of balance to reserve for gas

export async function optimizedTransfer() {
    const group = {
        name: "Test",
        rpc_url: process.env.RPC_BSC1 || '',
        userId: "0"
    };
    
    const depositWalletPk = process.env.DEPOSIT_WALLET_PK;
    if (!depositWalletPk) {
        throw new Error('DEPOSIT_WALLET_PK is not defined in environment variables');
    }
    
    const provider = await getProvider(group);
    const depositWallet = new ethers.Wallet(depositWalletPk, provider);
    
    // Read the existing JSON file
    const jsonPath = '/pot/exel/output.json';
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Prepare an array of wallets with sufficient balance
    const eligibleWallets = [];
    let totalBalance = 0;
    
    console.log(`Scanning ${json.length} wallets for balances...`);
    
    for (const item of json) {
        if (!item.PrivateKey.startsWith('0x')) item.PrivateKey = '0x' + item.PrivateKey;
        
        // Use cached balance if available, otherwise fetch
        let balance;
        if (item.balanceETH) {
            balance = ethers.parseEther(item.balanceETH.toString());
        } else {
            const wallet = new ethers.Wallet(item.PrivateKey, provider);
            balance = await provider.getBalance(wallet.address);
            // Update the cached balance
            item.balanceETH = parseFloat(ethers.formatEther(balance));
            item.balanceWei = balance.toString();
        }
        
        if (item.balanceETH > MINIMUM_BALANCE) {
            eligibleWallets.push(item);
            totalBalance += item.balanceETH;
        }
    }
    
    console.log(`Found ${eligibleWallets.length} wallets with balance > ${MINIMUM_BALANCE} ETH`);
    console.log(`Total balance to transfer: ${totalBalance.toFixed(4)} ETH`);
    
    // Process in batches
    for (let i = 0; i < eligibleWallets.length; i += BATCH_SIZE) {
        const batch = eligibleWallets.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(eligibleWallets.length/BATCH_SIZE)}`);
        
        // Process each wallet in the batch
        const batchPromises = batch.map(async (item, index) => {
            try {
                // Add delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, index * 300));
                
                const wallet = new ethers.Wallet(item.PrivateKey, provider);
                const balance = await provider.getBalance(wallet.address);
                
                if (balance <= ethers.parseEther(MINIMUM_BALANCE.toString())) {
                    console.log(`Wallet ${wallet.address} balance too low: ${ethers.formatEther(balance)} ETH, skipping`);
                    return;
                }
                
                // Calculate gas costs
                const feeData = await provider.getFeeData();
                const gasPrice = feeData.gasPrice || 5000000000n;
                const gasLimit = 21000n;
                const gasCost = gasPrice * gasLimit;
                
                // Reserve some percentage for gas
                const reserveAmount = balance * BigInt(GAS_PERCENTAGE) / 100n;
                const transferAmount = balance - (reserveAmount > gasCost ? reserveAmount : gasCost);
                
                if (transferAmount <= 0n) {
                    console.log(`Wallet ${wallet.address} insufficient balance after gas reservation`);
                    return;
                }
                
                console.log(`Transferring ${ethers.formatEther(transferAmount)} ETH from ${wallet.address} to ${depositWallet.address}`);
                
                // Create and send transaction
                const tx = await wallet.sendTransaction({
                    to: depositWallet.address,
                    value: transferAmount,
                    gasLimit,
                    gasPrice
                });
                
                console.log(`Transaction sent: ${tx.hash}`);
                
                // Wait for confirmation
                const receipt = await tx.wait(1);
                console.log(`Transaction confirmed: ${receipt?.status === 1 ? 'SUCCESS' : 'FAILED'}`);
                
                // Update balance in the wallet data
                const newBalance = await provider.getBalance(wallet.address);
                item.balanceETH = parseFloat(ethers.formatEther(newBalance));
                item.balanceWei = newBalance.toString();
                
            } catch (error) {
                console.error(`Error processing wallet ${item.address}:`, error);
            }
        });
        
        // Wait for all transactions in batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update the JSON file periodically
        fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2));
        console.log(`Updated wallet data saved to ${jsonPath}`);
    }
    
    console.log("Transfer process completed");
}

optimizedTransfer().catch(console.error);
