<script lang="ts">
    let { C, s = $bindable() } = $props()
</script>

{#if C}
    <C bind:s={s}/>
{/if}