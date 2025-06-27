import { json } from '@sveltejs/kit'
import { hashp } from '$lib/s'
import { getMongo } from '$u'

export async function POST({ request }: { request: Request }) {
    const { m } = await getMongo()
    const { token, password } = await request.json()

    try {
        const resetTokenRecord = await m.ResetToken.findOne({ 
            token,
            expires: { $gt: new Date() } // Token must not be expired
        })

        if (!resetTokenRecord) {
            return json({ message: 'Invalid or expired token' }, { status: 400 })
        }

        // Find user
        const user = await m.User.findById(resetTokenRecord.userId)
        if (!user) {
            return json({ message: 'User not found' }, { status: 404 })
        }

        const hashedPassword = await hashp(password)

        // Update user password
        user.password = hashedPassword
        await user.save()

        // Delete used token
        await m.ResetToken.deleteOne({ _id: resetTokenRecord._id })

        return json({ message: 'Password has been reset successfully' })
    } catch (error) {
        console.error('Password reset error:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}
