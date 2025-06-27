import { json } from '@sveltejs/kit'
import jwt from 'jsonwebtoken'
import { getMongo } from '$u'
import { compass } from '$lib/s'


export async function POST({ request }: { request: Request }) {
    const { m } = await getMongo()
    const { email, password } = await request.json()

    try {
        const user = await m.User.findOne({ email })
        if (!user) {
            return json({ message: 'Invalid credentials' }, { status: 401 })
        }

        try {
            // Verify password
            const isMatch = await compass(user.password, password)
            if (!isMatch) {
                return json({ message: 'Invalid credentials' }, { status: 401 })
            }
        } catch (passwordError) {
            console.error('Password comparison error:', passwordError)
            return json({ message: 'Invalid credentials' }, { status: 401 })
        }

        // Create token
        const token = jwt.sign(
            { userId: user._id },
            'secret13',
            { expiresIn: '24h' }
        )

        return json({ 
            token,
            user: {
                id: user._id,
                email: user.email
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}