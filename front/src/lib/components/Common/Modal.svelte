<script lang="ts">
    let { children, opn = $bindable() } = $props()
</script>

{#if opn}
    <div>
        <div class="modalb"></div>
        <div class="modal">
            {#if children}
                {@render children()}
            {/if}
            <button type="button" aria-label="Close" onclick={()=> opn = false}><svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
        </div>
    </div>
{/if}

<style>
    .modalb {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 50;
    }

    .modal {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 100;
        min-width: 70vw;
    }

    .modal button {
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 10px;
    }
    .modal button:hover path{
        fill: gray
    }
</style>