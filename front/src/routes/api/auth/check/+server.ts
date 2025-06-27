import { verify } from '$lib/s'
import { json } from '@sveltejs/kit'
import { getUser } from '$u'

export async function POST({ request }: { request: Request }) {
    const user: any = await verify(request)
    const data = user ? await getUser(user.userId) : null
    console.log('data:', data)
    return json({ success: !user ? false : true, user: data })
}