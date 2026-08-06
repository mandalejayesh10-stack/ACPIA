import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto.js'
import { RefreshTokenDto } from './dto/refresh-token.dto.js'
import { UserRole } from './roles.enum.js'
import { JwtPayload } from './decorators/current-user.decorator.js'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
}

@Injectable()
export class AuthService {
  // In-memory active refresh tokens store (will use Redis in Sprint 5)
  private readonly activeSessions = new Map<string, JwtPayload>()

  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto): Promise<{ tokens: AuthTokens; user: Partial<JwtPayload> }> {
    // Demo verification logic (matches Kerala Police Inspector account)
    if (
      loginDto.email === 'jayesh@keralapolice.gov.in' &&
      loginDto.password === 'CyberPassword2026!'
    ) {
      const payload: JwtPayload = {
        sub: 'usr-2024-001',
        email: loginDto.email,
        name: 'Inspector Jayesh',
        role: UserRole.INVESTIGATOR,
        caseAccess: ['CASE-2024-0001', 'CASE-2024-0002'],
        sessionId: `sess-${Date.now()}`,
      }

      const tokens = await this.generateTokens(payload)
      this.activeSessions.set(tokens.refreshToken, payload)

      return {
        tokens,
        user: {
          sub: payload.sub,
          email: payload.email,
          name: payload.name,
          role: payload.role,
        },
      }
    }

    throw new UnauthorizedException('Invalid credentials provided')
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthTokens> {
    const session = this.activeSessions.get(dto.refreshToken)
    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    // Refresh Token rotation per SECURITY.md section 1.1
    this.activeSessions.delete(dto.refreshToken)

    const newPayload: JwtPayload = {
      ...session,
      sessionId: `sess-${Date.now()}`,
    }

    const tokens = await this.generateTokens(newPayload)
    this.activeSessions.set(tokens.refreshToken, newPayload)

    return tokens
  }

  async logout(refreshToken?: string): Promise<{ success: boolean }> {
    if (refreshToken) {
      this.activeSessions.delete(refreshToken)
    }
    return { success: true }
  }

  async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m', // SECURITY.md: Access Token 15 mins
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '8h', // SECURITY.md: Refresh Token 8 hours
    })

    return {
      accessToken,
      refreshToken,
      expiresInSeconds: 900, // 15 mins
    }
  }
}
