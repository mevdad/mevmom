<script lang="ts">
    import { onMount } from "svelte";
    import { checkAuth } from "$lib/c";
    let { s = $bindable() } = $props()

    async function submit(e: Event) {
        e.preventDefault()
        s.loading = true
        s.err = ''
        s.success = ''
        
        try {
            const response = await fetch('/api/auth/forgot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: s.email })
            })
            
            const data = await response.json()
            
            if (response.ok) {
                s.success = data.message || 'Password reset instructions sent to your email'
                s.email = ''
            } else {
                s.err = data.message || 'Failed to process request'
            }
        } catch (err) {
            s.err = 'An error occurred. Please try again.'
        } finally {
            s.loading = false
        }
    }

    onMount(async () => {
        s = await checkAuth(s)
    })
</script>

<div class="container min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
        <div>
            <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Reset your password</h2>
            <p class="mt-2 text-center text-sm text-gray-600">
                Enter your email address and we'll send you a link to reset your password.
            </p>
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
            <div>
                <label for="email" class="sr-only">Email address</label>
                <input 
                    bind:value={s.email}
                    id="email" 
                    name="email" 
                    type="email" 
                    required 
                    class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                    placeholder="Email address"
                />
            </div>

            <div>
                <button 
                    type="submit" 
                    class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={s.loading}
                >
                    {#if s.loading}
                        <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                            <div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        </span>
                        Processing...
                    {:else}
                        Send Reset Link
                    {/if}
                </button>
            </div>
            <div class="text-center">
                <a href="/login" class="font-medium text-blue-600 hover:text-blue-500">
                    Back to Login
                </a>
            </div>
        </form>
    </div>
</div>
