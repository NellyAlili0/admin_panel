// Mail
const Brevo = require('@getbrevo/brevo');
export class Mail {
    base_url: string
    constructor() {
        this.base_url = 'https://api.brevo.com/v3/smtp/email'
    }
    async sendSTMP({ subject, html, email, name }) {
        const response = await fetch(this.base_url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_API_KEY!,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: {
                    name: 'Zidallie',
                    email: 'info@zidallie.co.ke'
                },
                to: [{
                    email: email,
                    name: name
                }],
                subject: subject,
                htmlContent: html
            })
        })
        return true;
    }
}
