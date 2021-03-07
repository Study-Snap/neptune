import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { getConfig } from '../../config'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { JwtStrategy } from './strategies/jwt.strategy'

// Configuration for Auth
const config: IConfigAttributes = getConfig()

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: config.jwtSecret
		})
	],
	providers: [
		JwtStrategy
	]
})
export class AuthModule {}
