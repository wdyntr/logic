import { doubleCsrf } from "csrf-csrf";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "../utils/app-error";

const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET!,
  getSessionIdentifier: (req) => {
    const userid = (req as AuthRequest).userId;
    if (!userid) throw new AppError("Unauthrized", 401);
    return userid.toString();
  },
  cookieName: "csrf_token",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NOE_ENV === "production",
  },
});

export { generateCsrfToken, doubleCsrfProtection };
