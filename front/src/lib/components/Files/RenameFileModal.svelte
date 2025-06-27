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
    
    let newName = $state('');
    let renaming = $state(false);
    let error = $state('');
    
    $effect(() => {
        if (file && open) {
            newName = file.name;
        }
    });
    
    async function handleRename(e: any) {
        e.preventDefault();
        
        if (!newName || newName.trim() === '') {
            error = 'Please enter a name';
            return;
        }
        
        try {
            renaming = true;
            error = '';
            
            const response = await req("/api/files/rename", "POST", {
                path: `${currentPath}/${file.name}`.replace(/\/+/g, '/'),
                newName
            });
            
            if (response && response.status === 'success') {
                onSuccess();
            } else {
                throw new Error(response.message || 'Rename failed');
            }
        } catch (err: any) {
            console.error('Error renaming:', err);
            error = err.message || 'Failed to rename';
        } finally {
            renaming = false;
        }
    }
    
    $effect(() => {
        if (!open) {
            error = '';
        }
    });
</script>

<Modal opn={open}>
    <div class="text-left">
        <h3 class="mb-5 text-lg font-medium">
            Rename {file?.type === 'directory' ? 'Folder' : 'File'}
        </h3>
        
        {#if error}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
                {error}
            </div>
        {/if}
        
        <form onsubmit={handleRename}>
            <div class="mb-4">
                <label for="new-name" class="mb-2">New Name</label>
                <input
                    type="text"
                    id="new-name"
                    placeholder="Enter new name"
                    bind:value={newName}
                    required
                />
            </div>
            
            <div class="flex justify-end space-x-3">
                <button class="btn" color="alternative" onclick={onClose()}>Cancel</button>
                <button class="btn primary" type="submit" color="blue" disabled={renaming}>
                    {#if renaming}
                        Renaming...
                    {:else}
                        Rename
                    {/if}
                </button>
            </div>
        </form>
    </div>
</Modal>
