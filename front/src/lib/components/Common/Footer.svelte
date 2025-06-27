<script lang="ts">
    import Menu from './Menu.svelte'
    import Logo from './Logo.svelte'
    let { s = $bindable() } = $props()
</script>

<footer>
    <div class="container flex flex-col">
        <Logo />
        <p>Advanced solutions for cryptocurrency market making automation</p>
        <Menu bind:s={s} />
        <div class="con">Tg: <a href="https://t.me/wizard_studios" target="_blank">@wizard_studios</a></div>
    </div>
    <div class="copyright">
        © {(new Date()).getFullYear()} Mev.Mom
    </div>
</footer>

<style>
    footer {
        background: #1f2937;
        color: white;
        padding: 20px 0 20px;
    }

    footer p, footer a {
        color: #d1d5db;
        padding: 20px 0;
    }

    .copyright {
        text-align: center;
        padding-top: 20px;
        border-top: 1px solid #374151;
        color: #9ca3af;
        font-size: 0.9rem;
    }
    .flex{
        align-items: center;
        justify-content: space-between;
    }
    .con{
        padding: 20px 0;
    }
</style>