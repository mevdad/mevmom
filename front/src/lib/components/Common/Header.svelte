<script lang="ts">
    import Logo from './Logo.svelte'
    import Menu from './Menu.svelte'
    import { goto } from '$app/navigation'
    import { page } from '$app/state'
    import { State } from '$lib/c'
    let { s = $bindable() } = $props()
    const out = async () => {
        localStorage.removeItem('token')
        s = State
        s.loading = false
        if(!s.notAuth.includes(page.url.pathname)) await goto('/login')
    }
</script>



<nav class="bg-white mx-auto">
    <div class="container flex justify-between items-center h-16">
        <Logo /><Menu bind:s={s}/>
        {#if s.auth}
            <button onclick={out} class="btn primary">
                Logout
            </button>
        {:else}
            <a style="color:#fff" href="/login" class="btn primary">Login</a>
        {/if}
    </div>
</nav>
