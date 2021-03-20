import axios, { AxiosRequestConfig } from 'axios'

export const TEST_AUTH_URL = 'http://localhost:5555/api/auth'
export const TEST_USERNAME = 'test_sa@example.com'
export const TEST_PASSWORD = '02809b3927fcc767ad65ce8a6e57afce'

// Function for creating a test account on auth
export const createTestAccountForE2e = async () => {
	const options: AxiosRequestConfig = {
		method: 'POST',
		url: `${TEST_AUTH_URL}/register`,
		data: {
			firstName: 'John',
			lastName: 'Doe',
			email: TEST_USERNAME,
			password: TEST_PASSWORD
		},
		responseType: 'json'
	}

	try {
		const res = await axios(options)
		return res.status === 201
	} catch (err) {
		return
	}
}

// Function for retrieving an access token for testing
export const getAccessTokenFromAuth = async (email: string, password: string) => {
	const options: AxiosRequestConfig = {
		method: 'POST',
		url: `${TEST_AUTH_URL}/login`,
		data: {
			email: email,
			password: password
		}
	}

	const res = await axios(options)

	return res.data.accessToken
}
