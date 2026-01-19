
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class StorageService {
    private client: S3Client;
    private bucketName: string;
    private publicUrl: string;

    constructor() {
        const accountId = process.env.R2_ACCOUNT_ID;
        const accessKeyId = process.env.R2_ACCESS_KEY_ID;
        const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
        this.bucketName = process.env.R2_BUCKET_NAME || "jiu-platform-videos";
        this.publicUrl = process.env.R2_PUBLIC_URL || "";

        if (!accountId || !accessKeyId || !secretAccessKey) {
            console.error("Missing R2 credentials. Video upload will not work.");
        }

        this.client = new S3Client({
            region: "auto",
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: accessKeyId || "",
                secretAccessKey: secretAccessKey || "",
            },
            forcePathStyle: true,
        });
    }

    async getUploadUrl(key: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        // Expires in 1 hour
        return getSignedUrl(this.client, command, { expiresIn: 3600 });
    }

    getPublicUrl(key: string): string {
        if (this.publicUrl) {
            return `${this.publicUrl}/${key}`;
        }
        // Fallback or if public bucket access is configured differently
        // R2 public buckets usually accessible via custom domain
        return `https://${this.bucketName}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
    }
}

export const storageService = new StorageService();
