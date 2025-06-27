import { getMongo } from '../u'

export const saveTx = async (tx: any) => {
    const { m } = await getMongo()
    await m.Tx.updateOne(
        { transactionHash: tx.transactionHash },
        { data: tx },
        { upsert: true }
    )
}

export const getTx = async (txHash: string) => {
    const { m } = await getMongo()
    const tx = await m.Tx.findOne({ transactionHash: txHash })
    return tx ? tx.data : null
}
