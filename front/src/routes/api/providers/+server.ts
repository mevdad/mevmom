import { json } from '@sveltejs/kit'
import { getProviders, addProvider } from '$u'
import { verify } from '$lib/s'

export async function GET({ request }: { request: Request }) {
    try {
        const user = await verify(request)
        if(!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
        }
        const providers = await getProviders(typeof user !== 'string' && user !== null ? user.userId : null)
        return json(providers)
    } catch (err) {
        return json({ error: 'Failed to fetch providers' }, { status: 500 })
    }
}

export async function POST({ request }: { request: Request }) {
    try {
        const user = await verify(request)
        const { chain, url, name } = await request.json()
        if(!chain || !url || !name) {
            return json({ error: 'Chain and URL are required' }, { status: 400 })
        }
        const provider = await addProvider({ 
            chain: chain.toString(), 
            url: url.toString(), 
            userId: typeof user !== 'string' && user !== null ? user.userId : null,
            name: name.toString()
        })
        return json(provider)
    } catch (err) {
        return json({ error: 'Failed to add provider' }, { status: 500 })
    }
}
