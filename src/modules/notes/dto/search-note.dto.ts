import { IsNotEmptyObject, IsObject, IsString } from 'class-validator'

export class SearchNoteDto {
	@IsString({ message: 'Ensure a query type is specified' })
	queryType: string

	@IsNotEmptyObject({ message: 'Query object must contain a valid ES query' })
	@IsObject({ message: 'Value must be a valid JSON object containing an ES query' })
	query: object
}
