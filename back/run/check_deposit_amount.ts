import { ethers } from "ethers"
import { basicLoad, getProvider, getConsts, getTaskById } from "../lib/u"

async function checkDepositAmounts() {
    const taskId = process.argv[2]
    const task = await getTaskById(taskId)
    if (!task || !task._id) {
        console.error('Invalid task or task ID')
        return
    }
    const { TraderStatus } = await getConsts()
    const provider = await getProvider(task)
    // Read wallets file
    const data = await basicLoad(task)
        
    console.log('Checking deposit amounts for all wallets...')
    // filter out wallets that are not in the "COMPLETED" status
    data.wallets = data.wallets.filter((wallet: any) => wallet.status !== TraderStatus.COMPLETED)

    // Go through each wallet and update deposit amount
    for (const wallet of data.wallets) {
        const balance = await provider.getBalance(wallet.address)
        wallet.deposit_amount = balance.toString()
        console.log(`Updated ${wallet.address}: ${ethers.formatEther(balance)} ETH`)
    }
    // Save updated wallets data
    // await wrFile(loadData.data)
    console.log('All wallet deposit amounts have been updated')
}

// Run the check
checkDepositAmounts().catch(console.error)
