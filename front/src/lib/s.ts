import jwt from 'jsonwebtoken'
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

export async function verify(request: Request) {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
        console.error('Authorization header missing')
        return null
    }
    const token = authHeader.split(' ')[1]
    console.log('Token:', token)
    if (!token) {
        console.error('Token missing in authorization header')
        return null
    }
    try {
        return jwt.verify(token, 'secret13')
    } catch (err) {
        console.error('Error verifying token:', err)
        return null
    }
}

export async function hashp(pass: string, salt: string = '') {
    if(salt === '') salt = randomBytes(16).toString("hex")
    return ((await promisify(scrypt)(pass, salt, 64)) as Buffer).toString("hex") + '.' + salt
}

export async function compass(
    stored: string, newc: string
): Promise<boolean> {
    const [hashed, salt] = stored.split(".")
    const [hashed1] = (await hashp(newc, salt)).split(".")
    // compare the new supplied password with the stored hashed password
    return timingSafeEqual(Buffer.from(hashed, "hex"), Buffer.from(hashed1, "hex"))
}

    