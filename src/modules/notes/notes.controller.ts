import { Controller, Get, Request } from '@nestjs/common'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'

@Controller('/api/notes')
export class NotesController {
	@JwtAuth()
	@Get('test')
	async tessEndpoint(@Request() req) {
		return {
			status: 'success',
			message: 'Authenticated Request Successful!',
			user: req.user
		}
	}
}
