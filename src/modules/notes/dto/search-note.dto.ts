import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmptyObject, IsObject, IsString } from 'class-validator'

export class SearchNoteDto {
	@ApiProperty({ default: 'query_string', required: true })
	@IsString({ message: 'Ensure a query type is specified' })
	queryType: string

	@ApiProperty({ default: 'Pig Anotomy', required: true })
	@IsNotEmptyObject({ message: 'Query object must contain a valid ES query' })
	@IsObject({ message: 'Value must be a valid JSON object containing an ES query' })
	query: object

	@ApiProperty({ default: '8dyaw7da67f-fa6ftaw67fwa-fwafyawf6', required: true })
	@IsString({ message: 'Must provide an associated class ID where searching' })
	classId: string
}
