<script lang="ts">
    import { onMount } from 'svelte'
    import { checkAuth, req } from '$lib/c';
    import FileManager from './FileManager.svelte';
    
    let { s = $bindable() } = $props()

    const getRawData = async () => {
        const j = await req("/api/files")
        j.status === "success" ? s.rawdata = j.rawdata : console.error("Error fetching data:", j.message)
        s.loading = false
    }

    onMount(async () => {
        s = await checkAuth(s)
        if(s.auth) await getRawData()
    })
</script>

<div class="container mx-auto py-8">
    {#if s.auth}
        <h1 class="text-2xl font-bold mb-6">File Manager</h1>
        <FileManager bind:s={s} />
    {:else}
        <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <p class="text-sm text-yellow-700">
                        Please log in to access the file manager.
                    </p>
                </div>
            </div>
        </div>
    {/if}
</div>
