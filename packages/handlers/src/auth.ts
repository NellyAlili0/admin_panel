// JWT Managers
export class Auth {
  private jwt: any;
  private bcrypt: any;

  constructor() {
    this.jwt = require("jwt-simple");
    this.bcrypt = require("bcryptjs");
  }

  encode({ payload }: { payload: any }) {
    // add 1 month exp
    payload.exp = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
    return this.jwt.encode(payload, process.env.JWT_SECRET);
  }

  decode({ token }: { token: string }) {
    let payload = this.jwt.decode(token, process.env.JWT_SECRET);
    if (payload) {
      return payload;
    }
    return null;
  }

  admin_decode({
    token,
    role,
  }: {
    token: string;
    role: "Admin" | "Finance" | "Operations";
  }) {
    try {
      let payload = this.jwt.decode(token, process.env.JWT_SECRET);
      if (payload) {
        if (payload.role === role) {
          return payload;
        }
        return null;
      }
      return null;
    } catch (error) {
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
