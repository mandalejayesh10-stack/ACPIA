import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as Minio from 'minio'
import * as crypto from 'crypto'

export interface UploadResult {
  bucketName: string
  objectName: string
  etag: string
  sizeBytes: number
  sha256Hash: string
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name)
  private minioClient!: Minio.Client

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const endPoint = this.configService.get<string>('MINIO_ENDPOINT', 'localhost')
    const port = this.configService.get<number>('MINIO_PORT', 9000)
    const accessKey = this.configService.get<string>('MINIO_ROOT_USER', 'acpia_minio_admin')
    const secretKey = this.configService.get<string>(
      'MINIO_ROOT_PASSWORD',
      'acpia_minio_password_2026'
    )

    try {
      this.minioClient = new Minio.Client({
        endPoint,
        port,
        useSSL: false,
        accessKey,
        secretKey,
      })

      this.logger.log(`Connected to MinIO Evidence File Storage at ${endPoint}:${port}`)
      await this.initializeBuckets()
    } catch (err) {
      this.logger.warn(`MinIO standby mode active: ${(err as Error).message}`)
    }
  }

  /**
   * Asserts default evidence bucket per SECURITY.md
   */
  private async initializeBuckets(): Promise<void> {
    const bucketName = this.configService.get<string>('MINIO_BUCKET_EVIDENCE', 'acpia-evidence')

    try {
      const exists = await this.minioClient.bucketExists(bucketName)
      if (!exists) {
        await this.minioClient.makeBucket(bucketName, 'us-east-1')
        this.logger.log(`Created MinIO evidence bucket: ${bucketName}`)
      }
    } catch (err) {
      this.logger.warn(`MinIO bucket setup deferred: ${(err as Error).message}`)
    }
  }

  /**
   * Upload file to MinIO storage and compute SHA-256 hash for Chain of Custody
   */
  async uploadFile(
    bucketName: string,
    objectName: string,
    buffer: Buffer,
    mimeType: string,
    metaData: Record<string, string> = {}
  ): Promise<UploadResult> {
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex')

    const extendedMetadata = {
      ...metaData,
      'Content-Type': mimeType,
      'x-amz-meta-sha256': sha256Hash,
      'x-amz-meta-uploaded-at': new Date().toISOString(),
    }

    const info = await this.minioClient.putObject(
      bucketName,
      objectName,
      buffer,
      buffer.length,
      extendedMetadata
    )

    return {
      bucketName,
      objectName,
      etag: info.etag,
      sizeBytes: buffer.length,
      sha256Hash,
    }
  }

  /**
   * Retrieve file stream from MinIO
   */
  async getFileStream(bucketName: string, objectName: string) {
    return this.minioClient.getObject(bucketName, objectName)
  }

  /**
   * Verify file SHA-256 hash against expected database hash per SECURITY.md Section 10
   */
  async verifyIntegrity(
    bucketName: string,
    objectName: string,
    expectedHash: string
  ): Promise<{ isIntact: boolean; currentHash: string }> {
    const stream = await this.getFileStream(bucketName, objectName)
    const hash = crypto.createHash('sha256')

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => hash.update(chunk))
      stream.on('end', () => {
        const currentHash = hash.digest('hex')
        resolve({
          isIntact: currentHash === expectedHash,
          currentHash,
        })
      })
      stream.on('error', (err) => reject(err))
    })
  }

  /**
   * Delete object from MinIO evidence bucket
   */
  async deleteFile(bucketName: string, objectName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, objectName)
  }

  /**
   * Generate secure temporary presigned download URL for evidence viewer
   */
  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expirySeconds: number = 3600
  ): Promise<string> {
    return this.minioClient.presignedGetObject(bucketName, objectName, expirySeconds)
  }
}
