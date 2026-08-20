import type { TokenPayload } from "@/lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

export {};
