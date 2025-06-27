<script lang="ts">
    import { toast } from '@zerodevx/svelte-toast';
    import { req } from '$lib/c';
    import UploadFileModal from './UploadFileModal.svelte';
    import CreateFolderModal from './CreateFolderModal.svelte';
    import RenameFileModal from './RenameFileModal.svelte';
    import DeleteConfirmModal from './DeleteConfirmModal.svelte';

    let { s = $bindable() } = $props();
    
    // Track current path and navigation
    let currentPath = $state('/');
    let breadcrumbs = $derived(getPathBreadcrumbs(currentPath));
    let selectedFile = $state<any>(null);
    let fileModals = $state({
        upload: false,
        createFolder: false,
        rename: false,
        delete: false
    });
    
    // File type icons mapping
    const fileIcons = {
        folder: '📁',
        file: '📄',
        image: '🖼️',
        pdf: '📕',
        doc: '📝',
        spreadsheet: '📊',
        archive: '📦',
        code: '📜',
        audio: '🎵',
        video: '🎬',
        unknown: '❓'
    };
    
    // Determine file icon based on type/extension
    function getFileIcon(file: any) {
        if (file.type === 'directory') return fileIcons.folder;
        
        const extension = file.name.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
            return fileIcons.image;
        } else if (['pdf'].includes(extension)) {
            return fileIcons.pdf;
        } else if (['doc', 'docx', 'txt', 'rtf'].includes(extension)) {
            return fileIcons.doc;
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return fileIcons.spreadsheet;
        } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
            return fileIcons.archive;
        } else if (['js', 'ts', 'html', 'css', 'json', 'xml', 'py', 'go', 'java', 'php', 'c', 'cpp'].includes(extension)) {
            return fileIcons.code;
        } else if (['mp3', 'wav', 'ogg', 'flac'].includes(extension)) {
            return fileIcons.audio;
        } else if (['mp4', 'avi', 'mov', 'webm', 'mkv'].includes(extension)) {
            return fileIcons.video;
        }
        
        return fileIcons.file;
    }
    
    // Generate breadcrumbs from path
    function getPathBreadcrumbs(path: any) {
        const parts = path.split('/').filter((p: any) => p);
        const crumbs = [{ name: 'Home', path: '/' }];
        
        let currentPath = '';
        for (const part of parts) {
            currentPath += '/' + part;
            crumbs.push({
                name: part,
                path: currentPath
            });
        }
        
        return crumbs;
    }
    
    // Navigate to a folder
    async function navigateToFolder(path: any) {
        currentPath = path;
        await refreshFiles();
    }
    
    // Refresh file listing
    async function refreshFiles() {
        try {
            s.loading = true;
            const response = await req(`/api/files?path=${encodeURIComponent(currentPath)}`);
            
            if (response && response.status === "success") {
                s.rawdata = response.rawdata;
            } else {
                throw new Error(response.message || 'Failed to fetch files');
            }
        } catch (error) {
            console.error('Error fetching files:', error);
            toast.push('Failed to load files', {
                theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
            });
        } finally {
            s.loading = false;
        }
    }
    
    // Handle file/folder click
    async function handleFileClick(file: any) {
        if (file.type === 'directory') {
            await navigateToFolder(`${currentPath}/${file.name}`.replace(/\/+/g, '/'));
        } else {
            // Preview file or perform default action
            console.log('File clicked:', file);
            // This could open a preview or trigger download
        }
    }
    
    // Open file actions menu
    function openFileActions(file: any, event: any) {
        event.stopPropagation();
        selectedFile = file;
    }
    
    // Handle file upload success
    async function handleUploadSuccess() {
        fileModals.upload = false;
        await refreshFiles();
        toast.push('File uploaded successfully', {
            theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
        });
    }
    
    // Handle folder creation success
    async function handleFolderCreated() {
        fileModals.createFolder = false;
        await refreshFiles();
        toast.push('Folder created successfully', {
            theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
        });
    }
    
    // Handle file/folder rename success
    async function handleRenameSuccess() {
        fileModals.rename = false;
        selectedFile = null;
        await refreshFiles();
        toast.push('Item renamed successfully', {
            theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
        });
    }
    
    // Handle file/folder deletion success
    async function handleDeleteSuccess() {
        fileModals.delete = false;
        selectedFile = null;
        await refreshFiles();
        toast.push('Item deleted successfully', {
            theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
        });
    }
    
    // Download file
    async function downloadFile(file: any) {
        try {
            // Generate download URL
            const downloadUrl = `/api/files/download?path=${encodeURIComponent(`${currentPath}/${file.name}`)}`;
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', file.name);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.push('Failed to download file', {
                theme: { '--toastBackground': '#F56565', '--toastBarBackground': '#C53030' }
            });
        }
    }
</script>

<div class="file-manager">
    <!-- Breadcrumb navigation -->
    <div class="mb-4 flex items-center flex-wrap">
        <div class="breadcrumbs overflow-x-auto pb-2">
            {#each breadcrumbs as crumb, index}
                <span>
                    <button class="btn primary"
                        onclick={() => navigateToFolder(crumb.path)}
                    >
                        {crumb.name}
                    </button>
                    {#if index < breadcrumbs.length - 1}
                        <span class="mx-2 text-gray-400">/</span>
                    {/if}
                </span>
            {/each}
        </div>
    </div>

    <!-- Action buttons -->
    <div class="mb-4 flex flex-wrap gap-2">
        <button class="btn" onclick={() => fileModals.upload = true}>
            Upload File
        </button>
        <button class="btn primary" onclick={() => fileModals.createFolder = true}>
            New Folder
        </button>
        {#if currentPath !== '/'}
            <button class="btn primary" onclick={() => {
                const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                navigateToFolder(parentPath);
            }}>
                Go Up
            </button>
        {/if}
    </div>

    <!-- File listing -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
        {#if s.loading}
            <div class="flex justify-center py-8">
                <div class="spinner" style="width: 3rem; height: 3rem;"></div>
            </div>
        {:else if !s.rawdata || s.rawdata.length === 0}
            <div class="text-center py-10">
                <p class="text-lg font-medium">No files found</p>
                <p class="text-gray-500 mt-2">This folder is empty</p>
            </div>
        {:else}
            <div class="overflow-x-auto">
                <table class="w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each s.rawdata as file}
                            <tr class="hover:bg-gray-50 cursor-pointer" onclick={() => handleFileClick(file)}>
                                <td class="px-6 py-4 whitespace-nowrap text-xl text-center" aria-hidden="true">
                                    {getFileIcon(file)}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="font-medium truncate max-w-xs">
                                        {file.name}
                                    </div>
                                    {#if file.type !== 'directory'}
                                        <div class="text-xs text-gray-500">{file.type || 'File'}</div>
                                    {/if}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {file.type === 'directory' ? '--' : 
                                    file.size < 1024 ? `${file.size} B` :
                                    file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` :
                                    `${(file.size / (1024 * 1024)).toFixed(1)} MB`}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    {file.modifiedAt ? new Date(file.modifiedAt).toLocaleString() : '--'}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap" onclick={e => e.stopPropagation()}>
                                    <div class="relative">
                                        <button class="btn primary" onclick={(e: any) => openFileActions(file, e)}>
                                            Actions
                                        </button>
                                        
                                        {#if selectedFile && selectedFile.name === file.name}
                                            <div class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                                                {#if file.type !== 'directory'}
                                                    <button class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                                                           onclick={() => downloadFile(file)}>
                                                        Download
                                                    </button>
                                                {/if}
                                                <button class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                                                       onclick={() => fileModals.rename = true}>
                                                    Rename
                                                </button>
                                                <button class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                                                       onclick={() => fileModals.delete = true}>
                                                    Delete
                                                </button>
                                            </div>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
    </div>
    
    <!-- File operation modals -->
    <UploadFileModal 
        open={fileModals.upload} 
        currentPath={currentPath}
        onClose={() => fileModals.upload = false}
        onSuccess={handleUploadSuccess}
        {s}
    />
    
    <CreateFolderModal
        open={fileModals.createFolder}
        currentPath={currentPath}
        onClose={() => fileModals.createFolder = false}
        onSuccess={handleFolderCreated}
        {s}
    />
    
    {#if selectedFile}
        <RenameFileModal
            open={fileModals.rename}
            file={selectedFile}
            currentPath={currentPath}
            onClose={() => fileModals.rename = false}
            onSuccess={handleRenameSuccess}
            {s}
        />
        
        <DeleteConfirmModal
            open={fileModals.delete}
            file={selectedFile}
            currentPath={currentPath}
            onClose={() => fileModals.delete = false}
            onSuccess={handleDeleteSuccess}
            {s}
        />
    {/if}
</div>

<style>
    .file-manager {
        width: 100%;
    }
    
    .breadcrumbs {
        white-space: nowrap;
        width: 100%;
        overflow-x: auto;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
        .mb-4.flex {
            gap: 0.5rem;
        }
        
        :global(table th:nth-child(3)),
        :global(table td:nth-child(3)),
        :global(table th:nth-child(4)),
        :global(table td:nth-child(4)) {
            display: none;
        }
    }
</style>
