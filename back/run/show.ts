import { 
    getWallets, getWalletByAddress, getWalletsByStatus, getLastDistributed, getLastSwap, getGroupById, getActiveWallets, getProvider, getAlchemy, NumToHex, getTaskById
} from "../lib/u"
import { ethers } from "ethers"
import fs from 'fs'
import type { Trader, Group, Task } from "../lib/u"

async function showWallets() {
    const taskId = process.argv[4] ? process.argv[4] : process.argv[3]
    if(!taskId) {
        console.log("Please provide a task id to get wallets for")
        return false
    }
    const task: Task = await getTaskById(taskId)
    const group: Group = await getGroupById(task.groupId.toString())
    const provider = await getProvider()
    const alchemy = await getAlchemy()

    if(!process.argv[2]) { 
        console.log("Please provide a command (wallets, logs, wallet, status)") 
        return false 
    }
    const wallets = await getWallets(group)
    if(process.argv[2] === 'wallets'){
        
        
        if(!process.argv[3]) {
            console.log("error: no task id entered")
            return false
        } else {
            if(process.argv[3] === 'active') {
                const traders = await getActiveWallets(wallets.wallets, task)
                console.log(traders)
            } else if(process.argv[3] === 'count') {
                console.log(wallets.wallets.length)
            } else if(process.argv[3] === 'save') {
                // save wallets to file
                fs.writeFileSync('wallets.json', JSON.stringify(wallets.wallets, null, 2))
                console.log("wallets saved to wallets.json")
            } else {
                console.log(wallets)
            }
        }
    } else if(process.argv[2] === 'wallet'){
        if(!process.argv[3]) { 
            console.log("Please provide an address to get wallet info") 
            return false
        }
        const wallet = await getWalletByAddress(process.argv[3])
        console.log(wallet)
    } else if(process.argv[2] === 'status'){
        if(!process.argv[3]) { 
            console.log("Please provide a status to get wallet info") 
            return false
        } 
        const status = process.argv[3]
        const wallets = await getWalletsByStatus(status)
        if(process.argv[4] && process.argv[4] === 'count') {
            console.log(`Wallets with status: ${status}`, wallets.length)
        } else {
            console.log(wallets)
        }
    } else if(process.argv[2] === 'cycle'){
        if(!wallets) {
            console.log("No wallets found")
            return false
        }
        console.log("currentCycle:", wallets.currentCycle)
    } else if(process.argv[2] === 'balance'){
        let totalBalance = 0n
        let wllts: Trader[] = []
        if(!wallets) {
            console.log("No wallets found")
            return false
        }
        if(!process.argv[3]) {
            wllts = wallets.wallets
        } else {
            if(process.argv[3] === 'active') {
                wllts = await getActiveWallets(wallets.wallets, task)
            }
        }

        for (let i = 0; i < wllts.length; i++) {
            const wallet = wllts[i].wallet
            if(wallet === null) {
                continue
            }
            const balance = await provider.getBalance(wallet.address)
            totalBalance += balance
            console.log(`${wallet.address } wallet balance: ${ethers.formatEther(balance)} ETH`)
        }
        
        console.log(`Total balance: ${ethers.formatEther(totalBalance)} ETH`)
    } else if(process.argv[2] === 'ponzi'){
        const lastDistributed = await getLastDistributed()
        const lastSwap = await getLastSwap()
        // console log in date format
        console.log("lastDistributed:", new Date(lastDistributed))
        console.log("lastSwap:", new Date(lastSwap))
        console.log("current time:", new Date(), new Date().getMinutes())
    } else if(process.argv[2] === 'transfers'){
        // @ts-ignore
        const transfers = await alchemy.core.getAssetTransfers({
            fromBlock: NumToHex(0),
            excludeZeroValue: false,
            contractAddresses: [task.token]
        })
        for(let i = 0; i < transfers.transfers.length; i++) {
            const value = transfers.transfers[i].rawContract.value
            if(value === null) {
                continue
            }
            const amount = ethers.formatEther(BigInt(value).toString())
            console.log(transfers.transfers[i], amount)
        }
    }
    process.exit(0)
}

showWallets().catch(console.error)