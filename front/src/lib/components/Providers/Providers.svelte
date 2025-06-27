<script lang="ts">
    import { onMount } from 'svelte'
    import { chains, checkAuth, req } from '$lib/c'
    
    let { s = $bindable() } = $props()

    async function add(e: Event) {
        e.preventDefault()
        try {
            await req('/api/providers', 'POST', s.p.ps)
            s.p.ps = { 
                success: 'Provider added successfully',
                chain: '1', url: '', name: ''
            }
            s.ps = await req('/api/providers')
        } catch (e: any) {
            s.err = e.message
        }
    }

    async function remove(id: any) {
        confirm('Are you sure you want to remove this provider?') && id !== null ? (async () => {
            await req(`/api/providers/${id}`, 'DELETE')
            s.p.ps = { 
                success: 'Provider removed successfully',
                chain: '1', url: '', name: ''
            }
            s.ps = await req('/api/providers')
        })() : s.err = 'Failed to remove provider'
    }

    function name(chain: string) {
        const provider = chains.find((provider) => provider.value === chain)
        return provider ? provider.name : 'Unknown'
    }

    onMount(async () => {
        s = await checkAuth(s)
        if(s.auth && s.ps.length === 0) s.ps = await req('/api/providers')
    })
</script>

<div class="container">
    <h1 class="text-2xl font-bold mb-4">Manage Providers</h1>

    {#if s.err}
        <div class="bg-red-100 text-red-700 p-3 rounded mb-4">{s.err}</div>
    {/if}
    {#if s.p.ps.success}
        <div class="bg-green-100 text-green-700 p-3 rounded mb-4">{s.p.ps.success}</div>
    {/if}

    <form onsubmit={(e) => add(e)} class="mb-6">
        <div class="grid grid-cols-1 gap-3">
            <div>
                <input
                    type="text"
                    bind:value={s.p.ps.name}
                    placeholder="Name"
                    required
                    class="border p-2 rounded w-full"
                />
            </div>
            
            <div>
                <select
                    name="network"
                    bind:value={s.p.ps.chain}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {#each chains as item}
                        <option value={item.value}>{item.name}</option>
                    {/each}
                </select>
            </div>
            <div>
                <textarea
                    id="url"
                    bind:value={s.p.ps.url}
                    rows="3"
                    placeholder="Provider URL"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
            </div>
        </div>
        <button type="submit" class="mt-4 btn primary">
            Add Provider
        </button>
    </form>

    <ul class="space-y-4">
        {#each s.ps as provider (provider._id)}
            <li class="flex justify-between items-center border p-4 rounded">
                <div>
                    <p><strong>Name:</strong> {provider.name}</p>
                    <p><strong>Chain:</strong> {name(provider.chain)}</p>
                    <p><strong>URL:</strong> {provider.url}</p>
                </div>
                <button onclick={() => remove(provider._id ? provider._id : null)} class="btn danger">
                    Remove
                </button>
            </li>
        {/each}
    </ul>
</div>