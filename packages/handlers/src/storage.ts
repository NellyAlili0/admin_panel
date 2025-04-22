// KYC Managers. Recieve KYC Info and upload to a storage bucket
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
export class Storage {
    s3: S3Client
    constructor() {
        this.s3 = new S3Client({
            region: process.env.STORAGE_REGION!,
            credentials: {
                accessKeyId: process.env.STORAGE_ACCESS_KEY!,
                secretAccessKey: process.env.STORAGE_SECRET_KEY!
            }
        })
    }
    async upload({
        key,
        body
    }: { key: string, body: File | Buffer }) {
        const command = new PutObjectCommand({
            Bucket: 'store',
            Key: key,
            Body: body
        })
        await this.s3.send(command)
    }
    async getDownloadUrl({
        key
    }: { key: string }) {
        const command = new GetObjectCommand({
            Bucket: 'store',
            Key: key
        })
        const response = await this.s3.send(command)
        return response.Body
    }
}
