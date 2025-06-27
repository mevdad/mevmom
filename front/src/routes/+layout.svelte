<script lang="ts">
    import '../app.css'
    import { State } from '$lib/c'
    import { page } from '$app/state'
    import Forgot from "$c/Auth/Forgot.svelte"
    import Login from "$c/Auth/Login.svelte"
    import Reg from "$c/Auth/Reg.svelte"
    import Reset from "$c/Auth/Reset.svelte"
    import Files from '$c/Files/Files.svelte'
    import Group from '$c/Groups/Group.svelte'
    import Groups from '$c/Groups/Groups.svelte'
    import Home from '$c/Home/Home.svelte'
    import Providers from '$c/Providers/Providers.svelte'
    import Tasks from '$c/Tasks/Tasks.svelte'
    import Task from '$c/Tasks/Task.svelte'
    import { onMount } from "svelte"
    import Header from "$c/Common/Header.svelte";
    import Footer from "$c/Common/Footer.svelte"
    import Loading from '$c/Common/Loading.svelte';

    let s = $state<any>(State)
    const { children } = $props()

    const ws = (b: boolean = false) => {
        if((b && !s.socket) || !b) {
            const socket = new WebSocket("wss://mev.mom/ws")
            socket.addEventListener("open", () => {
                console.log("WebSocket connection established.", socket) 
                socket.addEventListener("message", (event: any) => {
                    const data = JSON.parse(event.data)
                    console.log(data)
                })
                setInterval(() => {
                    if (socket !== null && socket.readyState === WebSocket.OPEN) {
                        socket.send(JSON.stringify({ type: "ping" }))
                    }
                }, 5000)
            })

            socket.addEventListener("close", () => {
                console.log("WebSocket connection closed. Attempting to reconnect...")
                setTimeout(() => ws(), 1000)
            })

            socket.addEventListener("error", () => {
                console.error("WebSocket error. Attempting to reconnect...")
                socket.close()
            })

            s.socket = socket
        }
    }

    const C = () => {
        switch (page.url.pathname) {
            case '/login':
                return Login
            case '/register':
                return Reg
            case '/forgot':
                return Forgot
            case '/reset':
                return Reset
            case '/files':
                return Files
            case '/groups':
                return Groups
            case '/providers':
                return Providers
            case '/tasks':
                return Tasks
            case `/group/${page.params.id}`:
                return Group
            case `/task/${page.params.id}`:
                return Task
            default:
                return Home
        }
    }

    onMount(async () => {
        ws(true)
    })
</script>

<div id="app" class="flex flex-col min-h-screen">
    {@render children()}
    <div>
        <Header bind:s={s}/>
        <Loading C={C()} bind:s={s} />
    </div>
    <Footer bind:s={s}/>
</div>

<style>
    .flex{
        justify-content: space-between;
    }
</style>