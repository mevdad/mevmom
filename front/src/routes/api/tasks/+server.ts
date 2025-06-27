import { json } from '@sveltejs/kit'
import { addLog, createTask, getMongo } from '$u'
// import { exec } from 'child_process'
import { verify } from '$lib/s'

// async function runNodeScript(scriptPath: string, args: any[] = []) {
//     return new Promise((resolve, reject) => {
//         const command = `${scriptPath} ${args.join(' ')}`
//         exec(command, (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error executing script: ${error.message}`)
//                 reject(error)
//             } else if (stderr) {
//                 console.error(`Script error output: ${stderr}`)
//                 reject(new Error(stderr))
//             } else {
//                 console.log(`Script output: ${stdout}`)
//                 resolve(stdout)
//             }
//         })
//     })
// }

// GET /api/tasks - Get all tasks for a user
export async function GET({ request }: { request: Request }) {
    const { m } = await getMongo()
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const tasks = await m.Task.find({ userId: user && typeof user !== 'string' ? user.userId : null }).sort({ createdAt: -1 })
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i] && Array.isArray(tasks[i].customWallets)) {
                for (let j = 0; j < tasks[i].customWallets.length; j++) {
                    tasks[i].customWallets[j].privateKey = undefined
                }
            }
            tasks[i].wallets = await m.Wallet.find({ taskId: tasks[i]._id })
            if (tasks[i] && Array.isArray(tasks[i].wallets)) {
                for (let j = 0; j < tasks[i].wallets.length; j++) {
                    tasks[i].wallets[j].privateKey = undefined
                }
            }
            tasks[i].deposit_wallet_pk = undefined
            tasks[i].logs = await m.Log.find({ taskId: tasks[i]._id }).sort({ date: -1 })
        }
        return json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// POST /api/tasks - Create a new task
export async function POST({ request }: { request: Request }) {
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }
    const data = await request.json()
    console.log(data)

    try {
        // Validate input
        if (['BUY', 'SELL', 'COUNTERTRADE'].indexOf(data.type) == -1) {
            return json({ message: 'Invalid task type' }, { status: 400 })
        }

        if (!data.transactionTimeout || data.transactionTimeout < 1) {
            return json({ message: 'Invalid transaction timeout' }, { status: 400 })
        }

        if (!data.customWallets && (!data.walletsCount || data.walletsCount < 1)) {
            return json({ message: 'Invalid wallets configuration' }, { status: 400 })
        }

        const task = await createTask({
            title: data.title,
            description: data.description,
            dueDate: data.dueDate,
            status: 'PENDING',
            userId: typeof user !== 'string' ? user.userId : null,
            type: data.type,
            walletsCount: data.walletsCount,
            customWallets: data.customWallets,
            transactionTimeout: data.transactionTimeout,
            deposit_wallet_pk: data.deposit_wallet_pk,
            slippage: data.slippage,
            distribution_percentage: data.distribution_percentage,
            groupId: data.groupId,
            token: data.token,
            sell_price: data.sell_price
        })

        // Log task creation
        await addLog({
            time: Date.now(),
            message: `Task "${task.title}" created.`,
            taskId: task._id,
            type: 'task_create'
        })

        // runNodeScript('cd d:/projects/poot1 && yarn start', [task._id.toString()])

        return json({event: "new_task", task: task}, { status: 201 })
    } catch (error) {
        console.error('Error creating task:', error)
        return json({ message: 'Server error', error }, { status: 500 })
    }
}

// PUT /api/tasks/:id - Update a task
export async function PUT({ request }: { request: Request }) {
    const { m } = await getMongo()
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const data = await request.json()
        const taskId = request.url.split('/').pop()
        const task = await m.Task.findOne({ _id: taskId, userId: typeof user !== 'string' ? user.userId : null })
        
        if (!task) {
            return json({ message: 'Task not found' }, { status: 404 })
        }

        // Validate input
        if (data.type && !['BUY', 'SELL', 'COUNTERTRADE'].includes(data.type)) {
            return json({ message: 'Invalid task type' }, { status: 400 })
        }

        if (data.transactionTimeout && data.transactionTimeout < 1) {
            return json({ message: 'Invalid transaction timeout' }, { status: 400 })
        }

        if (data.walletsCount && data.walletsCount < 1) {
            return json({ message: 'Invalid wallets count' }, { status: 400 })
        }

        Object.assign(task, data)
        await task.save()
        return json(task)
    } catch (error) {
        console.error('Error updating task:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE({ request }: { request: Request }) {
    const { m } = await getMongo()
    const user = await verify(request)
    if (!user) {
        return json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const taskId = request.url.split('/').pop()
        const task = await m.Task.findOneAndDelete({ _id: taskId, userId: typeof user !== 'string' ? user.userId : null })
        if (!task) {
            return json({ message: 'Task not found' }, { status: 404 })
        }

        return json({ message: 'Task deleted successfully' })
    } catch (error) {
        console.error('Error deleting task:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}