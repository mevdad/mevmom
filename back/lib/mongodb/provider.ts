import { getMongo } from '../u'
import type { Provider as P } from '../u'

export const addProvider = async (providerData: P) => {
    const { m } = await getMongo()
    const provider = new m.Provider(providerData)
    await provider.save()
    return provider
}

export const getProviders = async (userId: string, chain: string = '') => {
    const { m } = await getMongo()
    return await m.Provider.find(chain === '' ? { userId } : { userId, chain })
}

export const removeProvider = async (id: string) => {
    const { m } = await getMongo()
    return await m.Provider.findByIdAndDelete(id)
}
