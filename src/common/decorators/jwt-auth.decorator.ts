import { applyDecorators, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../modules/auth/guards/jwt-auth.guard'

/**
 * Applies JWT authentication requirement and validation on any function that implements this decorator
 * @param additionalGuards Any additional guards that should be applied alongside the JwtAuth guard
 * @returns A new decorator that implements the guard on the endpoint in the controller
 */
export function JwtAuth(...additionalGuards: any[]) {
	return applyDecorators(UseGuards(JwtAuthGuard, ...additionalGuards))
}
