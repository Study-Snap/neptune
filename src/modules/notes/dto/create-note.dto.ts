import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class CreateNoteDto {
	@IsNotEmpty({ message: 'You must enter a title' })
	@IsString()
	title: string

	@IsNotEmpty({ message: 'Must include a file ID' })
	@IsString({ message: 'FileUri must be a string' })
	fileUri: string

	@IsBoolean({
		message:
			'Must specify whether this note is public or not by default. Hint: Pass a "isPublic" in body of your request'
	})
	isPublic: boolean

	@IsBoolean({
		message:
			'Must specify whether the file is allowed to be downloaded. Hint: Pass a "allowDownloads" in body of your request'
	})
	allowDownloads: boolean

	@IsNotEmpty({
		message:
			'Must enter a description for the file. We use this to help find your note. Hint: Pass a "shortDescription" in body of your request'
	})
	@IsString()
	shortDescription: string

	@IsArray({ message: 'Must specify a list of keywords. Hint: Pass a "keywords" in body of your request' })
	@ArrayMinSize(2, { message: 'Must specify at least 2 keywords' })
	keywords: string[]

	@IsString()
	@IsNotEmpty()
	classId: string

	// Need not require validation (optional)
	bibtextCitation?: string
}
