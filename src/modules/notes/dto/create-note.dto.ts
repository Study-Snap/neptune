import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateNoteDto {
	@ApiProperty({ default: 'Lecture 5', required: true })
	@IsNotEmpty({ message: 'You must enter a title' })
	@IsString()
	title: string

	@ApiProperty({ default: '91fasffsa48-42fas14-42fsaf1.pdf', required: true })
	@IsNotEmpty({ message: 'Must include a fileUri' })
	@IsString({ message: 'FileUri must be a string' })
	fileUri: string

	@ApiProperty({ default: 'A note about lecture 5 in biology and math', required: true })
	@IsNotEmpty({
		message:
			'Must enter a description for the file. We use this to help find your note. Hint: Pass a "shortDescription" in body of your request'
	})
	@IsString()
	shortDescription: string

	@ApiProperty({ default: '["Science", "College", "Lecture"]', required: true })
	@IsArray({ message: 'Must specify a list of keywords. Hint: Pass a "keywords" in body of your request' })
	@ArrayMinSize(2, { message: 'Must specify at least 2 keywords' })
	keywords: string[]

	@ApiProperty({ default: 'dwa8dya8dwad-dw6ada7wd-gg21277dhd76h', required: true })
	@IsString()
	@IsNotEmpty()
	classId: string

	// Need not require validation (optional)
	@ApiProperty({ default: 'TBD', required: false })
	@IsOptional()
	bibtextCitation?: string
}
