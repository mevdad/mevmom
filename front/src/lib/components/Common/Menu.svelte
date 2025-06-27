<script lang="ts">
    import { page } from '$app/state'
    const { s = $bindable() } = $props()
    const links = $derived(s.auth ? s.Menu.Auth : s.Menu.Main)
</script>
<div class="menu flex">
    {#each links as link}
        <a href={link.href} class="{page.url.pathname === link.href ? 'active' : ''}">
            {link.name}
        </a>
    {/each}
</div>

<style>
    a{
        margin: 0 20px;
        border-bottom: 2px solid transparent;
    }
    .active{
        border-bottom: 2px solid #1f2937;
    }
</style>