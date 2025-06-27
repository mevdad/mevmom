<script lang="ts">
    import { req } from '$lib/c';
    import Modal from '$c/Common/Modal.svelte';
    
    let { 
        open = $bindable(),
        currentPath = '',
        onClose = () => {},
        onSuccess = () => {},
        s = $bindable()
    } = $props();
    
    let folderName = $state('');
    let creating = $state(false);
    let error = $state('');
    
    async function handleCreateFolder(e: any) {
        e.preventDefault();
        
        if (!folderName || folderName.trim() === '') {
            error = 'Please enter a folder name';
            return;
        }
        
        try {
            creating = true;
            error = '';
            
            const response = await req("/api/files", "POST", {
                p: currentPath,
                type: 'directory',
                name: folderName
            });
            
            if (response && response.status === 'success') {
                folderName = '';
                onSuccess();
            } else {
                throw new Error(response.message || 'Failed to create folder');
            }
        } catch (err: any) {
            console.error('Error creating folder:', err);
            error = err.message || 'Failed to create folder';
        } finally {
            creating = false;
        }
    }
    
    $effect(() => {
        if (!open) {
            folderName = '';
            error = '';
        }
    });
</script>

<Modal opn={open}>
    <div class="text-left">
        <h3 class="mb-5 text-lg font-medium">Create New Folder</h3>
        
        {#if error}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
                {error}
            </div>
        {/if}
        
        <form onsubmit={handleCreateFolder}>
            <div class="mb-4">
                <label for="folder-name" class="mb-2 block text-sm font-medium text-gray-700">Folder Name</label>
                <input
                    type="text"
                    id="folder-name"
                    placeholder="Enter folder name"
                    bind:value={folderName}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <p class="text-xs text-gray-500 mt-1">Current path: {currentPath}</p>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button class="btn" onclick={onClose()}>Cancel</button>
                <button class="btn primary" type="submit" disabled={creating}>
                    {#if creating}
                        Creating...
                    {:else}
                        Create Folder
                    {/if}
                </button>
            </div>
        </form>
    </div>
</Modal>
