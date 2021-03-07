import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { JWT_STRATEGY } from '../../../common/constants'

@Injectable()
export class JwtAuthGuard extends AuthGuard(JWT_STRATEGY) {}
