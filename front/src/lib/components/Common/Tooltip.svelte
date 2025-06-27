<script lang="ts">
    const { text, children } = $props()

    let c = $state('absolute bg-white p-2 rounded shadow-lg border z-10 -top-2 hidden')

    const mouseOver = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        c = c.replace(' hidden', '')
    }

    const mouseOut = (e: any) => {
        e.preventDefault()
        e.stopPropagation()
        if (c.includes('hidden')) {
            return
        }
        c += ' hidden'
    }
</script>

<div class="mt-1 text-sm text-gray-500 relative">
    <div class={c}>{ text }</div>
    <div onmousemove={(e) => mouseOver(e)} onfocus={(e) => mouseOver(e)} onmouseout={(e) => mouseOut(e)} onblur={(e) => mouseOut(e)} role="tooltip">
        {@render children()}
    </div>
</div>

<style>
    .-top-2{
        top: -70px;
    }
</style>