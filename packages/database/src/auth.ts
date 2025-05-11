export class Auth {
    private bcrypt: any;
    constructor() {
        this.bcrypt = require('bcryptjs');
    }
    hash({ password }: { password: string }) {
        return this.bcrypt.hashSync(password, this.bcrypt.genSaltSync());
    }
}