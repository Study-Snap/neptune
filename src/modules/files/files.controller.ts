import {
	BadRequestException,
	Controller,
	HttpStatus,
	Post,
	Request,
	UploadedFile,
	UseInterceptors
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBody, ApiHeader, ApiResponse, ApiTags } from '@nestjs/swagger'
import { diskStorage } from 'multer'
import { JwtAuth } from '../../common/decorators/jwt-auth.decorator'
import { IConfigAttributes } from '../../common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { editFileName } from '../notes/helper'
import { FileCreateResponseType } from './types/create-note-resp.type'

const config: IConfigAttributes = getConfig()

@ApiTags('files')
@Controller('files')
export class FilesController {
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
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: config.fileStorageLocation,
				filename: editFileName
			})
		})
	)
	@Post()
	async createNoteFile(@Request() req, @UploadedFile() file: Express.Multer.File): Promise<object> {
		if (!file) {
			throw new BadRequestException('You must include a file')
		}

		// Return the uploaded file ID (URI)
		return {
			statusCode: HttpStatus.CREATED,
			fileUri: file.filename,
			message: 'File was successfully uploaded to cloud storage'
		}
	}
}
