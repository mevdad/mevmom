import { getWalletByAddress, updateWallet, getWalletsByStatus } from "../lib/u"

async function update() {
    if(!process.argv[2] && !process.argv[3]) { 
        console.log("Please provide a key and value to update") 
    }
    if(process.argv[2] === "wallet") {
        if(!process.argv[4] || !process.argv[3]) { 
            console.log("Please provide an address and argument to change") 
        }
        const wallet = await getWalletByAddress(process.argv[3])
        if(!wallet) {
            console.log("Wallet not found")
        }
        wallet[process.argv[4]] = process.argv[5]
        await updateWallet(process.argv[3], wallet)
        console.log("Wallet updated successfully")
    } else if (process.argv[2] === "status") {
        if(!process.argv[4] || !process.argv[3]) { 
            console.log("Please provide an address and argument to change") 
        }
        const data = await getWalletsByStatus(process.argv[3])
        console.log(data)
        for (const wallet of data) {
            wallet.status = process.argv[4]
            await updateWallet(wallet.address, wallet)
        }
        console.log("Wallets updated successfully")
    }
}

update().catch(console.error)