import { ethers } from "ethers"
import type { Task } from "../const"
import { getConsts, getDepositWallet, getProvider } from "../u"

export async function tokenContract(wallet: ethers.Wallet | null = null, task: Task): Promise<ethers.Contract|null> {
    const C = await getConsts()
    return C.TOKEN_ADDRESS ? new ethers.Contract(C.TOKEN_ADDRESS, C.tokenAbi, wallet === null ? await getDepositWallet(task) : wallet) : null
}

export async function routerContract(wallet: ethers.Wallet | null = null, task: Task): Promise<ethers.Contract|null> {
    const C = await getConsts()
    return C.ROUTER_ADDRESS ? new ethers.Contract(C.ROUTER_ADDRESS, C.routerAbi, wallet === null ? await getDepositWallet(task) : wallet) : null
}

export async function permitContract(task: Task) {
    const C = await getConsts()
    return C.PERMIT2 ? new ethers.Contract(C.PERMIT2, C.permitAbi, await getDepositWallet(task)) : null
}

export async function ponziContract(task: Task): Promise<ethers.Contract|null> {
    const C = await getConsts()
    return C.TOKEN_ADDRESS ? new ethers.Contract(C.TOKEN_ADDRESS, C.ponziAbi, await getDepositWallet(task)) : null
}

export async function multisenderContract(task: Task) {
    const C = await getConsts()
    return C.MULTISENDER_ADDRESS ? new ethers.Contract(C.MULTISENDER_ADDRESS, C.multiSenderAbi, await getDepositWallet(task)) : null
}

export async function getTokenPairAddress(): Promise<string|null> {
    const C = await getConsts()
    const provider = await getProvider()
    const router = C.ROUTER_ADDRESS ? new ethers.Contract(C.ROUTER_ADDRESS, C.routerAbi, provider) : null
    
    if(router !== null) {
        // Get factory address from router
        const factoryAddress = await router.factory()
        
        // Get WETH address from router
        const wethAddress = await router.WETH()
        
        // Get factory contract
        const factory = new ethers.Contract(factoryAddress, C.factoryAbi, provider)
        
        // Get pair address between TOKEN and WETH
        const pairAddress = await factory.getPair(C.TOKEN_ADDRESS, wethAddress)

        console.log("Pair address:", pairAddress)
        
        return pairAddress
    } else {
        console.error("Router address is null. Please check your configuration.")
        return null
    }
}
