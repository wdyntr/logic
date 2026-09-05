import jwt  from "jsonwebtoken";
import crypto from 'crypto'

export const generateAccessToken = (userId: bigint) =>
    jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET!, {expiresIn: '15m'})

export const generateRefreshToken = () => crypto.randomBytes(40).toString('hex')

export const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('hex')