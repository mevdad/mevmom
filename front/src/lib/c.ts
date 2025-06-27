import { toast } from '@zerodevx/svelte-toast'
import { goto } from '$app/navigation'
import { page } from '$app/state'

export const chains = [
    { value: '1', name: 'Ethereum Mainnet' },
    { value: '56', name: 'Binance Smart Chain' },
    { value: '8453', name: 'Base Mainnet' }
]

export const TForm = {
    filterProviders: [], 
    title: '',
    description: '',
    dueDate: '',
    type: 'BUY',
    walletsCount: 1,
    transactionTimeout: 2,
    customWallets: false,
    customWalletsFile: null,
    error: '',
    deposit_wallet_pk: '',
    slippage: 2,
    distribution_percentage: 1,
    sell_price: 0,
    token: '',
    network: '8453',
    rpc_url: ''
}

export const State = {
    auth: false,
    loading: true,
    user: null,
    tasks: [],
    task: null,
    ps: [],
    TForm: TForm,
    autht: 0,
    groups: [],
    err: '',
    m: {
        c: { opn: false, nm: '', desc: '', err: '', subm: false },
        e: { opn: false, nm: '', desc: '', err: '', subm: false },
        d: { opn: false, nm: '', desc: '', err: '', subm: false },
        a: { opn: false, nm: '', desc: '', err: '', subm: false }
    },
    p: {
        ps: {
            name: '',
            url: '',
            chain: '1',
            s: ''
        }
    },
    group: null,
    socket: null,
    rawdata: [],
    Menu: {
        Main: [
            { href: '/#features', name: 'Features' },
            { href: '/#pricing', name: 'Pricing' },
            { href: '/#faq', name: 'FAQ' } 
        ], 
        Auth: [
            { href: '/tasks', name: 'Tasks' },
            { href: '/files', name: 'Files' },
            { href: '/providers', name: 'Providers' },
            { href: '/groups', name: 'Groups' }
        ]
    },
    notAuth: [
        '/login',
        '/register',
        '/forgot',
        '/reset',
    ],
    success: '',
    submitting: false
}

export const req = async (url: string, method: string = "GET", body: any = undefined, h: any = undefined) => {
    let headers: any = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
    if(h) {
        for(const k in h) {
            headers[k] = h[k]
        }
    }
    try {
        return await (await fetch(url, { 
            method,
            headers,
            body: headers['Content-Type'] === 'application/json' ? JSON.stringify(body) : body
        })).json()
    } catch (e) {
        toast.push('Error loading wallet groups', { 
            theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
        })
        console.error('Error:', e)
        return []
    }
}

export function copy(text: string) {
    navigator.clipboard.writeText(text).then(
        () => {
            toast.push('Copied to clipboard', {
                theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
            })
        },
        () => {
            toast.push('Failed to copy', {
                theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
            })
        }
    )
}

export const checkAuth = async (s: any) => {
    s.err = ''
    if(localStorage.getItem('token') && (Date.now() - s.autht) >= 5000) {
        const d = await req('/api/auth/check', "POST")
        s.auth = d.success && d.user !== null
        if(s.auth)
            s.user = d.user
            s.autht = Date.now()
            if(d.user && d.user.password) d.user.password = undefined
    }
    s.loading = false
    
    if(s.auth && s.notAuth.includes(page.url.pathname))
        await goto('/tasks')
    else if(!s.auth && ![...s.notAuth, '/'].includes(page.url.pathname))
        await goto('/login')

    return s
}