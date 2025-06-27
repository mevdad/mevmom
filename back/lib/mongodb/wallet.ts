import { getMongo, getConsts, getProvider } from '../u'
import type { Group, Wallet as W } from '../u'

export const getWallets = async (group: Group) => {
    const provider = await getProvider(group)
    const { m } = await getMongo()
    const { TraderStatus } = await getConsts()
    const wallets = await m.Wallet.find({ groupId: group._id })
    for (let i = 0; i < wallets.length; i++) {
        if (wallets[i].status === TraderStatus.NEED_DEPOSIT) {
            const balance = await provider.getBalance(wallets[i].address)
            wallets[i].deposit_amount = balance.toString()
            wallets[i].status = balance > 0n ? TraderStatus.READY_TO_BUY : TraderStatus.NEED_DEPOSIT
            await updateWallet(wallets[i].address, { 
                address: wallets[i].address,
                status: wallets[i].status,
                deposit_amount: wallets[i].deposit_amount
            })
        }
    }
    return wallets
}

export const saveWallets = async (wallets: W[]) => {
    const { m } = await getMongo()

    for (const wallet of wallets) {
        if (!wallet.privateKey) {
            console.error(`No private key found for wallet: ${wallet.address}`)
            continue
        }
        await m.Wallet.updateOne(
            { 
                address: wallet.address.toLowerCase()
            },
            { $set: wallet },
            { upsert: true }
        )
    }
}

export const updateWallet = async (address: string, data: W) => {
    const { m } = await getMongo()
    await m.Wallet.updateOne(
        { address: address.toLowerCase() },
        { $set: data },
        { upsert: true }
    )
}

export const newWallet = async (w: W) => {
    const { m } = await getMongo()
    const { TraderStatus } = await getConsts()
    if (!w.privateKey) {
        console.error(`No private key found for wallet: ${w.address}`)
        return null
    }
    const wallet = new m.Wallet({
        address: w.address.toLowerCase(),
        privateKey: w.privateKey.toLowerCase(),
        status: w.status || TraderStatus.NEED_DEPOSIT,
        deposit_amount: w.deposit_amount || "0",
        groupId: w.groupId || null
    })
    await wallet.save()
    return wallet
}

export const getWalletByAddress = async (address: string) => {
    const { m } = await getMongo()
    return await m.Wallet.findOne({ address: address.toLowerCase() })
}

export const getWalletsByStatus = async (status: string) => {
    const { m } = await getMongo()
    return await m.Wallet.find({ status })
}

export const getWalletsByGroup = async (groupId: string) => {
    const { m } = await getMongo()
    return await m.Wallet.find({ groupId })
}

export const removeWalletFromGroup = async (walletId: string) => {
    const { m } = await getMongo()
    return await m.Wallet.findByIdAndUpdate(
        walletId, 
        { $unset: { groupId: "" } }
    )
}
