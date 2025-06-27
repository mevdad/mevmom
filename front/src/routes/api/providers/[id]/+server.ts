import { json } from '@sveltejs/kit'
import { removeProvider } from '$u'
import { verify } from '$lib/s'

export async function DELETE({ request, params }: { params: { id: string }, request: Request }) {
    try {
        const user = await verify(request)
        if(!user) {
            return json({ error: 'Unauthorized' }, { status: 401 })
        }
        await removeProvider(params.id)
        return json({ message: 'Provider removed successfully' })
    } catch (err) {
        return json({ error: 'Failed to remove provider' }, { status: 500 })
    }
}
