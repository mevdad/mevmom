import { ethers } from "ethers"

export interface Wallet {
    address: string
    status?: string
    deposit_amount?: string
    privateKey?: string
    groupId?: string
}

export interface CustomWallet {
    address: string
    privateKey: string
}

export interface Trader {
    wallet: ethers.Wallet
    token: ethers.Contract
    router: ethers.Contract
    status: string
    depositAmount: string | number | bigint
}

export interface RawTx {
    wallet: ethers.Wallet
    to: string | ethers.Addressable
    value?: string
    data?: string
    comment?: string
    p?: number
}

export interface Task {
    userId: string
    title: string
    description: string
    dueDate: Date
    type: string
    walletsCount: number
    customWallets: CustomWallet[]
    deposit_wallet_pk: string
    slippage: number
    distribution_percentage: number
    token: string
    sell_price: string
    transactionTimeout: number
    status?: string
    createdAt?: Date
    _id?: string
    socket?: any,
    groupId: string
}

export interface Log {
    time?: number
    message?: string
    data?: any
    taskId: string
    type?: string
    _id?: string
}

export interface Provider {
    chain: string
    url: string
    userId: string
    name: string
    _id?: string
}

export interface User {
    email: string
    password: string
    createdAt?: Date
    _id?: string
}

export interface Group {
    _id?: string
    name: string
    description?: string
    userId: string | null
    network?: string
    rpc_url?: string
    createdAt?: Date
    updatedAt?: Date
}