import { getConsts } from '../../lib/u'
import { WebSocket } from 'ws'

export async function starter(cb: (socket: WebSocket) => void | Promise<void>) {
    console.log("Starting script...")
    try {
        const { ws } = await getConsts()
        if (!ws) {
            console.error("WebSocket URL is not defined in the environment variables.")
            return
        }
        const socket = new WebSocket(ws)
        socket.on("open", async () => {
            console.log("WebSocket connection opened.") 
            await cb(socket)
        })
        socket.on("error", (error) => {
            console.error("WebSocket error:", error)
            socket.close()
        })
        socket.on("close", async () => {
            console.log("WebSocket connection closed.")
            await starter(cb) // Restart the script on close
        })
        return socket
    } catch (error) {
        console.error('Error in main function:', error)
        console.log("Restarting script in 3 seconds...")
        // Wait 3 seconds before restarting to avoid tight restart loops
        setTimeout(() => {
            console.log("Restarting script now...")
            process.exit(1) // This will trigger the restart logic
        }, 3000)
    }
}