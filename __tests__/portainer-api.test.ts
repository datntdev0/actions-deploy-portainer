/* eslint-disable @typescript-eslint/no-unsafe-assignment*/

import {
  defaultPortainerStackFromGitPayload,
  PortainerApi
} from '../src/portainer-api'

global.fetch = jest.fn(async () =>
  Promise.resolve({
    json: async () => Promise.resolve([]) // Default mock for all stacks
  })
) as jest.Mock

describe('PortainerApi', () => {
  const baseUrl = 'http://localhost:9000'
  const token = 'test-token'
  let portainerApi: PortainerApi

  beforeEach(() => {
    portainerApi = new PortainerApi(baseUrl, token)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should fetch all stacks', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () =>
        Promise.resolve([
          { id: 1, name: 'stack1', status: 1 },
          { id: 2, name: 'stack2', status: 0 }
        ])
    })

    const stacks = await portainerApi.getAllStacks()

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/stacks`, {
      method: 'GET',
      headers: expect.objectContaining({ 'X-API-Key': token })
    })
    expect(stacks).toEqual([
      { id: 1, name: 'stack1', status: 1 },
      { id: 2, name: 'stack2', status: 0 }
    ])
  })

  it('should delete a stack', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({})

    await portainerApi.deleteStack(1, 123)

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/stacks/123?endpointId=1`,
      {
        method: 'DELETE',
        headers: expect.objectContaining({ 'X-API-Key': token })
      }
    )
  })

  it('should post a new stack', async () => {
    const payload = {
      ...defaultPortainerStackFromGitPayload,
      name: 'new-stack',
      repositoryURL: 'http://repo.url'
    }
    const returnedStack = { id: 123, name: 'new-stack', status: 1 }

    ;(fetch as jest.Mock).mockResolvedValueOnce({
      json: async () => Promise.resolve(returnedStack)
    })

    const stack = await portainerApi.postStack(1, payload)

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/stacks/create/standalone/repository?endpointId=1`,
      {
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': token }),
        body: JSON.stringify(payload)
      }
    )
    expect(stack).toEqual(returnedStack)
  })
})
