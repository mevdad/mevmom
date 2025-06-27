import { verify } from '$lib/s'
import fs from 'fs/promises'

export async function GET({ request, params }: { params: { id: string }, request: Request }) {
  const user = await verify(request)
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {

  } catch (error) {
    console.error('Error downloading file:', error)
    return new Response('Server error', { status: 500 })
  }
}
