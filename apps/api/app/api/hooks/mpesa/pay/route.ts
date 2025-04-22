import { Payments } from "@repo/handlers/payments";
import { Mail } from "@repo/handlers/mail";
import { Mapping } from "@repo/handlers/mapping";
export async function GET(req: Request) {
    // let pay = new Payments();
    // let ref = crypto.randomUUID()
    // let response = await pay.stkpush({
    //     phone: '254113990870',
    //     ref: ref,
    //     amount: 10,
    //     code: 'ZIDALLIE'
    // })
    // console.log(response)
    // let mail = new Mail();
    // await mail.sendSTMP({
    //     subject: 'Test',
    //     html: '<h1>Test</h1>',
    //     email: 'markodave46@gmail.com',
    //     name: 'Marko David'
    // })
    // const mapping = new Mapping();
    // const distance = await mapping.getDistance({
    //     origin: 'Kampala',
    //     destination: 'Nairobi'
    // })
    // console.log(distance)
    return Response.json({
        status: 'success',
        message: 'Zidallie Handler'
    });
}