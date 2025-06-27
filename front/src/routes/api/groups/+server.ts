import { json } from '@sveltejs/kit'
import { 
    createGroup, 
    getGroups, 
    getGroupById, 
    updateGroup, 
    deleteGroup
} from '$u'
import { verify } from '$lib/s'

// GET /api/wallet-groups - Get all wallet groups for a user
export async function GET({ request }: { request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const groups = await getGroups(typeof user !== 'string' ? user.userId : "")
        return json(groups)
    } catch (error) {
        console.error('Error fetching wallet groups:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// POST /api/wallet-groups - Create a new wallet group
export async function POST({ request }: { request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await request.json()
        
        // Validate input
        if (!data.name) {
            return json({ message: 'Group name is required' }, { status: 400 })
        }
        
        const group = await createGroup({
            name: data.name,
            description: data.description || '',
            userId: typeof user !== 'string' ? user.userId : ""
        })
        
        return json(group, { status: 201 })
    } catch (error) {
        console.error('Error creating wallet group:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// PUT /api/wallet-groups/:id - Update a wallet group
export async function PUT({ request, params }: { request: Request, params: { id: string } }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await request.json()
        const { id } = params
        if (!id) {
            return json({ message: 'Group ID is required' }, { status: 400 })
        }
        const existingGroup = await getGroupById(id)
        if (!existingGroup) {
            return json({ message: 'Wallet group not found or unauthorized' }, { status: 404 })
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
export async function DELETE({ request, params }: { request: Request, params: { id: string } }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = params
        if (!id) {
            return json({ message: 'Group ID is required' }, { status: 400 })
        }
        await deleteGroup(id, typeof user !== 'string' ? user.userId : "")
        return json({ message: 'Wallet group deleted successfully' })
    } catch (error: any) {
        console.error('Error deleting wallet group:', error)
        return json({ message: 'Server error', error: error.message }, { status: 500 })
    }
}
