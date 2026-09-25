import { doubleCsrf } from 'csrf-csrf'
import { AuthRequest } from "./auth.middleware";
import { AppError } from '../utils/app-error';

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
    getSecret: () => process.env.CSRF_SECRET!,
    getSessionIdentifier: (req) => {
        const userId = (req as AuthRequest).userId;
        if (!userId) throw new AppError('Unauthorized', 401); // atau fallback lain
        return userId.toString();
    },
    cookieName: 'csrf_token',
    cookieOptions: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },

})

export { generateCsrfToken, doubleCsrfProtection }