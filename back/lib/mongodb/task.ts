import { getMongo } from '../u'
import type { Task } from '../u'

export const createTask = async (taskData: Task) => {
    const { m } = await getMongo()
    const task = new m.Task(taskData)
    await task.save()
    return task
}

export const getTasks = async (userId: string) => {
    const { m } = await getMongo()
    return await m.Task.find({ userId }).sort({ createdAt: -1 })
}

export const getTaskById = async (taskId: string) => {
    const { m } = await getMongo()
    console.log('Task ID:', taskId)
    return await m.Task.findOne({_id: taskId}).sort({ createdAt: -1 })
}
