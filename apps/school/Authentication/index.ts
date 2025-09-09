import bcrypt from "bcryptjs";
import jwt from "jwt-simple";

// JWT Managers
export class Auth {
  private jwt: any;
  private bcrypt: any;

  constructor() {
    this.jwt = jwt;
    this.bcrypt = bcrypt;
  }

  encode({
    payload,
  }: {
    payload: { id: number; email: string; roleId: number | null; kind: string };
  }) {
    const extendedPayload = {
      ...payload,
      exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    return this.jwt.encode(extendedPayload, process.env.JWT_SECRET);
  }

  decode({ token }: { token: string }) {
    try {
      const payload = this.jwt.decode(token, process.env.JWT_SECRET);
      if (payload && payload.exp > Date.now()) {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Decode and validate token for Admin users only
   */
  admin_decode({ token }: { token: string }) {
    try {
      const payload = this.jwt.decode(token, process.env.JWT_SECRET);
      if (payload && payload.kind === "Admin" && payload.exp > Date.now()) {
        return payload;
      }
      return null;
    } catch {
      return null;
    }
  }

  hash({ password }: { password: string }) {
    return this.bcrypt.hashSync(password, this.bcrypt.genSaltSync());
  }

  compare({ password, hash }: { password: string; hash: string }) {
    return this.bcrypt.compareSync(password, hash);
  }

  checkApiToken({ req }: { req: Request }) {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!token) {
      return null;
    }
    return this.decode({ token });
  }
}
