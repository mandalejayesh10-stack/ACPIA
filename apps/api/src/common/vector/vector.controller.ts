import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { VectorService } from './vector.service.js'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js'
import { RolesGuard } from '../../auth/guards/roles.guard.js'
import { Roles } from '../../auth/decorators/roles.decorator.js'
import { UserRole } from '../../auth/roles.enum.js'

@ApiTags('Vector Search')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cases/:caseId/vector')
export class VectorController {
  constructor(private readonly vectorService: VectorService) {}

  @Post('search')
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Semantic Vector Search Across Case Evidence' })
  async searchVectors(
    @Param('caseId') caseId: string,
    @Body() body: { query: string; collection?: string; limit?: number }
  ) {
    return this.vectorService.semanticSearchByQueryText(
      caseId,
      body.query,
      body.collection || 'acpia_evidence',
      body.limit || 10
    )
  }

  @Post('index')
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Index Text into Qdrant Vector Collection' })
  async indexText(
    @Param('caseId') caseId: string,
    @Body() body: { evidenceId: string; text: string; metadata?: Record<string, unknown> }
  ) {
    await this.vectorService.indexEvidenceEmbedding(
      body.evidenceId,
      caseId,
      body.text,
      body.metadata
    )
    return { success: true, message: `Indexed embedding for evidence ${body.evidenceId}` }
  }
}
