import { json } from '@sveltejs/kit'
import { 
    getGroupById, 
    getWalletsInGroup, 
    runCreateWallets
} from '$u'
import { verify } from '$lib/s'
import type { Wallet, CustomWallet } from '$u'

// GET /api/wallet-groups/:id/wallets - Get wallets in a group
export async function GET({ params, request }: { params: { id: string }, request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    try {
        const group = await getGroupById(id)
        if (!group) {
            return json({ message: 'Wallet group not found or unauthorized' }, { status: 404 })
        }
        
        const wallets: Wallet[] | CustomWallet[] = await getWalletsInGroup(id)
        
        // Hide private keys from response
        const safeWallets = wallets.map(wallet => ({
            ...wallet,
            privateKey: undefined
        }))
        
        return json(safeWallets)
    } catch (error) {
        console.error('Error fetching wallets:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// POST /api/wallet-groups/:id/wallets - Create wallets in a group
export async function POST({ params, request }: { params: { id: string }, request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    
    try {
        const group = await getGroupById(id)
        if (!group) {
            return json({ message: 'Wallet group not found or unauthorized' }, { status: 404 })
        }
        
        const data = await request.json()
        const count = data.count || 1
        const timeout = data.timeout || 0
        
        if (count < 1 || count > 100) {
            return json({ message: 'Invalid wallet count (1-100 allowed)' }, { status: 400 })
        }
        
        const wallets = await runCreateWallets(count, id, timeout)
        
        const safeWallets = wallets.map(wallet => ({
            ...wallet,
            privateKey: undefined
        }))
        
        return json(safeWallets, { status: 201 })
    } catch (error) {
        console.error('Error creating wallets:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}
