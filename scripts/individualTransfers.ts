import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

// This script performs individual transfers using the same data prepared by prepareSignatures.ts
// This is useful if you want to execute transactions normally without using the batch contract

async function performIndividualTransfers() {
    // Load the batch data prepared by prepareSignatures.ts
    const batchDataPath = path.join(__dirname, '..', 'data', 'batchData.json');
    if (!fs.existsSync(batchDataPath)) {
        throw new Error(`Batch data not found at ${batchDataPath}. Please run prepareSignatures.ts first.`);
    }
    const batchData = JSON.parse(fs.readFileSync(batchDataPath, 'utf8'));
    
    // Load wallet data to get private keys
    const jsonPath = '/pot/exel/output.json';
    const walletsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Create a map of wallet addresses to private keys
    const addressToPrivateKey = new Map();
    for (const wallet of walletsData) {
        if (wallet.address && wallet.PrivateKey) {
            addressToPrivateKey.set(
                wallet.address.toLowerCase(),
                wallet.PrivateKey.startsWith('0x') ? wallet.PrivateKey : `0x${wallet.PrivateKey}`
            );
        }
    }
    
    // Set up provider and destination wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_BSC1 || '');
    const destination = batchData.destination;
    
    console.log(`Starting individual transfers to destination: ${destination}`);
    console.log(`Total wallets to process: ${batchData.signers.length}`);
    
    // Process in batches to avoid overloading the provider
    const BATCH_SIZE = 10;
    let successfulTransfers = 0;
    let failedTransfers = 0;
    let totalTransferred = 0n;
    
    for (let i = 0; i < batchData.signers.length; i += BATCH_SIZE) {
        const batch = batchData.signers.slice(i, i + BATCH_SIZE);
        
        console.log(`Processing batch ${Math.floor(i/BATCH_SIZE) + 1}/${Math.ceil(batchData.signers.length/BATCH_SIZE)}`);
        
        // Process transactions in this batch concurrently
        const promises = batch.map(async (address, index) => {
            try {
                const signerIndex = batchData.signers.indexOf(address);
                const amount = batchData.amounts[signerIndex];
                
                // Get private key for this address
                const privateKey = addressToPrivateKey.get(address.toLowerCase());
                if (!privateKey) {
                    console.error(`Private key not found for address: ${address}`);
                    failedTransfers++;
                    return;
                }
                
                const wallet = new ethers.Wallet(privateKey, provider);
                
                // Create transaction
                const tx = {
                    to: destination,
                    value: BigInt(amount),
                    gasLimit: 21000,
                    maxFeePerGas: ethers.parseUnits("5", "gwei"),
                    maxPriorityFeePerGas: ethers.parseUnits("1", "gwei"),
                    type: 2,
                };
                
                // Send transaction
                console.log(`Sending ${ethers.formatEther(amount)} ETH from ${wallet.address} to ${destination}`);
                const response = await wallet.sendTransaction(tx);
                
                console.log(`Transaction submitted: ${response.hash}`);
                
                // Wait for confirmation with timeout
                const receipt = await Promise.race([
                    response.wait(1),
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout waiting for receipt")), 30000))
                ]);
                
                console.log(`Transaction confirmed: ${response.hash}`);
                
                successfulTransfers++;
                totalTransferred += BigInt(amount);
                
                // Add delay between transactions in the same batch
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error processing transfer for address ${address}:`, error);
                failedTransfers++;
            }
        });
        
        // Wait for all transactions in this batch to complete
        await Promise.allSettled(promises);
        
        // Add delay between batches
        console.log(`Batch completed. Waiting before processing next batch...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log("\nTransfer Summary:");
    console.log(`Successful transfers: ${successfulTransfers}`);
    console.log(`Failed transfers: ${failedTransfers}`);
    console.log(`Total amount transferred: ${ethers.formatEther(totalTransferred)} ETH`);
}

performIndividualTransfers()
    .then(() => console.log("Individual transfers completed"))
    .catch(error => console.error("Error during execution:", error));
