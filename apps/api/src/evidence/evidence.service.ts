import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { PrismaService } from '../common/database/prisma.service.js'
import { MinioService } from '../common/storage/minio.service.js'
import { EventBusService } from '../common/events/event-bus.service.js'
import { GraphService } from '../common/graph/graph.service.js'
import { UploadEvidenceDto } from './dto/upload-evidence.dto.js'
import { JwtPayload } from '../auth/decorators/current-user.decorator.js'

@Injectable()
export class EvidenceService {
  private readonly logger = new Logger(EvidenceService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly eventBus: EventBusService,
    private readonly graph: GraphService
  ) {}

  /**
   * Upload evidence file stream, record in PostgreSQL, create CoC entry, and publish bus event
   */
  async uploadEvidence(
    caseId: string,
    file: { originalname: string; mimetype: string; buffer: Buffer; size: number },
    dto: UploadEvidenceDto,
    user: JwtPayload
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('No evidence file buffer provided')
    }

    const objectName = `cases/${caseId}/${Date.now()}-${file.originalname}`

    // 1. Upload to MinIO object storage & compute SHA-256 hash
    const uploadResult = await this.minio.uploadFile(
      'acpia-evidence',
      objectName,
      file.buffer,
      file.mimetype,
      {
        caseId,
        uploadedBy: user.sub,
        originalName: file.originalname,
      }
    )

    // 2. Persist Evidence record in PostgreSQL
    const evidence = await this.prisma.evidence.create({
      data: {
        caseId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
        hashSha256: uploadResult.sha256Hash,
        storagePath: objectName,
        status: 'VALIDATED',
        uploadedById: user.sub,
        metadata: {
          title: dto.title,
          description: dto.description || '',
          collectedFrom: dto.collectedFrom || 'Digital Intake',
        },
      },
    })

    // 3. Create initial COLLECTED Chain of Custody entry
    await this.prisma.chainOfCustody.create({
      data: {
        evidenceId: evidence.id,
        caseId,
        eventType: 'COLLECTED',
        actorType: 'USER',
        actorId: user.sub,
        hash: uploadResult.sha256Hash,
        details: {
          userEmail: user.email,
          userName: user.name,
          fileName: file.originalname,
        },
      },
    })

    // 4. Merge Evidence Node into Neo4j Knowledge Graph per ONTOLOGY.md
    await this.graph.mergeNode('Evidence', evidence.id, {
      caseId,
      filename: file.originalname,
      mimeType: file.mimetype,
      hash: uploadResult.sha256Hash,
      minioKey: objectName,
      uploadedBy: user.sub,
    })

    // 5. Publish acpia.evidence.file.uploaded event on RabbitMQ Bus
    await this.eventBus.publish('acpia.evidence', 'acpia.evidence.file.uploaded', {
      topic: 'acpia.evidence.file.uploaded',
      traceId: `trc-${Date.now()}`,
      correlationId: `cor-${Date.now()}`,
      caseId,
      source: {
        service: 'evidence-api',
        version: '1.0.0',
      },
      payload: {
        evidenceId: evidence.id,
        caseId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        hashSha256: uploadResult.sha256Hash,
        uploadedBy: user.sub,
      },
    })

    const presignedUrl = await this.minio.getPresignedUrl('acpia-evidence', objectName)

    this.logger.log(`Uploaded evidence file ${file.originalname} for case ${caseId}`)

    return {
      id: evidence.id,
      caseId: evidence.caseId,
      fileName: evidence.fileName,
      mimeType: evidence.mimeType,
      sizeBytes: Number(evidence.sizeBytes),
      hashSha256: evidence.hashSha256,
      status: evidence.status,
      presignedUrl,
      createdAt: evidence.createdAt,
    }
  }

  /**
   * List all evidence files for a case
   */
  async getCaseEvidences(caseId: string) {
    const evidences = await this.prisma.evidence.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        chainOfCustody: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    })

    return Promise.all(
      evidences.map(async (ev) => ({
        id: ev.id,
        fileName: ev.fileName,
        mimeType: ev.mimeType,
        sizeBytes: Number(ev.sizeBytes),
        hashSha256: ev.hashSha256,
        status: ev.status,
        isTampered: ev.isTampered,
        uploadedBy: ev.uploadedBy,
        presignedUrl: await this.minio.getPresignedUrl('acpia-evidence', ev.storagePath),
        createdAt: ev.createdAt,
      }))
    )
  }

  /**
   * Get single evidence details & presigned URL
   */
  async getEvidenceDetails(caseId: string, evidenceId: string) {
    const evidence = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, caseId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        chainOfCustody: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    if (!evidence) {
      throw new NotFoundException(`Evidence item ${evidenceId} not found in case ${caseId}`)
    }

    const presignedUrl = await this.minio.getPresignedUrl('acpia-evidence', evidence.storagePath)

    return {
      ...evidence,
      sizeBytes: Number(evidence.sizeBytes),
      presignedUrl,
    }
  }

  /**
   * Delete evidence item
   */
  async deleteEvidence(caseId: string, evidenceId: string, user: JwtPayload) {
    const evidence = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, caseId },
    })

    if (!evidence) {
      throw new NotFoundException(`Evidence item ${evidenceId} not found in case ${caseId}`)
    }

    // 1. Remove file object from MinIO
    await this.minio.deleteFile('acpia-evidence', evidence.storagePath)

    // 2. Delete Evidence record from DB
    await this.prisma.evidence.delete({
      where: { id: evidenceId },
    })

    this.logger.log(`User ${user.email} deleted evidence ${evidenceId} from case ${caseId}`)

    return { success: true, message: `Evidence item ${evidenceId} deleted successfully` }
  }
}
