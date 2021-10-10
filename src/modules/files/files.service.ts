import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common'
import { AWSError, Endpoint, S3 } from 'aws-sdk'
import { IConfigAttributes } from 'src/common/interfaces/config/app-config.interface'
import { getConfig } from '../../config'
import { v4 as uuid } from 'uuid'
import * as pdf from 'pdf-parse'
import { PromiseResult } from 'aws-sdk/lib/request'

const config: IConfigAttributes = getConfig()

@Injectable()
export class FilesService {
	/**
	 * Creates the file in S3 object storage on the cloud
	 * @param file A File object containing a raw buffer
	 * @returns A unique fileURI (or Key as known in S3 terms)
	 */
	async createFile(file: Express.Multer.File): Promise<string | undefined> {
		if (!file) {
			throw new BadRequestException('You must include a file')
		}

		// Init Spaces Connection
		const s3 = new S3({
			endpoint: new Endpoint(config.spacesEndpoint),
			accessKeyId: config.spacesKey,
			secretAccessKey: config.spacesSecret
		})

		// Generate DO Upload Params
		const uParams = {
			Bucket: config.noteDataSpace,
			Key: `${uuid()}.${file.originalname.split('.').pop()}`,
			Body: file.buffer,
			ACL: 'public-read',
			Metadata: {
				type: 'Note'
			}
		}
		const res = await s3.putObject(uParams).promise()

		if (!res || res.$response.error) {
			throw new InternalServerErrorException(`Failed to upload file ... Reason: ${res.$response.error}`)
		}

		return uParams.Key
	}

	/**
	 * Uses the S3 API to get metadata from the file and verifies it is not empty
	 * @param fileUri A unique FileURI that points to a file in S3 object storage
	 * @returns True if the file exists and is not empty
	 */
	async remoteFileExists(fileUri: string): Promise<boolean> {
		// Init Spaces Connection
		const s3 = new S3({
			endpoint: new Endpoint(config.spacesEndpoint),
			accessKeyId: config.spacesKey,
			secretAccessKey: config.spacesSecret
		})

		const params = {
			Bucket: config.noteDataSpace,
			Key: fileUri
		}

		try {
			const headCode = await s3.headObject(params).promise()
			return headCode.ContentLength > 0
		} catch (err) {
			if (err.code === 'NotFound') {
				return false
			}
			throw new InternalServerErrorException(`An unknown error occurred when verifying file exists`)
		}
	}

	/**
	 * Produces a raw file from S3 storage provided the appropriate file URI
	 * @param fileUri A unique File URI that points to the remote file in S3 object storage
	 * @returns The response objects from S3
	 */
	async getFileObjectWithID(fileUri: string): Promise<PromiseResult<S3.GetObjectOutput, AWSError>> {
		// Initialize DO Spaces (s3 client)
		const s3 = new S3({
			endpoint: new Endpoint(config.spacesEndpoint),
			accessKeyId: config.spacesKey,
			secretAccessKey: config.spacesSecret
		})

		// Get object using fileUri (key) from spaces
		const params = {
			Bucket: config.noteDataSpace,
			Key: fileUri
		}

		const fileExists = await this.remoteFileExists(fileUri)
		if (!fileExists) {
			throw new NotFoundException(`Could not get file with URI ${fileUri} since it does not exist`)
		}

		const res = await s3.getObject(params).promise()
		if (!res || res.$response.error) {
			throw new InternalServerErrorException(`Unknown error occurred getting file from remote ...`)
		}

		return res
	}

	/**
	 * Used to delete a file from S3 object storage
	 * @param fileUri A unique fileURI that points to a file in S3 storage 
	 */
	async deleteFileWithID(fileUri: string): Promise<void> {
		// Init Spaces Connections
		const s3 = new S3({
			endpoint: new Endpoint(config.spacesEndpoint),
			accessKeyId: config.spacesKey,
			secretAccessKey: config.spacesSecret
		})
		const params = {
			Bucket: config.noteDataSpace,
			Key: fileUri
		}

		// This function will return 204 with no body either way
		await s3.deleteObject(params).promise()
	}

	/**
	 * Extracts the body/text from a note file for use in the current DB implementation
	 * @param path The path to the note file
	 * @returns A full-text extraction from the PDF document containing all content and some formatting
	*/
	async extractBodyFromPDF(fileUri: string): Promise<string | undefined> {
		// Ensure proper file format
		if (fileUri.split('.').pop() !== 'pdf') {
			// TODO: Realistically, we should throw an error here
			return 'Cannot automatically extract content from this file.'
		}

		// Initialize DO Spaces (s3 client)
		const s3 = new S3({
			endpoint: new Endpoint(config.spacesEndpoint),
			accessKeyId: config.spacesKey,
			secretAccessKey: config.spacesSecret
		})

		// Get object using fileUri (key) from spaces
		const dParams = {
			Bucket: config.noteDataSpace,
			Key: fileUri
		}

		const res = await s3.getObject(dParams).promise()
		if (res.$response.error || !res.Body) {
			throw new InternalServerErrorException(`Error downloading file (${fileUri}) for body extraction.`)
		}

		// Use pdf-parse to read the text from the document
		const pdfData = await pdf(res.Body, { max: 16 })

		return pdfData.text
	}
}
