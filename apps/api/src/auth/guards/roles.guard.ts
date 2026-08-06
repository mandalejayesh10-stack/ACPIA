import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator.js'
import { UserRole } from '../roles.enum.js'
import { JwtPayload } from '../decorators/current-user.decorator.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles || requiredRoles.length === 0) {
      return true
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user as JwtPayload

    if (!user || !user.role) {
      throw new ForbiddenException('User identity or role missing')
    }

    const hasRole = requiredRoles.includes(user.role as UserRole)
    if (!hasRole) {
      throw new ForbiddenException(
        `Insufficient role privileges. Required: [${requiredRoles.join(', ')}]`
      )
    }

    return true
  }
}
