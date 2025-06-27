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
    
    let file = $state<any>(null);
    let uploading = $state(false);
    let error = $state('');
    
    async function handleUpload(e: any) {
        e.preventDefault();
        
        if (!file) {
            error = 'Please select a file to upload';
            return;
        }
        
        try {
            uploading = true;
            error = '';
            
            const formData = new FormData();
            formData.append('p', currentPath);
            formData.append('type', 'file');
            formData.append('name', file.name);
            formData.append('file', file);
            
            const response = await req(
                "/api/files", 
                "POST", 
                formData
            );
            
            if (response && response.status === 'success') {
                file = null;
                onSuccess();
            } else {
                throw new Error(response.message || 'Upload failed');
            }
        } catch (err: any) {
            console.error('Error uploading file:', err);
            error = err.message || 'Failed to upload file';
        } finally {
            uploading = false;
        }
    }
    
    $effect(() => {
        if (!open) {
            file = null;
            error = '';
        }
    });
</script>

<Modal opn={open}>
    <div class="text-left">
        <h3 class="mb-5 text-lg font-medium">Upload File</h3>
        
        {#if error}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
                {error}
            </div>
        {/if}
        
        <form onsubmit={handleUpload}>
            <div class="mb-4">
                <label for="file-upload" class="mb-2 block text-sm font-medium text-gray-700">Select File</label>
                <input
                    type="file"
                    id="file-upload"
                    onchange={(e: any) => file = e.target.files[0]}
                    required
                    class="mb-2 block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-medium
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
                <p class="text-xs text-gray-500">Current path: {currentPath}</p>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button class="btn" onclick={onClose()}>Cancel</button>
                <button class="btn primary" type="submit" disabled={uploading}>
                    {#if uploading}
                        Uploading...
                    {:else}
                        Upload
                    {/if}
                </button>
            </div>
        </form>
    </div>
</Modal>
