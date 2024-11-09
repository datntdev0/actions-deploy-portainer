import * as core from '@actions/core'

import {
  defaultPortainerStackFromGitPayload,
  PortainerApi,
  PortainerStackFromGitPayload
} from './portainer-api'

export interface PortainerDeployPayload {
  baseUrl: string
  accessToken: string
  endpointId: number
  stackName: string
  repositoryURL: string
  repositoryReferenceName: string
  composeFile: string
  envJson: string
}

export default async function deploy(
  params: PortainerDeployPayload
): Promise<void> {
  const apiInstance = new PortainerApi(params.baseUrl, params.accessToken)

  // 1. Delete a stack if there is already existing in Portainer
  core.info('Checking existing stack with the same name')
  const stacks = await apiInstance.getAllStacks()
  const stack = stacks.find(x => x.Name === params.stackName)
  if (stack) {
    core.info('Deleting existing stack with the same name')
    await apiInstance.deleteStack(params.endpointId, stack.Id)
  }

  // 2. Deploy a new stack from docker compose into Portainer
  core.info('Deploying new stack on Portainer server')
  const payload: PortainerStackFromGitPayload = {
    ...defaultPortainerStackFromGitPayload,
    name: params.stackName,
    repositoryURL: params.repositoryURL,
    repositoryReferenceName: params.repositoryReferenceName,
    composeFile: params.composeFile,
    env: JSON.parse(params.envJson) as { name: string; value: string }[]
  }
  const newStack = await apiInstance.postStack(params.endpointId, payload)
  if (newStack?.Status === 1)
    core.info('Created new stack on Portainer successfully')
}
