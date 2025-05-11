// Mpesa initiate payments, or generate payments code for paybill
import { db } from "@repo/database";
export class Payments {
    mpesa_shortcode: string;
    mpesa_passkey: string;
    mpesa_key: string;
    mpesa_secret: string;
    constructor() {
        this.mpesa_shortcode = process.env.MPESA_SHORTCODE!
        this.mpesa_passkey = process.env.MPESA_PASSKEY!
        this.mpesa_key = process.env.MPESA_KEY!
        this.mpesa_secret = process.env.MPESA_SECRET!
    }
    private async generateToken() {
        try {
            const url = "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
            const headers = {
                'Authorization': 'Basic ' + btoa(this.mpesa_key + ":" + this.mpesa_secret),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            const response = await fetch(url,
                {
                    method: 'GET',
                    headers: headers,
                    cache: 'default',
                    mode: 'no-cors'
                })
            const r = await response.json()
            const access_token = r["access_token"]
            return access_token
        } catch (error) {
            return null
        }
    }
    private getTimestamp() {
        const getTimestamp = () => {
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
        
            return `${year}${month}${day}${hours}${minutes}${seconds}`;
        };
        return getTimestamp()
    }
    private getPassword(timestamp: string) {
        const getPassword = (timestamp: string) => {
            const shortCode = this.mpesa_shortcode;
            const passKey = this.mpesa_passkey;
            const password = `${shortCode}${passKey}${timestamp}`;
            return Buffer.from(password).toString('base64');
        };
        return getPassword(timestamp)
    }
    async stkpush({ phone, ref, amount, code, callback_url }: { phone: string, ref: string, amount: number, code: string, callback_url: string }) {
        let access_token = await this.generateToken()
        if (!access_token) return null
        // create timestamp with format %Y%m%d%H%M%S

        const timestamp = this.getTimestamp()
        const stk_password = this.getPassword(timestamp)
        const tx_ref = crypto.randomUUID()
        const headers = {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
        const body = {
            "BusinessShortCode": this.mpesa_shortcode,
            "Password": stk_password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": this.mpesa_shortcode,
            "PhoneNumber": phone,
            "CallBackURL": callback_url,
            "AccountReference": code,
            "TransactionDesc": ref
        }
        let url = "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        const r = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            cache: 'default',
            mode: 'no-cors'
        })
        if (r.status === 200) {
            const response = await r.json()
            return response
        } else {
            return null
        }
    }
    async verify({ ref }: { ref: string }) {
        let access_token = await this.generateToken()
        if (!access_token) return null
        const headers = {
            'Authorization': 'Bearer ' + access_token,
            'Content-Type': 'application/json'
        }
        const body = {
            "BusinessShortCode": this.mpesa_shortcode,
            "Password": this.getPassword(this.getTimestamp()),
            "Timestamp": this.getTimestamp(),
            "CheckoutRequestID": ref
        }
        const url = "https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query"
        const r = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            cache: 'default',
            mode: 'no-cors'
        })
        if (r.status === 200) {
            const response = await r.json()
            if (response['ResponseCode'] === '0') {
                return { status: 'success' }
            } else {
                return { status: 'pending' }
            }
        } else {
            return null
        }
    }

    async confirmation({ tran_id, amount, refnumber }: { tran_id: string, amount: number, refnumber: string }) {
        let access_token = await this.generateToken()
        if (!access_token) return null
        // tran_id = req['TransID']
        // amount = req['TransAmount']
        // refnumber = req['BillRefNumber']
        // check if ref number is in database and pending and amount is correct
        // if not return null
        // const check = await db.selectFrom('payment')
        //     .where('paybill_number', '=', refnumber)
        //     .where('payment_status', '=', 'Pending')
        //     .where('amount', '=', amount)
        //     .executeTakeFirst()
            // return jsonify({
            //     "ResultCode":0,
            //     "ResultDesc":"Confirmation received successfully"
            // })
    }
    async validation({ tran_id, amount, refnumber }: { tran_id: string, amount: number, refnumber: string }) {
        let access_token = await this.generateToken()
        if (!access_token) return null
        // tran_id = req['TransID']
        // amount = req['TransAmount']
        // refnumber = req['BillRefNumber']
        // check if ref number is in database and pending and amount is correct
        // if not return null
        // if check:
        //     # C2B00012, C2B00013
        //     return jsonify({
        //         "ResultCode":0,
        //         "ResultDesc":"Confirmation received successfully"
        //     })
        // else:
        //     return jsonify({"ResultCode": 1, "ResultDesc": "Rejected"})
        // const check = await db.selectFrom('payment')
        //     .where('paybill_number', '=', refnumber)
        //     .where('payment_status', '=', 'Pending')
        //     .where('amount', '=', amount)
        //     .executeTakeFirst()
            // return jsonify({
            //     "ResultCode":0,
            //     "ResultDesc":"Confirmation received successfully"
            // })
    }
}