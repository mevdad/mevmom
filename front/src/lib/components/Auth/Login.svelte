<script lang="ts">
    import { goto } from '$app/navigation'
    import { checkAuth } from '$lib/c'
    import { onMount } from 'svelte'

    let { s = $bindable() } = $props()
    let password = $state('')

    async function submit(e: Event) {
        e.preventDefault()
        s.loading = true
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: s.email, password })
            })
            const data = await response.json()
            s.loading = false
            if (response.ok) {
                if(data.token) localStorage.setItem('token', data.token)
                await goto('/tasks')
            } else {
                s.err = data.message || 'Login failed'
            }
        } catch (err) {
            s.err = 'An error occurred'
            s.loading = false
        }
    }

    onMount(async () => {
        s = await checkAuth(s)
    })

</script>

<div class="container min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    {#if s.loading}
        <div class="spinner" style="width: 3rem; height: 3rem;"></div>
    {:else}
        <div class="max-w-md w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
            </div>
            <form class="mt-8 space-y-6" onsubmit={(e) => submit(e)}>
                {#if s.err}
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span class="block sm:inline">{s.err}</span>
                    </div>
                {/if}
                {#if s.success}
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <span class="block sm:inline">{s.success}</span>
                    </div>
                {/if}
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email" class="sr-only">Email address</label>
                        <input 
                            bind:value={s.email}
                            id="email" 
                            name="email" 
                            type="email" 
                            required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                            placeholder="Email address"
                        />
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input 
                            bind:value={password}
                            id="password" 
                            name="password" 
                            type="password" 
                            required 
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                            placeholder="Password"
                        />
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-sm">
                        <a href="/forgot" class="font-medium text-blue-600 hover:text-blue-500">
                            Forgot your password?
                        </a>
                    </div>
                </div>

                <div>
                    <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        Sign in
                    </button>
                </div>
                <div class="text-center">
                    <a href="/register" class="font-medium text-blue-600 hover:text-blue-500">
                        Don't have an account? Sign up
                    </a>
                </div>
            </form>
        </div>
    {/if}
</div>