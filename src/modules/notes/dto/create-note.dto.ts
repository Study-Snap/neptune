import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateNoteDto {
	@IsNotEmpty({ message: 'You must enter a title' })
	@IsString()
	title: string

	@IsNotEmpty({ message: 'Must include a fileUri' })
	@IsString({ message: 'FileUri must be a string' })
	fileUri: string

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
	@IsOptional() bibtextCitation?: string
}
