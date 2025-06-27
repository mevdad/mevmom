import { getMongo } from '../u'

export const clearAll = async () => {
    const { db } = await getMongo()
    if(db) await db.dropDatabase()
}


export const getUser = async (_id: string) => {
    const { m } = await getMongo()
    const user = await m.User.findOne({ _id })    
    return user
}