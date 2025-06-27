import { json } from '@sveltejs/kit'
import { getMongo } from '$u'
import { hashp } from '$lib/s'

export async function POST({ request }: { request: Request }) {
    const { m } = await getMongo()
    const { email, password } = await request.json()

    try {
        const existingUser = await m.User.findOne({ email })
        if (existingUser) {
            return json({ message: 'User already exists' }, { status: 400 })
        }
        const user = new m.User({
            email,
            password: await hashp(password)
        })

        await user.save()
        return json({ message: 'User created successfully' }, { status: 201 })
    } catch (error) {
        console.error('Registration error:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}