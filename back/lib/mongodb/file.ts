import fs from 'fs/promises'
import path from 'path'

// Storage directory
const STORAGE_DIR = "/pot/front/storage"


export const existsPath = async (path: string | null): Promise<boolean> => {
    if (path === null) return false
    const exists = await fs.stat(path).catch(() => false)
    return !exists ? false : true
}

/**
 * Create user storage directory
 */
export const getUserStorage = async (userId: string): Promise<string> => {
    const d = path.join(STORAGE_DIR, userId.toString())
    if (!(await existsPath(d))) await createFolder(d)
    return d
}

/**
 * List files and folders in a directory
 */
export const listFilesAndFolders = async (
    userId: string
): Promise<any> => {
    const rawdata = await fs.readdir(await getUserStorage(userId), { withFileTypes: true })
    return rawdata
}

/**
 * Create folder
 */
export const createFolder = async (
    p: string
): Promise<string> => {
    if (!(await existsPath(p))) await fs.mkdir(p, { recursive: true })
    return p
}

/**
 * Save uploaded file
 */
export const saveFile = async (
  file: Express.Multer.File | { buffer: Buffer, originalname: string, mimetype: string, size: number },
  p: string
): Promise<string> => {
    const newFilePath = await createFolder(p)
    const fileExtension = path.extname(file.originalname)
    const fileName = `${file.originalname}${fileExtension}`
    const filePath = path.join(newFilePath, fileName)
    
    await fs.writeFile(filePath, file.buffer)

    return filePath
}

/**
 * Delete file
 */
export const deleteFile = async (path: string): Promise<boolean> => {
    return false
}

/**
 * Delete folder and all contents recursively
 */
export const deleteFolder = async (path: string): Promise<boolean> => {
    return false
}

/**
 * changePath folder or file
 */
export const changePath = async (
  oldPath: string, 
  newPath: string
): Promise<boolean> => {
    try {
      await fs.rename(oldPath, newPath);
      return true
    } catch (error) {
      console.error('Error renaming folder:', error)
      return false
    }
}