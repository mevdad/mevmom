import { json } from '@sveltejs/kit'
import { verify } from '$lib/s'
import { 
    listFilesAndFolders, 
    createFolder, 
    saveFile, 
    deleteFile, 
    deleteFolder,
    changePath,
    getUserStorage
} from '$u'
import { Buffer } from 'node:buffer'
import path from 'path'


// GET /api/files - List files and folders
export async function GET({ request } : { request: Request }) {
    const user = await verify(request)
    if (!user) return json({ message: 'Unauthorized' }, { status: 401 })
    const userId = typeof user !== 'string' ? user.userId : null
    try {
        return json({status: "success", rawdata: await listFilesAndFolders(userId)})
    } catch (error) {
        console.error('Error listing files and folders:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// POST /api/files - Upload file or create folder
export async function POST({ request } : { request: Request }) {
    const user = await verify(request)
    if (!user) return json({ message: 'Unauthorized' }, { status: 401 })
    const userId = typeof user !== 'string' ? user.userId : null

    if (!request.body) {
        return json({ message: 'Request body is missing' }, { status: 400 });
    }
    // body to FormData
    console.log('Request body:', request.body);
    await request.formData().then(async (formData) => {
        console.log('FormData:', formData);
        const p = formData.get('p')
        const name = formData.get('name')
        const type = formData.get('type')
        const file = formData.get('file')
        console.log(p, name, type, file)
        if (!p) {
            return json({ message: 'Path is required' }, { status: 400 })
        }
        if (type === 'folder') {
            if (!name) {
                return json({ message: 'Folder name is required' }, { status: 400 })
            }
    
            const folder = await createFolder(path.join(await getUserStorage(userId), p.toString(), name.toString()))
            return json(folder, { status: 201 })
        } else {
            // File upload
            
            if (!file || !(file instanceof File)) {
                return json({ message: 'File is required' }, { status: 400 })
            }
            const fileName = file.name
            const fileSize = file.size
            const fileType = file.type
    
            const fileData = {
                name: fileName,
                size: fileSize,
                originalname: fileName,
                mimetype: fileType,
                buffer: Buffer.from(await file.arrayBuffer()),
            }
    
            const savedFile = await saveFile(fileData, path.join(await getUserStorage(userId), p.toString()))
            return json(savedFile, { status: 201 })
        }
    })   
    
    
}

// PUT /api/files - Rename file or folder
export async function PUT({ request } : { request: Request }) {
    if (!await verify(request)) return json({ message: 'Unauthorized' }, { status: 401 })
    try {
        const { newPath, oldPath } = await request.json()
        if (!newPath) {
            return json({ message: 'New path is required' }, { status: 400 })
        }
        return json(await changePath(oldPath, newPath))
    } catch (error) {
        console.error('Error renaming file or folder:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}

// DELETE /api/files - Delete file or folder
export async function DELETE({ request } : { request: Request }) {
    if (!await verify(request)) return json({ message: 'Unauthorized' }, { status: 401 })
    try {
        const { path, type } = await request.json()
        return json({ success: type === 'folder' ? await deleteFolder(path) : await deleteFile(path) })
    } catch (error) {
        console.error('Error deleting file or folder:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}
