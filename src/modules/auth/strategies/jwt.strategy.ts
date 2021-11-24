import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { getConfig } from '../../../config'
import { JWT_STRATEGY } from '../../../common/constants'
import { IConfigAttributes } from '../../../common/interfaces/config/app-config.interface'

const config: IConfigAttributes = getConfig()

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
	constructor() {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.jwtSecret
		})
	}

	/**
	 * Validates the JWT payload and provides the payload values in cleartext
	 * @param payload The JWT payload to validate and decode
	 * @returns The decoded JWT object with clear-text values
	 */
	async validate(payload: any) {
		return {
			id: payload.sub,
			email: payload.email
		}
	}
}
