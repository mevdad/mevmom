import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const __dirname = '/pot/scripts'
// Load the contract ABI and bytecode
function loadContractData() {
    const contractPath = path.join(__dirname, '..', 'artifacts', 'contracts', 'BatchTransfer.sol', 'BatchTransfer.json');
    if (!fs.existsSync(contractPath)) {
        throw new Error(`Contract artifact not found at ${contractPath}. Please compile the contract first.`);
    }
    const contractJson = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    return {
        abi: contractJson.abi,
        bytecode: contractJson.bytecode
    };
}

async function deployBatchTransfer() {
    // Load contract data
    const contractData = loadContractData();
    
    // Set up provider and wallet
    const provider = new ethers.JsonRpcProvider(process.env.RPC_BSC1 || '');
    const deployerPk = process.env.DEPOSIT_WALLET_PK;
    if (!deployerPk) {
        throw new Error('DEPLOYER_PRIVATE_KEY is not defined in environment variables');
    }
    
    const deployer = new ethers.Wallet(deployerPk, provider);
    console.log(`Deploying contract from address: ${deployer.address}`);
    
    // Create contract factory
    const factory = new ethers.ContractFactory(contractData.abi, contractData.bytecode, deployer);
    
    // Deploy the contract
    console.log("Deploying BatchTransfer contract...");
    const contract = await factory.deploy();
    
    // Wait for deployment to complete
    const receipt = await contract.deploymentTransaction()?.wait();
    console.log(`Contract deployed at address: ${await contract.getAddress()}`);
    console.log(`Transaction hash: ${receipt?.hash}`);
    
    // Save the contract address for later use
    const deploymentDataPath = path.join(__dirname, '..', 'data', 'deployment.json');
    fs.mkdirSync(path.dirname(deploymentDataPath), { recursive: true });
    
    const deploymentData = {
        contractAddress: await contract.getAddress(),
        deploymentTx: receipt?.hash,
        timestamp: new Date().toISOString(),
        network: (await provider.getNetwork()).chainId.toString()
    };
    
    fs.writeFileSync(deploymentDataPath, JSON.stringify(deploymentData, null, 2));
    console.log(`Deployment data saved to ${deploymentDataPath}`);
    
    return contract;
}

deployBatchTransfer()
    .then(() => console.log("Deployment completed successfully"))
    .catch(error => console.error("Error during deployment:", error));
