import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

async function executeBatchTransfer() {
    let __dirname = '/pot/scripts';
    // Load the batch data prepared by prepareSignatures.ts
    const batchDataPath = path.join(__dirname, '..', 'data', 'batchData.json');
    if (!fs.existsSync(batchDataPath)) {
        throw new Error(`Batch data not found at ${batchDataPath}. Please run prepareSignatures.ts first.`);
    }
    const batchData = JSON.parse(fs.readFileSync(batchDataPath, 'utf8'));
    
    // Load deployment data
    const deploymentDataPath = path.join(__dirname, '..', 'data', 'deployment.json');
    if (!fs.existsSync(deploymentDataPath)) {
        throw new Error(`Deployment data not found at ${deploymentDataPath}. Please deploy the contract first.`);
    }
    const deploymentData = JSON.parse(fs.readFileSync(deploymentDataPath, 'utf8'));
    
    // Load contract ABI
    const contractPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'BatchTransfer.sol', 'BatchTransfer.json');
    if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract artifact not found at ${contractPath}. Please compile the contract first.`);
    }
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_BSC1 || '');
    const executorPk = process.env.DEPOSIT_WALLET_PK;
    if (!executorPk) {
        throw new Error('EXECUTOR_PRIVATE_KEY is not defined in environment variables');
    }
    
    const executor = new ethers.Wallet(executorPk, provider);
    console.log(`Executing batch transfer from address: ${executor.address}`);
    
    // Connect to the contract
    const contract = new ethers.Contract(
        deploymentData.contractAddress,
        contractJson.abi,
        executor
    );
    
    // Check if executor is the owner
    const owner = await contract.owner();
    if (owner.toLowerCase() !== executor.address.toLowerCase()) {
        throw new Error(`Executor (${executor.address}) is not the contract owner (${owner})`);
    }
    
    // Prepare transaction parameters
    const destination = batchData.destination;
    const signers = batchData.signers;
    const signatures = batchData.signatures;
    const amounts = batchData.amounts;
    const messageHash = batchData.messageHash;
    
    console.log(`Executing batch transfer of ${signers.length} transactions to ${destination}`);
    
    // Calculate total amount
    const totalAmount = amounts.reduce(
        (sum: any, amount: any) => sum + BigInt(amount),
        0n
    );
    console.log(`Total amount to transfer: ${ethers.formatEther(totalAmount)} ETH`);
    
    // Execute batch transfer
    console.log("Executing transaction...");
    const tx = await contract.executeBatchTransfer(
        signers,
        signatures,
        amounts,
        destination,
        messageHash,
        {
            gasLimit: 5000000 // Adjust as needed
        }
    );
    
    console.log(`Transaction submitted: ${tx.hash}`);
    console.log("Waiting for confirmation...");
    
    const receipt = await tx.wait();
    console.log("Transaction confirmed!");
    console.log(`Gas used: ${receipt?.gasUsed}`);
    
    return receipt;
}

executeBatchTransfer()
    .then(() => console.log("Batch transfer executed successfully"))
    .catch(error => console.error("Error during execution:", error));
