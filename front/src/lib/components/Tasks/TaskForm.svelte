<script lang="ts">
    import { chains, TForm, req } from '$lib/c'
    import Tooltip from '$c/Common/Tooltip.svelte';
    let { add, s = $bindable() } = $props()
    import { onMount } from 'svelte'
    import type { Group } from '$u'

    let filterProviders: any[] = $state([])

    async function submit(e: Event) {
        e.preventDefault()
        let walletsData = []
        const tf = s.TForm
        if (tf.customWalletsFile) {
            try {
                const text = await tf.customWalletsFile.text()
                walletsData = JSON.parse(text)
                // Validate wallet format
                if (!Array.isArray(walletsData) || !walletsData.every(w => 
                    w.address && w.privateKey && 
                    typeof w.address === 'string' && 
                    typeof w.privateKey === 'string'
                )) {
                    throw new Error('Invalid wallet format')
                }
            } catch (e: any) {
                console.error(e)
                return
            }
        }

        await add(tf)
        s.TForm = TForm
    }

    onMount(async () => {
        s.err = ''
        s.success = ''
        if(s.auth && s.ps.length === 0)
            s.ps = await req('/api/providers')
            fProviders()
    })

    function fProviders() {
        filterProviders = []
        const ps = s.ps.filter((provider: any) => provider.chain.toLowerCase().includes(s.TForm.network.toLowerCase()))
        for (let i = 0; i < ps.length; i++) {
            filterProviders.push({ value: ps[i].url, name: ps[i].name })
        }
    }
</script>

<form onsubmit={(e) => submit(e)} class="py-3">
    <div class="grid grid-cols-2 gap-3">
        <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Title</label>
            <input
                type="text"
                id="title"
                bind:value={s.TForm.title}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>

        <div>
            <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea
                id="description"
                bind:value={s.TForm.description}
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            ></textarea>
        </div>

        <div>
            <label for="dueDate" class="block text-sm font-medium text-gray-700">Due Date</label>
            <input
                type="datetime-local"
                id="dueDate"
                bind:value={s.TForm.dueDate}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>

        <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Token</label>
            <input
                type="text"
                id="token"
                bind:value={s.TForm.token}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>
 
        <div class="col-span-2">
            <label for="groupId" class="block text-sm font-medium text-gray-700">Wallets Group</label>
            <select
                id="groupId"
                bind:value={s.TForm.groupId}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
                {#each s.groups.map((group: Group) => {
                    return { value: group._id, name: group.name }
                }) as item}
                    <option value={item.value}>{item.name}</option>
                {/each}
            </select>
        </div>

        <div class="col-span-2">
            <label for="type" class="block text-sm font-medium text-gray-700">Operation Type</label>
            <select
                id="type"
                bind:value={s.TForm.type}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
                <option value="COUNTERTRADE">COUNTERTRADE</option>
            </select>
        </div>

        <div class="flex items-center" style="user-select: none">
            <input type="checkbox" id="customWallets" bind:checked={s.TForm.customWallets} />
            <label for="customWallets" class="text-sm font-medium">Generate New Wallets</label>
        </div>

        <div class="grid grid-cols-1 gap-1" style="min-height: 62px">
            {#if s.TForm.customWallets}
                <div>
                    <label for="walletsCount" class="block text-sm font-medium text-gray-700">№ of Wallets</label>
                    <input
                        name="walletsCount"
                        type="number"
                        bind:value={s.TForm.walletsCount}
                        min="1"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            {:else}
                
                
                <Tooltip text='Upload a JSON file containing an array of wallets with address and privateKey fields.'>
                    <div id="b1">
                        <label for="customWalletsFile" class="block text-sm font-medium text-gray-700">Custom Wallets File (JSON)</label>
                        <input 
                            type="file"
                            name="customWalletsFile"
                            accept=".json,.csv"
                            onchange={(e) => s.TForm.customWalletsFile = (e.target as HTMLInputElement)?.files?.[0] || null}
                            class="mt-1 block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-medium
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                        />
                    </div>
                </Tooltip>
            {/if}
            
        </div>
  
        <div>
            <label for="deposit_wallet_pk" class="block text-sm font-medium text-gray-700">Deposit Wallet Private Key</label>
            <input
                type="password"
                name="deposit_wallet_pk"
                bind:value={s.TForm.deposit_wallet_pk}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>

        <div>
            <label for="slippage" class="block text-sm font-medium text-gray-700">Slippage (%)</label>
            <input
                type="number"
                name="slippage"
                bind:value={s.TForm.slippage}
                step="0.1"
                min="0"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>

        <div>
            <label for="distribution_percentage" class="block text-sm font-medium text-gray-700">Distribution Percentage (%)</label>
            <input
                type="number"
                name="distribution_percentage"
                bind:value={s.TForm.distribution_percentage}
                min="0"
                max="100"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>

        {#if s.TForm.type === 'SELL'}
            <div>
                <label for="sell_price" class="block text-sm font-medium text-gray-700">Sell Price</label>
                <input
                    type="number"
                    name="sell_price"
                    bind:value={s.TForm.sell_price}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
        {/if}

        <div>
            <label for="timeout" class="block text-sm font-medium text-gray-700">Tx Timeout (seconds)</label>
            <input
                type="number"
                id="timeout"
                bind:value={s.TForm.transactionTimeout}
                min="1"
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
        </div>
        
        <div>
            <label for="network" class="block text-sm font-medium text-gray-700">Network</label>
            <select
                name="network"
                onchange={fProviders}
                bind:value={s.TForm.network}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
                {#each chains as item}
                    <option value={item.value}>{item.name}</option>
                {/each}
            </select>
        </div>

        <div>
            <label for="rpc_url" class="block text-sm font-medium text-gray-700">RPC URL</label>
            <select
                name="rpc_url"
                bind:value={s.TForm.rpc_url}
                required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
                {#each filterProviders as item}
                    <option value={item.value}>{item.name}</option>
                {/each}
            </select>
        </div>
    </div>

    <div class="grid grid-cols-1 mt-4">
        <button type="submit" class="btn primary w-full">
            Create Task
        </button>
    </div>
</form>