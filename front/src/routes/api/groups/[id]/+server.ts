import { json } from '@sveltejs/kit'
import { 
    getGroupById, 
    updateGroup, 
    deleteGroup
} from '$u'
import { verify } from '$lib/s'

// GET /api/wallet-groups/:id - Get a specific wallet group by ID
export async function GET({ params, request }: { params: { id: string }, request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    try {
        const group = await getGroupById(id)
        if (!group) {
            return json({ message: 'Wallet group not found' }, { status: 404 })
        }
        
        return json(group)
    } catch (error) {
        console.error('Error fetching wallet group:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// PUT /api/wallet-groups/:id - Update a wallet group
export async function PUT({ params, request }: { params: { id: string }, request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    try {
        const data = await request.json()
        const group = await getGroupById(id)
        if (!group) {
            return json({ message: 'Wallet group not found' }, { status: 404 })
        }
        
        const updatedGroup = await updateGroup(id, {
            name: data.name,
            description: data.description
        })
        
        return json(updatedGroup)
    } catch (error) {
        console.error('Error updating wallet group:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// DELETE /api/wallet-groups/:id - Delete a wallet group
export async function DELETE({ params, request }: { params: { id: string }, request: Request }) {
    const user = await verify(request)
    if (!user) return json({ message: 'Unauthorized' }, { status: 401 })
    const { id } = params
    try {
        await deleteGroup(id, typeof user !== 'string' ? user.userId : "")
        return json({ message: 'Wallet group deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting wallet group:', error)
        return json({ message: 'Server error', error: error.message }, { status: 500 })
    }
}
