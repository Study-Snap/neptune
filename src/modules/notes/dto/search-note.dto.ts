import { IsOptional, IsString } from 'class-validator'

export class SearchNoteDto {
	@IsString({ message: 'Ensure a query type is specified' })
	queryType: string

	@IsString({ message: 'Must specify a search term or phrase' })
	searchPhrase: string

	@IsOptional()
	@IsString()
	defaultField?: string
}
