import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JWT_STRATEGY } from '../../../common/constants'

/**
 * Implements the JWT auth guard and strategy that can be injected into a controller through the decorator jwtAuth
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY) {}
