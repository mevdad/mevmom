import { runTradingLoop, getTaskById, starter } from '../lib/u'
import type { Task } from '../lib/u'
import WebSocket from 'ws'

(async () => {
    const taskId = process.argv[2]
    await starter(async (socket: WebSocket) => {
        const task: Task = await getTaskById(taskId)
        task.deposit_wallet_pk = "0x" + task.deposit_wallet_pk
        task.socket = socket
        console.log('Task:', task)
        await runTradingLoop(task)
    })
})()