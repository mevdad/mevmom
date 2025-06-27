import { json } from '@sveltejs/kit'
import { verify } from '$lib/s'
import { changePath } from '$u'

// POST /api/files/move - Move file or folder
export async function POST({ request } : { request: Request }) {
  if (!await verify(request)) return json({ message: 'Unauthorized' }, { status: 401 })
  try {

    const { oldPath, newPath } = await request.json()
    if (!oldPath || !newPath) {
      return json({ message: 'newPath and oldPath required' }, { status: 400 })
    }
    return json(await changePath(oldPath, newPath), { status: 200 })

  } catch (error: any) {
    console.error('Error moving file or folder:', error)
    return json({ message: 'Server error', details: error.message }, { status: 500 })
  }
}
