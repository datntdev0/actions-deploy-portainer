import * as core from '@actions/core'
import deploy, { PortainerDeployPayload } from './portainer'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const parameters: PortainerDeployPayload = {
      baseUrl: core.getInput('base-url'),
      accessToken: core.getInput('access-token'),
      endpointId: Number.parseInt(core.getInput('endpoint-id')),
      stackName: core.getInput('stack-name'),
      repositoryURL: core.getInput('repository-url'),
      repositoryReferenceName: core.getInput('repository-ref'),
      composeFile: core.getInput('compose-file'),
      envJson: core.getInput('env-json') || '{}'
    }

    await deploy(parameters)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
