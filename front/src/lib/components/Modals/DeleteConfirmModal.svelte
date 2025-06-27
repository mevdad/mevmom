<script lang="ts">
    import { toast } from '@zerodevx/svelte-toast'
    import { req } from '$lib/c'
    import Modal from '$c/Common/Modal.svelte'

    const { s = $bindable() } = $props()
    s.err = ''
    
    async function del() {
        try {
            s.loading = true
            s.err = ''
            s.groups = await req(`/api/groups/${s.group._id}`, 'DELETE')
            s.groups = s.groups.filter((g: any) => g._id !== s.group._id)
            s.m.d.opn = false
            toast.push('Wallet group deleted successfully', {
                theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
            })
    
        } catch (e: any) {
            s.err = e.message || 'An error occurred while deleting the group'
            console.error('Error deleting wallet group:', e)
        } finally {
            s.loading = false
        }
    }
</script>

<Modal opn={s.m.d.opn}>
    <div class="text-center">
        <svg class="mx-auto mb-4 text-gray-400 w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        
        <h3 class="mb-5 text-lg font-normal text-gray-500">
            Are you sure you want to delete this wallet group?
        </h3>
        
        {#if s.group}
            <p class="mb-5 text-sm text-gray-700">
                This will delete the group "{s.group.name}" and remove the group assignment from all wallets (the wallets themselves won't be deleted).
            </p>
        {/if}
        
        {#if s.err}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md text-left">
                {s.err}
            </div>
        {/if}
        
        <div class="flex justify-center gap-4">
            <button class="btn" color="alternative" onclick={() => s.m.d.opn = false}>
                Cancel
            </button>
            <button class="btn primary" color="red" onclick={del} disabled={s.loading}>
                {#if s.loading}
                    Deleting...
                {:else}
                    Yes, delete it
                {/if}
            </button>
        </div>
    </div>
</Modal>
