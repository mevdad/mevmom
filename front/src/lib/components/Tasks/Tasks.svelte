<script lang="ts">
    import { onMount } from 'svelte'
    import TaskForm from './TaskForm.svelte'
    import TaskCard from './TaskCard.svelte'
    import { req, checkAuth } from '$lib/c'
    
    let { s = $bindable() } = $props()

    async function tasks() {
        s.tasks = await req('/api/tasks')
    }

    async function add(event: CustomEvent) {
        s.err = ''
        s.success = ''
        try {
            const taskData = event
            console.log('Task data:', event)

            const response = await req('/api/tasks', "POST", taskData)

            if (response.event) {
                s.success = 'Task created successfully'
                // socketLog.set(await response.json())
                await tasks()
            } else {
                s.err = response.message || 'Failed to create task'
            }
        } catch (err) {
            s.err = 'An error occurred while creating the task'
            console.error(err)
        }
    }

    onMount(async () => {
        s.err = ''
        s.success = ''
        s = await checkAuth(s)
        if(s.auth && s.tasks.length === 0) await tasks()
    })
</script>

<div class="container">
    <div class="flex">
        <!-- Create Task Form -->
        <div style="width:70%" class="gr">
            {#if s.err}
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span class="block sm:inline">{s.err}</span>
                </div>
            {/if}

            {#if s.success}
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span class="block sm:inline">{s.success}</span>
                </div>
            {/if}

            <TaskForm add={add} bind:s={s} />
        </div>
        
        {#if s.tasks && s.tasks.length > 0}
            <div style="width:30%" class="overflow-hidden sm:rounded-md">
                <ul class="divide-y divide-gray-200">
                    {#each s.tasks as task}
                        <TaskCard task={task} />
                    {:else}
                        <li class="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No tasks found
                        </li>
                    {/each}
                </ul>
            </div>
        {/if}
    </div>
</div>