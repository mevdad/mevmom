import { getMongo } from '../u'

export const updateLastDistributed = async (timestamp: number) => {
    const { m } = await getMongo()
    await m.Config.updateOne(
        { key: 'lastDistributed' },
        { value: timestamp },
        { upsert: true }
    )
}

export const getLastDistributed = async () => {
    const { m } = await getMongo()
    const result = await m.m.Config.findOne({ key: 'lastDistributed' })
    return result ? parseInt(result.value) : Date.now()
}

export const updateLastSwap = async (timestamp: number) => {
    const { m } = await getMongo()
    await m.Config.updateOne(
        { key: 'lastSwap' },
        { value: timestamp },
        { upsert: true }
    )
}

export const getLastSwap = async () => {
    const { m } = await getMongo()
    const result = await m.Config.findOne({ key: 'lastSwap' })
    return result ? parseInt(result.value) : Date.now()
}

export const updateLastWatchBlock = async (block: string) => {
    const { m } = await getMongo()
    await m.Config.updateOne(
        { key: 'lastWatchBlock' },
        { value: block },
        { upsert: true }
    )
}

export const getLastWatchBlock = async () => {
    const { m } = await getMongo()
    const result = await m.Config.findOne({ key: 'lastWatchBlock' })
    return result ? parseInt(result.value) : 0
}
