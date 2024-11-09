/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from "@actions/core";
import { run } from "../src/main"; // Update this to your actual path
import deploy from "../src/portainer"; // Update this to your actual path

jest.mock("@actions/core");
jest.mock("../src/portainer"); // Update this to your actual path

describe("run", () => {
  const mockParams = {
    "base-url": "http://localhost:9000",
    "access-token": "test-token",
    "endpoint-id": "1",
    "stack-name": "test-stack",
    "repository-url": "http://repo.url",
    "repository-ref": "main",
    "compose-file": "docker-compose.yml",
    "env-json": JSON.stringify([{ name: "ENV_VAR", value: "value" }]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (core.getInput as jest.Mock).mockImplementation((name: string) => {
      return mockParams[name as keyof typeof mockParams];
    });
  });

  it("should call deploy with the correct parameters", async () => {
    const expectedParams = {
      baseUrl: mockParams["base-url"],
      accessToken: mockParams["access-token"],
      endpointId: Number.parseInt(mockParams["endpoint-id"]),
      stackName: mockParams["stack-name"],
      repositoryURL: mockParams["repository-url"],
      repositoryReferenceName: mockParams["repository-ref"],
      composeFile: mockParams["compose-file"],
      envJson: mockParams["env-json"],
    };

    await run();

    expect(core.getInput).toHaveBeenCalledWith("base-url");
    expect(core.getInput).toHaveBeenCalledWith("access-token");
    expect(core.getInput).toHaveBeenCalledWith("endpoint-id");
    expect(core.getInput).toHaveBeenCalledWith("stack-name");
    expect(core.getInput).toHaveBeenCalledWith("repository-url");
    expect(core.getInput).toHaveBeenCalledWith("repository-ref");
    expect(core.getInput).toHaveBeenCalledWith("compose-file");
    expect(core.getInput).toHaveBeenCalledWith("env-json");

    expect(deploy).toHaveBeenCalledWith(expectedParams);
  });

  it("should handle errors and set the action as failed", async () => {
    const errorMessage = "Deployment failed";
    (deploy as jest.Mock).mockImplementation(() => {
      throw new Error(errorMessage);
    });

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(errorMessage);
  });
});
