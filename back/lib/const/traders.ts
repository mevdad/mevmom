import type { Trader, Task, Wallet } from "../u"
import { 
    createWallets, getConsts, tokenContract, routerContract, getProvider, loadEthers, getGroupById
} from "../u"

export async function basicLoad(task: Task): Promise<{ activeTraders: Trader[], wallets: Wallet[] }> {
    const wallets = await createWallets(task)
    let activeTraders = await setupTraders(wallets, task)
    return { activeTraders, wallets }
}

export async function filterTraders(wallets: Trader[] = [], statuses: string[] = []): Promise<Trader[]> {
    const C = await getConsts()
    return statuses.length === 0 
        ? wallets.filter(w => w.status !== C.TraderStatus.COMPLETED) 
        : wallets.filter(w => statuses.includes(w.status))
}

export async function setupTrader(walletInfo: Wallet, task: Task): Promise<Trader | null> {
    // Dynamically import ethers
    const { ethers } = await loadEthers()
    
    const { TraderStatus } = await getConsts()
    const group = await getGroupById(task.groupId.toString())
    const provider = await getProvider(group)
    
    // Create and connect wallet
    if (!walletInfo.privateKey) {
        console.error(`No private key found for wallet: ${walletInfo.address}`)
        return null
    }
    const wallet = new ethers.Wallet(walletInfo.privateKey, provider)
    
    // Create contracts using ABIs from constants
    const token = await tokenContract(wallet, task)
    const router = await routerContract(wallet, task)

    if(router !== null && token !== null) {
        return { 
            wallet, 
            token, 
            router,
            status: walletInfo.status || TraderStatus.NEED_DEPOSIT,
            depositAmount: walletInfo.deposit_amount || "0"
        }
    } else {
        return null
    }
}

export async function setupTraders(wallets: Wallet[], task: Task) {
    const traders: Trader[] = []
    for(let i = 0; i < wallets.length; i++){
        const trader = await setupTrader(wallets[i], task)
        if(trader !== null) {
            traders.push(trader)
        }
    }
    return await filterTraders(traders)
}

