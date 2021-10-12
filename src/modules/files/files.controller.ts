import {
	Controller,
	HttpStatus,
	InternalServerErrorException,
	Post,
	Request,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { FileCreateResponseType } from './types/create-note-resp.type'
import { FilesService } from './files.service'
import { SpaceType } from '../../common/constants'

@ApiTags('files')
@Controller('files')
export class FilesController {
	constructor(private readonly fileService: FilesService) {}

	@ApiBody({
		type: Object,
		description: 'A multi-part file attachment to upload to StudySnap'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: FileCreateResponseType,
		description: 'A status object that confirms success or failure of uploading a note file'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@UseInterceptors(FileInterceptor('file'))
	@Post('note')
	async createNoteFile(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<object> {
		const fileUri = await this.fileService.createFile(file, SpaceType.NOTES)

		if (!fileUri) {
			throw new InternalServerErrorException(`Did not get a valid FileURI for the file`)
		}

		// Return the uploaded file ID (URI)
		return {
			statusCode: HttpStatus.CREATED,
			fileUri: fileUri,
			message: 'File was successfully uploaded!'
		}
	}

	@ApiBody({
		type: Object,
		description: 'A multi-part file attachment to upload to StudySnap'
	})
	@ApiResponse({
		status: HttpStatus.OK,
		type: FileCreateResponseType,
		description: 'A status object that confirms success or failure of uploading an image file'
	})
	@ApiHeader({
		name: 'Authorization',
		example: 'Bearer <jwt_token>',
		description: 'A JWT access token that proves authorization for this endpoint'
	})
	@JwtAuth()
	@UseInterceptors(FileInterceptor('file'))
	@Post('image')
	async createImageFile(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<object> {
		const fileUri = await this.fileService.createFile(file, SpaceType.IMAGES)

		if (!fileUri) {
			throw new InternalServerErrorException(`Did not get a valid FileURI for the file`)
		}

		// Return the uploaded file ID (URI)
		return {
			statusCode: HttpStatus.CREATED,
			fileUri: fileUri,
			message: 'File was successfully uploaded!'
		}
	}
}
