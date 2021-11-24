import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

/**
 * Data transfer object specification for creating a note
 */
export class CreateNoteDto {
	@ApiProperty({ default: 'Lecture 5', required: true })
	@MinLength(5, { message: 'Note title must be at least 5 characters long' })
	@MaxLength(25, { message: 'Note title must be less than 25 characters long' })
	@IsString()
	title: string

	@ApiProperty({ default: 'XXXXXXXX-XXXXXXXXXX-XXXXXX.pdf', required: true })
	@IsNotEmpty({ message: 'Must include a fileUri' })
	@IsString({ message: 'FileUri must be a string' })
	fileUri: string

	@ApiProperty({ default: 'A note about lecture 5 in biology and math', required: true })
	@MinLength(60, {
		message:
			'Short description must be at least 60 characters long and provide some detail to the contents of the note.'
	})
	@MaxLength(120, { message: 'Short description must be less than 120 characters long' })
	@IsString()
	shortDescription: string

	@ApiProperty({ default: '["Science", "College", "Lecture"]', required: true })
	@IsArray({ message: 'Must specify a list of keywords. Hint: Pass a "keywords" in body of your request' })
	@ArrayMinSize(2, { message: 'Must specify at least 2 keywords' })
	keywords: string[]

	@ApiProperty({ default: 'XXXXXXXXXXXX-XXXXXXXXXX-XXXXXXX-XXXXXX', required: true })
	@IsString()
	@IsNotEmpty()
	classId: string

	// Need not require validation (optional)
	@ApiProperty({ default: 'TBD', required: false })
	@IsOptional()
	bibtextCitation?: string
}
