<script lang="ts">
    import { onMount } from 'svelte'
    import { page } from '$app/state'
    import { toast } from '@zerodevx/svelte-toast'
    import type { Group, Wallet } from '$u'
    import { req, copy, checkAuth } from '$lib/c'

    const { id } = page.params
    let { s = $bindable() } = $props()
    
    const TradeStatus = {
        READY_TO_BUY: 'READY_TO_BUY',
        MONITORING: 'MONITORING',
        SELLING: 'SELLING',
        RETURNING_ETH: 'RETURNING_ETH',
        COMPLETED: 'COMPLETED',
        NEED_DEPOSIT: 'NEED_DEPOSIT',
        CLOSED: 'CLOSED',
        LOCKED: 'LOCKED'
    }
    
    let wallets = $state<Wallet[]>([])
    let walletsToAdd = $state(1)
    let creatingWallets = $state(false)
    
    async function group (b: boolean = false) {
        s.group = s.groups.find((g: Group) => g._id && g._id.toString() === id) || null
        if(s.group === null && !b)
            s.groups = await req(`/api/groups`)
            await group(!b)
    }
    
    async function addWallets() {
        if (walletsToAdd < 1 || walletsToAdd > 100) {
            toast.push('Please enter a number between 1 and 100', {
                theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
            })
            return
        }
        
        try {
            creatingWallets = true
            const response = await fetch(`/api/groups/${id}/wallets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: walletsToAdd })
            })
            
            if (!response.ok) {
                throw new Error('Failed to create wallets')
            }
            
            const newWallets: never[] = await response.json()
            if(Array.isArray(newWallets) && newWallets.length > 0) wallets.push(...newWallets)
            
            s.m.a.opn = false
            toast.push(`Created ${newWallets.length} new wallets successfully`, {
                theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
            })
        } catch (error) {
            toast.push('Error creating wallets', { 
                theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
            })
            console.error('Error:', error)
        } finally {
            creatingWallets = false
        }
    }
    
    onMount(async () => {
        s = await checkAuth(s)
        if(s.auth) {
            if(s.groups.length === 0 || s.group === null) await group()
            if(s.group === null)
                toast.push('Group not found', {
                    theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
                })
        }   
    })
</script>

<div class="container mx-auto">
    <div class="mb-6">
        <a href="/groups" class="text-blue-600 hover:underline">
            &larr Back to Wallet Groups
        </a>
    </div>
    
    {#if s.group === null}
        <div class="flex justify-center my-8">
            <div class="spinner" style="width: 3rem; height: 3rem;"></div>
        </div>
    {:else}
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-2xl font-bold">{s.group.name}</h1>
                {#if s.group.desc}
                    <p class="text-gray-600 mt-1">{s.group.desc}</p>
                {/if}
            </div>
            <button class="btn primary" onclick={() => s.m.a.opn = true}>
                Add Wallets
            </button>
        </div>
        
        <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-gray-50 p-4 rounded">
                    <div class="text-sm text-gray-500">Total Wallets</div>
                    <div class="text-2xl font-bold">{0}</div>
                </div>
                {#if s.group.createdAt}
                <div class="bg-gray-50 p-4 rounded">
                    <div class="text-sm text-gray-500">Created</div>
                    <div>{new Date(s.group.createdAt).toLocaleString()}</div>
                </div>
                {/if}
                {#if s.group.updatedAt}
                <div class="bg-gray-50 p-4 rounded">
                    <div class="text-sm text-gray-500">Last Updated</div>
                    <div>{new Date(s.group.updatedAt).toLocaleString()}</div>
                </div>
                {/if}
            </div>
        </div>
        
        <h2 class="text-xl font-semibold mb-4">Wallets in this Group</h2>
        
        {#if s.loading}
            <div class="flex justify-center my-8">
                <div class="spinner" style="width: 3rem; height: 3rem;"></div>
            </div>
        {:else if wallets.length === 0}
            <div class="bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div class="text-center py-10">
                    <h3 class="mb-2 text-lg font-medium">No wallets in this group</h3>
                    <p class="mb-4 text-gray-500">Add wallets to this group to manage them together.</p>
                    <button class="btn primary" onclick={() => s.m.a.opn = true}>
                        Add Wallets
                    </button>
                </div>
            </div>
        {:else}
            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each wallets as wallet}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap truncate max-w-xs">{wallet.address}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                                    {wallet.status === TradeStatus.READY_TO_BUY ? 'bg-green-100 text-green-800' : 
                                     wallet.status === TradeStatus.NEED_DEPOSIT ? 'bg-yellow-100 text-yellow-800' : 
                                     'bg-indigo-100 text-indigo-800'}">
                                    {wallet.status}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">{wallet.deposit_amount || '0'}</td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <button class="btn primary" onclick={() => copy(wallet.address)}>
                                    Copy Address
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            
            <div class="mt-4">
                <p class="text-gray-500 text-sm">
                    Showing {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}
                </p>
            </div>
        {/if}
    {/if}
</div>

<!-- Add Wallets Modal -->
<div class={`${s.m.a.opn ? 'block' : 'hidden'} fixed z-10 inset-0 overflow-y-auto`} aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen p-4 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div class="text-center">
                    <h3 class="mb-5 text-lg font-normal text-gray-500">
                        Add Wallets to Group
                    </h3>
                    
                    <div class="mb-6">
                        <label for="wallets-count" class="mb-2 block text-sm font-medium text-gray-700">Number of wallets to create</label>
                        <input
                            type="number"
                            id="wallets-count"
                            bind:value={walletsToAdd}
                            min="1"
                            max="100"
                            required
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p class="text-xs text-gray-500 mt-1">You can create up to 100 wallets at once</p>
                    </div>
                    
                    <div class="flex justify-center gap-4">
                        <button class="btn" onclick={() => s.m.a.opn = false}>
                            Cancel
                        </button>
                        <button class="btn primary" onclick={addWallets}>
                            {#if creatingWallets}
                                <div class="spinner-sm inline-block mr-2"></div> Creating...
                            {:else}
                                Create Wallets
                            {/if}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .spinner-sm {
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-left-color: white;
        border-radius: 50%;
        width: 1rem;
        height: 1rem;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>