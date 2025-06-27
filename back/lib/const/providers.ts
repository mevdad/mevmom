import { ethers } from "ethers"
import { Network, Alchemy } from "alchemy-sdk"
import { getConsts, getGroupById } from "../u"
import type { Task, Group } from "../u"

// Storage for tracking used providers
let usedProviders: string[] = []

export async function setUsedProviders(provider: string) {
    usedProviders.push(provider)
}

export async function removeUsedProviders(provider: string) {
    usedProviders = usedProviders.filter(p => p !== provider)
}

export async function getUsedProviders(): Promise<string[]> {
    return usedProviders
}

export async function getProviderUrl(): Promise<string> {
    const providers_urls: string[] = []
    switch (process.env.NETWORK) {
        case '8453':
            providers_urls.push(process.env.RPC_PROVIDER_BASE ? process.env.RPC_PROVIDER_BASE : '')
            break
        case '1':
            providers_urls.push(process.env.RPC_ETH ? process.env.RPC_ETH : '')
            break
        case '56':
            providers_urls.push(process.env.RPC_BSC1 ? process.env.RPC_BSC1 : '')
            // providers_urls.push(process.env.RPC_BSC2)
            // providers_urls.push(process.env.RPC_BSC3)
            break
    }
    const availableProviders = providers_urls.filter(provider => !usedProviders.includes(provider))
    const provider = availableProviders[Math.floor(Math.random() * availableProviders.length)]
    return provider
}

export async function getProvider(group: Group | undefined = undefined): Promise<ethers.JsonRpcProvider> {
    return new ethers.JsonRpcProvider(!group ? await getProviderUrl() : group.rpc_url)
}

export async function getChainId(task: Task | undefined = undefined): Promise<string> {
    const group = task ? await getGroupById(task.groupId.toString()) : undefined
    const provider = await getProvider(group)
    const network = await provider.getNetwork()
    return network.chainId.toString()
}

export async function getAlchemyNetwork(task: Task | undefined = undefined): Promise<Network|
undefined> {
    const chainId = await getChainId(task)
    switch (chainId) {
        case "8453":
            return Network.BASE_MAINNET
        case "1": 
            return Network.ETH_MAINNET
        case "56":
            return Network.BNB_MAINNET
    }
}

export async function getAlchemy(task: Task | undefined = undefined): Promise<Alchemy> {
    const C = await getConsts()
    const settings = {
        apiKey: C.ALCHEMY_API_KEY,
        network: await getAlchemyNetwork(task),
    }

    return new Alchemy(settings)
}

export async function getDepositWallet(task: Task): Promise<ethers.Wallet|null> {
    const DEPOSIT_WALLET_PK = task.deposit_wallet_pk
    const group = await getGroupById(task.groupId.toString())
    return DEPOSIT_WALLET_PK ? new ethers.Wallet(DEPOSIT_WALLET_PK, await getProvider(group)) : null
}

export async function getMultisendWallet(task: Task) {
    const { MULTISENDER_PK } = await getConsts()
    const group = await getGroupById(task.groupId.toString())
    return MULTISENDER_PK ? new ethers.Wallet(MULTISENDER_PK, await getProvider(group)) : null
}

export async function getPonziWallet() {
    return new ethers.Wallet(process.env.PONZI_WALLET_PK || '', await getProvider())
}
