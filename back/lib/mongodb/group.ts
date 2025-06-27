import { getMongo } from '../u'
import type { Group } from '../u'

export const createGroup = async (group: Group) => {
    const { m } = await getMongo()
    const newGroup = new m.Group({
        name: group.name,
        description: group.description,
        userId: group.userId
    })
    await newGroup.save()
    return newGroup
}

export const updateGroup = async (id: string, data: Partial<Group>) => {
    const { m } = await getMongo()
    data.updatedAt = new Date()
    return await m.Group.findByIdAndUpdate(id, data, { new: true })
}

export const deleteGroup = async (id: string, userId: string) => {
    const { m } = await getMongo()
    
    // First delete the group
    const result = await m.Group.findOneAndDelete({ 
        _id: id, 
        userId: userId 
    })
    
    if (!result) {
        throw new Error('Wallet group not found or unauthorized')
    }
    
    // Then remove the group reference from wallets
    await m.Wallet.updateMany(
        { groupId: id },
        { $unset: { groupId: "" } }
    )
    
    return result
}

export const getGroups = async (userId: string) => {
    const { m } = await getMongo()
    return await m.Group.find({ userId })
}

export const getGroupById = async (id: string) => {
    const { m } = await getMongo()
    return await m.Group.findOne({ 
        _id: id
    })
}

export const getWalletsInGroup = async (groupId: string) => {
    const { m } = await getMongo()
    return await m.Wallet.find({ groupId })
}
