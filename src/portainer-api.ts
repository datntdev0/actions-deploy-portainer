export interface PortainerStack {
  Id: number
  Name: string
  Status: number
}

export interface PortainerStackFromGitPayload {
  method: string
  type: string
  name: string
  repositoryURL: string
  repositoryReferenceName: string
  composeFile: string
  additionalFiles: object[]
  repositoryAuthentication: boolean
  repositoryUsername: string
  repositoryPassword: string
  repositoryGitCredentialID: number
  env: { name: string; value: string }[]
  supportRelativePath: boolean
  filesystemPath: string
  TLSSkipVerify: boolean
}

export const defaultPortainerStackFromGitPayload: PortainerStackFromGitPayload =
  {
    method: 'repository',
    type: 'standalone',
    name: '', // replace with parameter
    repositoryURL: '', // replace with parameter
    repositoryReferenceName: '', // replace with parameter
    composeFile: '', // replace with parameter
    additionalFiles: [],
    repositoryAuthentication: false,
    repositoryUsername: '',
    repositoryPassword: '',
    repositoryGitCredentialID: 0,
    env: [], // replace with parameter
    supportRelativePath: false,
    filesystemPath: '',
    TLSSkipVerify: false
  }

export class PortainerApi {
  private readonly _baseUrl: string
  private readonly _defaultHeaders: HeadersInit

  constructor(baseUrl: string, token: string) {
    this._baseUrl = baseUrl
    this._defaultHeaders = { 'X-API-Key': token }
  }

  async getAllStacks(): Promise<PortainerStack[]> {
    const headers = this._defaultHeaders
    const request = { method: 'GET', headers }
    const response = await fetch(`${this._baseUrl}/api/stacks`, request)
    return (await response.json()) as PortainerStack[]
  }

  async deleteStack(endpointId: number, id: number): Promise<void> {
    const headers = this._defaultHeaders
    const request = { method: 'DELETE', headers }
    await fetch(
      `${this._baseUrl}/api/stacks/${id}?endpointId=${endpointId}`,
      request
    )
  }

  async postStack(
    endpointId: number,
    payload: PortainerStackFromGitPayload
  ): Promise<PortainerStack> {
    const headers = this._defaultHeaders
    const rawData = JSON.stringify(payload)
    const request = { method: 'POST', headers, body: rawData }
    const url = `${this._baseUrl}/api/stacks/create/standalone/repository?endpointId=${endpointId}`
    const response = await fetch(url, request)
    return (await response.json()) as PortainerStack
  }
}
