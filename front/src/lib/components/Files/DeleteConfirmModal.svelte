<script lang="ts">
    import { req } from '$lib/c';
    import Modal from '$c/Common/Modal.svelte';
    
    let { 
        open = $bindable(),
        file = null,
        currentPath = '',
        onClose = () => {},
        onSuccess = () => {},
        s = $bindable()
    } = $props();
    
    let deleting = $state(false);
    let error = $state('');
    
    async function handleDelete() {
        try {
            deleting = true;
            error = '';
            
            const response = await req("/api/files/delete", "POST", {
                path: `${currentPath}/${file.name}`.replace(/\/+/g, '/')
            });
            
            if (response && response.status === 'success') {
                onSuccess();
            } else {
                throw new Error(response.message || 'Delete failed');
            }
        } catch (err: any) {
            console.error('Error deleting:', err);
            error = err.message || 'Failed to delete';
        } finally {
            deleting = false;
        }
    }
    
    $effect(() => {
        if (!open) {
            error = '';
        }
    });
</script>

<Modal opn={open}>
    <div class="text-center">
        <svg class="mx-auto mb-4 text-gray-400 w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        
        <h3 class="mb-5 text-lg font-normal text-gray-500">
            Are you sure you want to delete this {file?.type === 'directory' ? 'folder' : 'file'}?
        </h3>
        
        {#if file}
            <p class="mb-5 text-sm text-gray-700">
                This will permanently delete "{file.name}"{file?.type === 'directory' ? ' and all its contents' : ''}.
            </p>
        {/if}
        
        {#if error}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md text-left">
                {error}
            </div>
        {/if}
        
        <div class="flex justify-center gap-4">
            <button class="btn" color="alternative" onclick={onClose()}>
                Cancel
            </button>
            <button class="btn primary" color="red" onclick={handleDelete} disabled={deleting}>
                {#if deleting}
                    Deleting...
                {:else}
                    Yes, delete it
                {/if}
            </button>
        </div>
    </div>
</Modal>
