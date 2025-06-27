import { getMongo } from '../u'
import type { Log as L } from '../u'

export const addLog = async (logData: L) => {
    const { m } = await getMongo()
    const log = new m.Log(logData)
    return await log.save()
}

export const getLogsByTaskId = async (taskId: any) => {
    const { m } = await getMongo()
    return await m.Log.find({ taskId }).sort({ date: -1 })
}
