import { getTaskById, getMongo } from '$u'
import { json } from '@sveltejs/kit'

export const GET = async ({ params }: {params: { _id: string }}) => {
    const { m } = await getMongo()
    const { _id } = params

    try {
        if (!_id) {
            return json({
                status: 400,
                body: { error: 'Invalid task ID' }
            })
        }
        const task = await getTaskById(_id)
        
        if (!task) {
            return json({
                status: 404,
                body: { error: 'Task not found' }
            })
        }

        if (task && Array.isArray(task.customWallets)) {
            for (let i = 0; i < task.customWallets.length; i++) {
                task.customWallets[i].privateKey = undefined
            }
        }
        if (task && task.wallets) {
            for (let i = 0; i < task.wallets.length; i++) {
                task.wallets[i].privateKey = undefined
            }
        }
        task.deposit_wallet_pk = undefined

        const logs = await m.Log.find({ taskId: _id }).sort({ date: -1 })

        return json({
            status: 200,
            body: { task, logs }
        })
    } catch (error) {
        return json({
            status: 500,
            body: { error: error }
        })
    }
}
