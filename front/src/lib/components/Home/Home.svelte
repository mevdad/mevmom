<script lang="ts"> 
    import Hero from "./Hero.svelte"
    import Features from "./Features.svelte"
    import Price from "./Price.svelte"
    import Faq from "./Faq.svelte"
    import Cta from "./Cta.svelte"
    import { checkAuth } from "$lib/c";
    import { onMount } from "svelte"

    let { s = $bindable() } = $props()

    onMount(async () => {
        s = await checkAuth(s)
    })
</script>

<div class="landing-page">
    <Hero />
    <Features />
    <Price />
    <Faq />
    <Cta />
</div>