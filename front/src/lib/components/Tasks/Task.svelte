<script lang="ts">
    import { page } from '$app/state'
    import { onMount } from 'svelte'
    import { req, checkAuth } from '$lib/c'
    import { toast } from '@zerodevx/svelte-toast'

    let { s = $bindable() } = $props()
    const { id } = page.params

    async function task (b: boolean = false) {
        s.task = s.tasks.find((t: any) => t._id && t._id.toString() === id) || null
        if(s.task === null && !b)
            s.tasks = await req(`/api/tasks`)
            await task(!b)
    }

    onMount(async () => {
        s = await checkAuth(s)
        if(s.auth) {
            if(s.tasks.length === 0 || s.task === null) await task()
            if(s.group === null)
                toast.push('Group not found', {
                    theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
                })
        }   
    })
</script>

<div class="container">
    {#if s.loading}
        <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    {:else if s.err !== null}
        <div class="bg-red-50 border-l-4 border-red-400 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-red-700">{s.err}</p>
                </div>
            </div>
        </div>
    {:else if s.task}
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">{s.task.title}</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">{s.task.description}</p>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Operation Type</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.type}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Due Date</dt>
                        <dd class="mt-1 text-sm text-gray-900">
                            {new Date(s.task.dueDate).toLocaleString()}
                        </dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Wallets Count</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.walletsCount}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Transaction Timeout</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.transactionTimeout} seconds</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Status</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.status}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Network</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.network || 'N/A'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">RPC URL</dt>
                        <dd class="mt-1 text-sm text-gray-900 break-all">{s.task.rpc_url || 'N/A'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Token</dt>
                        <dd class="mt-1 text-sm text-gray-900 break-all">{s.task.token || 'N/A'}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Slippage</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.slippage || '0'}%</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Distribution Percentage</dt>
                        <dd class="mt-1 text-sm text-gray-900">{s.task.distribution_percentage || '0'}%</dd>
                    </div>
                    {#if s.task.type === 'SELL' && s.task.sell_price !== undefined}
                        <div class="sm:col-span-1">
                            <dt class="text-sm font-medium text-gray-500">Sell Price</dt>
                            <dd class="mt-1 text-sm text-gray-900">{s.task.sell_price}</dd>
                        </div>
                    {/if}
                    {#if s.task.created_at}
                        <div class="sm:col-span-1">
                            <dt class="text-sm font-medium text-gray-500">Created At</dt>
                            <dd class="mt-1 text-sm text-gray-900">
                                {new Date(s.task.created_at).toLocaleString()}
                            </dd>
                        </div>
                    {/if}
                    {#if s.task.updated_at}
                        <div class="sm:col-span-1">
                            <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                            <dd class="mt-1 text-sm text-gray-900">
                                {new Date(s.task.updated_at).toLocaleString()}
                            </dd>
                        </div>
                    {/if}
                    {#if s.task.customWallets && s.task.customWallets.length > 0}
                        <div class="sm:col-span-2">
                            <dt class="text-sm font-medium text-gray-500">Custom Wallets</dt>
                            <dd class="mt-1 text-sm text-gray-900">
                                <div class="max-h-60 overflow-y-auto">
                                    {#each s.task.customWallets as wallet}
                                        <div class="mt-1 border-b last:border-b-0">
                                            <p>Address: {wallet.address}</p>
                                        </div>
                                    {/each}
                                </div>
                            </dd>
                        </div>
                    {/if}
                </dl>
            </div>
            
            <!-- Logs Section -->
            {#if s.task.logs && s.task.logs.length > 0}
                <div class="border-t border-gray-200">
                    <div class="px-4 py-5 sm:px-6">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Task Logs</h3>
                    </div>
                    <div class="px-4 py-3 sm:px-6 max-h-96 overflow-y-auto">
                        <ul class="divide-y divide-gray-200">
                            {#each s.task.logs as log}
                                <li class="py-3">
                                    <div class="flex justify-between">
                                        <p class="text-sm font-medium text-gray-900">
                                            {new Date(log.time).toLocaleString()}
                                        </p>
                                        <p class="text-sm text-gray-900">
                                            {log.type}
                                        </p>
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            {log.level === 'error' ? 'bg-red-100 text-red-800' : 
                                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-green-100 text-green-800'}">
                                            {log.level}
                                        </span>
                                    </div>
                                    <p class="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{log.message}</p>
                                    {#if log.data}
                                        <details class="mt-1">
                                            <summary class="text-xs text-blue-600 cursor-pointer">Additional Data</summary>
                                            <pre class="mt-1 text-xs text-gray-500 overflow-x-auto p-2 bg-gray-50 rounded">{JSON.stringify(log.data, null, 2)}</pre>
                                        </details>
                                    {/if}
                                </li>
                            {/each}
                        </ul>
                    </div>
                </div>
            {/if}
            
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <a 
                    href="/tasks"
                    class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Back to Tasks
                </a>
            </div>
        </div>
        <div id="dexscreener-embed">
            <iframe title="chart" src="https://dexscreener.com/base/{s.task.token}?embed=1&loadChartSettings=1&chartLeftToolbar=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=15"></iframe>
        </div>
    {/if}
</div>

<style>
    #dexscreener-embed {
        position: relative;
        width: 100%;
    }
    #dexscreener-embed iframe {
        width: 100%;
        height: 850px;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .sm\:grid-cols-2 {
            grid-template-columns: 1fr !important;
        }
        
        .sm\:px-6 {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
        }
        
        #dexscreener-embed iframe {
            height: 500px;
        }
        
        .flex.justify-between {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
        }
        
        .max-h-96 {
            max-height: 70vh;
        }
    }
    
    @media (max-width: 480px) {
        .px-4 {
            padding-left: 0.75rem !important;
            padding-right: 0.75rem !important;
        }
        
        #dexscreener-embed iframe {
            height: 400px;
        }
    }
</style>