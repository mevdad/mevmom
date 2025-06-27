import { json } from '@sveltejs/kit'
import crypto from 'crypto'
import { getMongo } from '$u'

export async function POST({ request }: { request: Request }) {
    const { m } = await getMongo()
    const { email } = await request.json()

    try {
        const user = await m.User.findOne({ email })
        if (!user) {
            // For security reasons, we'll still return a success message 
            // even if the email doesn't exist
            return json({ message: 'If your email exists in our database, you will receive a password reset link' })
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(20).toString('hex')
        const tokenExpiry = new Date()
        tokenExpiry.setHours(tokenExpiry.getHours() + 1) // Token valid for 1 hour

        // Save token to database
        await m.ResetToken.findOneAndDelete({ userId: user._id }) // Delete any existing token
        await new m.ResetToken({
            userId: user._id,
            token: resetToken,
            expires: tokenExpiry
        }).save()

        // In a real application, send an email with the reset link
        // For this implementation, we'll just return the token in the response
        // console.log(`Reset link: ${baseUrl}/reset-password/${resetToken}`)

        return json({ 
            message: 'Password reset link has been sent to your email',
            // Note: In production, don't include the token in the response
            // This is just for demonstration purposes
            debug: { resetToken }
        })
    } catch (error) {
        console.error('Password reset request error:', error)
        return json({ message: 'Server error' }, { status: 500 })
    }
}
