<script lang="ts">
    import { page } from '$app/state'
    import { goto } from '$app/navigation'
    import { checkAuth } from "$lib/c";
    import { onMount } from "svelte"
    
    const token = page.params.token
    let password = $state('')
    let confirmPassword = $state('')

    let { s = $bindable() } = $props()

    async function submit(e: Event) {
        e.preventDefault()
        if (password !== confirmPassword) {
            s.err = 'Passwords do not match'
            return
        }

        s.loading = true
        s.err = ''
        s.success = ''
        
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            })
            
            const data = await response.json()
            
            if (response.ok) {
                s.success = data.message || 'Password reset successful'
                // Redirect to login after 2 seconds
                setTimeout(async () => {
                    s.success = 'Password has been reset successfully. Please login with your new password.'
                    await goto('/login')
                }, 1000)
            } else {
                s.err = data.message || 'Failed to reset password'
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
                Enter your new password below.
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
            <div class="rounded-md shadow-sm -space-y-px">
                <div>
                    <label for="password" class="sr-only">New Password</label>
                    <input 
                        bind:value={password}
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                        placeholder="New Password"
                        minlength="6"
                    />
                </div>
                <div>
                    <label for="confirmPassword" class="sr-only">Confirm Password</label>
                    <input 
                        bind:value={confirmPassword}
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password" 
                        required 
                        class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" 
                        placeholder="Confirm Password"
                        minlength="6"
                    />
                </div>
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
                        Reset Password
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
