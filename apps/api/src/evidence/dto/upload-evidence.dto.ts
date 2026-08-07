import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UploadEvidenceDto {
  @ApiProperty({ example: 'Threatening Chat Screenshot', description: 'Evidence item title' })
  @IsString()
  @IsNotEmpty()
  title!: string

  @ApiPropertyOptional({ example: 'Extracted from suspect device during forensic intake' })
  @IsString()
  @IsOptional()
  description?: string

  @ApiPropertyOptional({ example: 'Mobile Intake' })
  @IsString()
  @IsOptional()
  collectedFrom?: string
}
