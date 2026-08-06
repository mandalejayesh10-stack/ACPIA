import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'jayesh@keralapolice.gov.in',
    description: 'Investigator official email',
  })
  @IsEmail({}, { message: 'Invalid email address format' })
  @IsNotEmpty()
  email!: string

  @ApiProperty({ example: 'CyberPassword2026!', description: 'User account password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string
}
