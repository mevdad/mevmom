import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function verifySignatures() {
    // Load the batch data prepared by prepareSignatures.ts
    const batchDataPath = path.join(__dirname, '..', 'data', 'batchData.json');
    if (!fs.existsSync(batchDataPath)) {
        throw new Error(`Batch data not found at ${batchDataPath}. Please run prepareSignatures.ts first.`);
    }
    const batchData = JSON.parse(fs.readFileSync(batchDataPath, 'utf8'));
    
    console.log(`Verifying ${batchData.signers.length} signatures...`);
    console.log(`Message hash: ${batchData.messageHash}`);
    console.log(`Destination address: ${batchData.destination}`);
    
    let validSignatures = 0;
    let invalidSignatures = 0;
    
    // Verify each signature
    for (let i = 0; i < batchData.signers.length; i++) {
        const signer = batchData.signers[i];
        const signature = batchData.signatures[i];
        const amount = batchData.amounts[i];
        
        try {
            // Convert message hash to bytes
            const messageHashBytes = ethers.getBytes(batchData.messageHash);
            
            // Recover signer from signature
            const recoveredAddress = ethers.verifyMessage(messageHashBytes, signature);
            
            // Check if recovered address matches the expected signer
            const isValid = recoveredAddress.toLowerCase() === signer.toLowerCase();
            
            if (isValid) {
                console.log(`✅ Valid signature for ${signer} (Amount: ${ethers.formatEther(amount)} ETH)`);
                validSignatures++;
            } else {
                console.log(`❌ Invalid signature for ${signer}. Recovered address: ${recoveredAddress}`);
                invalidSignatures++;
            }
        } catch (error) {
            console.error(`Error verifying signature for ${signer}:`, error);
            invalidSignatures++;
        }
    }
    
    console.log("\nVerification Summary:");
    console.log(`Valid signatures: ${validSignatures}`);
    console.log(`Invalid signatures: ${invalidSignatures}`);
    
    return {
        valid: validSignatures,
        invalid: invalidSignatures,
        total: batchData.signers.length
    };
}

verifySignatures()
    .then((result) => {
        console.log("Signature verification completed");
        if (result.invalid > 0) {
            console.error(`Warning: ${result.invalid} invalid signatures found!`);
            process.exit(1);
        }
    })
    .catch(error => console.error("Error during verification:", error));
