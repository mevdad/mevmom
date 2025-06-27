<script lang="ts">
    import { toast } from '@zerodevx/svelte-toast'
    import { req } from '$lib/c'
    import Modal from '$c/Common/Modal.svelte'

    const { s = $bindable() } = $props()

    function reset() {
        s.m.c.nm = ''
        s.m.c.desc = ''
        s.m.c.subm = false
        s.m.c.err = ''
    }
    
    async function submit(e: Event) {
        e.preventDefault()
        if (s.m.c.nm) {
            s.m.c.err = 'Group name is required'
            return
        }
        
        try {
            s.m.c.subm = true
            s.m.c.err = ''
            
            const group = await req('/api/groups', 'POST', { name: s.m.c.nm, description: s.m.c.desc })
            
            s.groups.push(group)
            s.m.c.opn = false
            toast.push('Wallet group created successfully', {
                theme: { '--toastBackground': '#48BB78', '--toastBarBackground': '#2F855A' }
            })
            reset()
        } catch (e: any) {
            s.m.c.err = e.message || 'An error occurred while creating the group'
            console.error('Error creating wallet group:', e)
        } finally {
            s.m.c.subm = false
        }
    }
</script>


<Modal bind:opn={s.m.c.opn}>
    <div class="text-left">
        <h3 class="mb-5 text-lg font-medium">Create New Wallet Group</h3>
        
        {#if s.m.c.err}
            <div class="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
                {s.m.c.err}
            </div>
        {/if}
        
        <form onsubmit={(e) => submit(e)}>
            <div class="mb-4">
                <label for="group-name" class="mb-2">Group Name</label>
                <input
                    type="text"
                    id="group-name"
                    name="group-name"
                    placeholder="Enter group name"
                    bind:value={s.m.c.nm}
                    required
                />
            </div>
            
            <div class="mb-6">
                <label for="group-description" class="mb-2">Description (optional)</label>
                <textarea
                    id="group-description"
                    name="group-description"
                    placeholder="Enter description"
                    bind:value={s.m.c.desc}
                    rows={3}
                ></textarea>
            </div>
            
            <div class="flex justify-end space-x-3">
                <button class="btn" color="alternative" onclick={() => s.m.c.opn = false}>Cancel</button>
                <button class="btn primary" type="submit" color="blue" disabled={s.m.c.subm}>
                    {#if s.m.c.subm}
                        Creating...
                    {:else}
                        Create Group
                    {/if}
                </button>
            </div>
        </form>
    </div>
</Modal>