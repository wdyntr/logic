import { doubleCsrf } from 'csrf-csrf'
import { AuthRequest } from "./auth.middleware";

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,
    getSessionIdentifier: (req) => (req as AuthRequest).userId!.toString(),
    cookieName: 'csrf_token',
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },

})

export { generateCsrfToken, doubleCsrfProtection }