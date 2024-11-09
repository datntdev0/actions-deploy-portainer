/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import * as core from '@actions/core'
import deploy, { PortainerDeployPayload } from '../src/portainer'
import { defaultPortainerStackFromGitPayload } from '../src/portainer-api'

global.fetch = jest.fn()

jest.mock('@actions/core', () => ({
  info: jest.fn(),
  getInput: jest.fn(),
  setFailed: jest.fn()
}))

describe('deploy', () => {
  const baseUrl = 'http://localhost:9000'
  const token = 'test-token'
  const endpointId = 1
  const stackName = 'test-stack'
  const repositoryURL = 'http://repo.url'
  const repositoryReferenceName = 'main'
  const composeFile = 'docker-compose.yml'
  const envJson = JSON.stringify([{ name: 'ENV_VAR', value: 'value' }])

  const params: PortainerDeployPayload = {
    baseUrl,
    accessToken: token,
    endpointId,
    stackName,
    repositoryURL,
    repositoryReferenceName,
    composeFile,
    envJson
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(fetch as jest.Mock).mockImplementation(
      async (url, options: RequestInit) => {
        if (options.method === 'GET') {
          return Promise.resolve({
            json: async () => Promise.resolve([])
          })
        } else if (options.method === 'POST') {
          return Promise.resolve({
            json: async () =>
              Promise.resolve({ id: 123, name: stackName, status: 1 })
          })
        }
        return Promise.resolve({
          json: async () => Promise.resolve({})
        })
      }
    )
  })

  it('should deploy a new stack when no existing stack is found', async () => {
    await deploy(params)

    expect(core.info).toHaveBeenCalledWith(
      'Checking existing stack with the same name'
    )
    expect(core.info).toHaveBeenCalledWith(
      'Deploying new stack on Portainer server'
    )
    expect(core.info).toHaveBeenCalledWith(
      'Created new stack on Portainer successfully'
    )

    const expectedPayload = {
      ...defaultPortainerStackFromGitPayload,
      name: stackName,
      repositoryURL,
      repositoryReferenceName,
      composeFile,
      env: JSON.parse(envJson)
    }

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenNthCalledWith(1, `${baseUrl}/api/stacks`, {
      method: 'GET',
      headers: expect.objectContaining({ 'X-API-Key': token })
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/api/stacks/create/standalone/repository?endpointId=${endpointId}`,
      {
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': token }),
        body: JSON.stringify(expectedPayload)
      }
    )
  })

  it('should delete an existing stack and deploy a new one', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () =>
        Promise.resolve([{ id: 123, name: stackName, status: 1 }])
    })
    ;(fetch as jest.Mock).mockResolvedValueOnce({})
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => Promise.resolve({ id: 124, name: stackName, status: 1 })
    })

    await deploy(params)

    expect(core.info).toHaveBeenCalledWith(
      'Checking existing stack with the same name'
    )
    expect(core.info).toHaveBeenCalledWith(
      'Deleting existing stack with the same name'
    )
    expect(core.info).toHaveBeenCalledWith(
      'Deploying new stack on Portainer server'
    )
    expect(core.info).toHaveBeenCalledWith(
      'Created new stack on Portainer successfully'
    )

    const expectedPayload = {
      ...defaultPortainerStackFromGitPayload,
      name: stackName,
      repositoryURL,
      repositoryReferenceName,
      composeFile,
      env: JSON.parse(envJson)
    }

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(1, `${baseUrl}/api/stacks`, {
      method: 'GET',
      headers: expect.objectContaining({ 'X-API-Key': token })
    })
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `${baseUrl}/api/stacks/123?endpointId=${endpointId}`,
      {
        method: 'DELETE',
        headers: expect.objectContaining({ 'X-API-Key': token })
      }
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      `${baseUrl}/api/stacks/create/standalone/repository?endpointId=${endpointId}`,
      {
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': token }),
        body: JSON.stringify(expectedPayload)
      }
    )
  })
})
