<script lang="ts">
    import { onMount } from 'svelte'
    import CreateGroupModal from '$c/Modals/CreateGroupModal.svelte'
    import EditGroupModal from '$c/Modals/EditGroupModal.svelte'
    import DeleteConfirmModal from '$c/Modals/DeleteConfirmModal.svelte'
    import { checkAuth, req } from '$lib/c'
  
    let { s = $bindable() } = $props()
    
    onMount(async () => {
        s = await checkAuth(s)
        if(s.auth && s.groups.length === 0) s.groups = await req('/api/groups')
    })
</script>

<div class="container mx-auto">
    <div class="flex justify-between items-center mb-8 py-8">
        <h1 class="text-2xl font-bold">Wallet Groups</h1>
        <button class="btn primary" onclick={() => s.m.c.opn = true}>Create New Group</button>
    </div>
    
    <div style="padding-bottom: 2rem">
        {#if s.loading}
            <div class="flex justify-center my-8">
                <div class="spinner" style="width: 3rem; height: 3rem;"></div>
            </div>
        {:else if s.groups.length === 0}
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="text-center py-10">
                    <h3 class="mb-2 text-lg font-medium">No wallet groups found</h3>
                    <p class="mb-4 text-gray-500">Create a new wallet group to start managing your wallets efficiently.</p>
                    <button class="btn primary" onclick={() => s.m.c.opn = true}>Create Your First Group</button>
                </div>
            </div>
        {:else}
            <table class="w-full border-collapse">
                <thead>
                    <tr>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Count</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    {#each s.groups as group (group._id)}
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <a href="/groups/{group._id}" class="font-medium text-blue-600 hover:underline">
                                    {group.name}
                                </a>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">{group.description || '-'}</td>
                            <td class="px-6 py-4 whitespace-nowrap"></td>
                            <td class="px-6 py-4 whitespace-nowrap">{new Date(group.createdAt).toLocaleString()}</td>
                            <td class="px-6 py-4 whitespace-nowrap flex space-x-2">
                                <a class="btn" href="/groups/{group._id}">View</a>
                                <button class="btn primary" onclick={() => {
                                    s.group = group
                                    s.m.e.opn = true
                                }}>Edit</button>
                                <button class="btn danger" onclick={() => {}}>Delete</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        {/if}
    </div>
</div>

<!-- Modals -->
<CreateGroupModal bind:s={s}/><EditGroupModal bind:s={s}/><DeleteConfirmModal bind:s={s}/>
