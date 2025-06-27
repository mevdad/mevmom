import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

async function prepareSignatures() {
    // Load the JSON file containing wallet keys
    const jsonPath = '/pot/exel/output.json';
    const walletsData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // RPC connection
    const provider = new ethers.JsonRpcProvider(process.env.RPC_BSC1 || '');

    // Set destination wallet from environment variable
    const depositWalletPk = process.env.DEPOSIT_WALLET_PK;
    if (!depositWalletPk) {
        throw new Error('DEPOSIT_WALLET_PK is not defined in environment variables');
    }
    const destinationWallet = new ethers.Wallet(depositWalletPk, provider);
    
    // Minimum balance required to process a wallet (in ETH)
    const MIN_BALANCE = 0.0000008;
    // Gas price for estimation (in wei)
    const GAS_PRICE = ethers.parseUnits("5", "gwei");
    // Standard gas limit for a transfer
    const GAS_LIMIT = 21000n;
    // Gas cost estimation
    const GAS_COST = GAS_PRICE * GAS_LIMIT;
    
    console.log(`Preparing signatures for transfers to ${destinationWallet.address}`);
    console.log(`Minimum balance: ${MIN_BALANCE} ETH`);
    
    // Message to sign - we'll sign the destination address as the message
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(`Batch transfer to ${destinationWallet.address}`));
    console.log(`Message hash to sign: ${messageHash}`);
    
    // Array to store batch transfer data
    const batchData = {
        signers: [] as string[],
        signatures: [] as string[],
        amounts: [] as string[],
        destination: destinationWallet.address,
        messageHash: messageHash
    };

    // Counter for wallets processed
    let processed = 0;
    let totalAmount = 0n;
    
    // Process each wallet
    for (const wallet of walletsData) {
        try {
            
            const pk = wallet.PrivateKey.startsWith('0x') ? wallet.PrivateKey : `0x${wallet.PrivateKey}`;
            const signer = new ethers.Wallet(pk, provider);
            let balance = (await provider.getBalance(wallet.address)) - GAS_COST
            if(balance <= 0n) continue
            console.log(`Processing wallet: ${wallet.address}, balance: ${balance.toString()}`)

        // Add balance in ETH (float format) to the wallet data
            let balanceETH = parseFloat(ethers.formatEther(balance));

            
            if (balanceETH >= MIN_BALANCE) {
                // Sign the message
                const signature = await signer.signMessage(ethers.getBytes(messageHash));
                
                // Add to batch data
                batchData.signers.push(signer.address);
                batchData.signatures.push(signature);
                batchData.amounts.push(balance.toString());
                
                totalAmount += balance;
                processed++;
                
                console.log(`Processed ${signer.address}: ${balanceETH} ETH`);
            }
            
            
        } catch (error) {
            console.error(`Error processing wallet: ${error}`);
        }
    }
    
    console.log(`Total wallets processed: ${processed}`);
    console.log(`Total amount to transfer: ${ethers.formatEther(totalAmount)} ETH`);
    
    // Save batch data to a file
    const batchDataPath = path.join('/pot/scripts', '..', 'data', 'batchData.json');
    fs.mkdirSync(path.dirname(batchDataPath), { recursive: true });
    fs.writeFileSync(batchDataPath, JSON.stringify(batchData, null, 2));
    
    console.log(`Batch transfer data saved to ${batchDataPath}`);
}

prepareSignatures()
    .then(() => console.log("Signature preparation completed"))
    .catch(error => console.error("Error:", error));
