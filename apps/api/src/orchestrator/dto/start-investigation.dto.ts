import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class StartInvestigationDto {
  @ApiProperty({ example: ['ev-001', 'ev-002'], description: 'List of evidence IDs to process' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  evidenceIds!: string[]

  @ApiPropertyOptional({ example: { enableSyntheticDetection: true } })
  @IsOptional()
  pipelineConfig?: Record<string, unknown>
}
