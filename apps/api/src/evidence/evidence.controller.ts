import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger'
import { EvidenceService } from './evidence.service.js'
import { UploadEvidenceDto } from './dto/upload-evidence.dto.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'
import { RolesGuard } from '../auth/guards/roles.guard.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { UserRole } from '../auth/roles.enum.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'

@ApiTags('Evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cases/:caseId/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post()
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload Evidence File to Case' })
  @ApiResponse({ status: 201, description: 'Evidence uploaded successfully' })
  async uploadEvidence(
    @Param('caseId') caseId: string,
    @UploadedFile() file: { originalname: string; mimetype: string; buffer: Buffer; size: number },
    @Body() dto: UploadEvidenceDto,
    @CurrentUser() user: Record<string, unknown>
  ) {
    return this.evidenceService.uploadEvidence(caseId, file, dto, user as any)
  }

  @Get()
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'List All Evidence Files for Case' })
  async getCaseEvidences(@Param('caseId') caseId: string) {
    return this.evidenceService.getCaseEvidences(caseId)
  }

  @Get(':id')
  @Roles(UserRole.INVESTIGATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR)
  @ApiOperation({ summary: 'Get Evidence Details & Presigned Preview URL' })
  async getEvidenceDetails(@Param('caseId') caseId: string, @Param('id') id: string) {
    return this.evidenceService.getEvidenceDetails(caseId, id)
  }

  @Delete(':id')
  @Roles(UserRole.SUPERVISOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete Evidence File (Supervisor / Admin only)' })
  async deleteEvidence(
    @Param('caseId') caseId: string,
    @Param('id') id: string,
    @CurrentUser() user: Record<string, unknown>
  ) {
    return this.evidenceService.deleteEvidence(caseId, id, user as any)
  }
}
