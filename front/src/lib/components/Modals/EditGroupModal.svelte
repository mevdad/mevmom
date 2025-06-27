<script lang="ts">
    import { toast } from '@zerodevx/svelte-toast'
    import type { Group } from '$u'
    import { req } from '$lib/c'
    import Modal from '$c/Common/Modal.svelte'

    const { s = $bindable() } = $props()
    
    async function submit(e: Event) {
        e.preventDefault()
        if (!s.m.e.nm) {
            s.m.e.err = 'Group name is required'
            return
        }
        
        try {
            s.m.e.subm = true
            s.m.e.err = ''
            
            const g = await req(`/api/groups/${s.group._id}`, 'PUT', { 
                name: s.m.e.nm, 
                description: s.m.e.desc 
            })
    
            s.groups = s.groups.map((gr: Group) => gr._id === g._id ? g : gr)
            s.m.e.opn = false
            toast.push('Wallet group updated successfully', {
                theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
            })
        } catch (e: any) {
            s.m.e.err = e.message || 'An error occurred while updating the group'
            console.error('Error updating wallet group:', e)
        } finally {
            s.m.e.subm = false
        }
    }
</script>

<Modal opn={s.m.e.opn}>
    <div class="text-left">
        <h3 class="mb-5 text-lg font-medium">Edit Wallet Group</h3>
        
        {#if s.m.e.err}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
                {s.m.e.err}
            </div>
        {/if}
        
        <form onsubmit={(e) => submit(e)}>
            <div class="mb-4">
                <label for="group-name" class="block mb-2 text-sm font-medium text-gray-700">Group Name</label>
                <input
                    type="text"
                    id="group-name"
                    placeholder="Enter group name"
                    bind:value={s.m.e.nm}
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>
            
            <div class="mb-6">
                <label for="group-description" class="block mb-2 text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea
                    id="group-description"
                    placeholder="Enter description"
                    bind:value={s.m.e.desc}
                    rows={3}
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button class="btn" onclick={() => s.m.e.opn = false}>Cancel</button>
                <button class="btn primary" type="submit" disabled={s.m.e.subm}>
                    {#if s.m.e.subm}
                        Saving...
                    {:else}
                        Save Changes
                    {/if}
                </button>
            </div>
        </form>
    </div>
</Modal>
