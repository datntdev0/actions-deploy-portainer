# GitHub Action to deploy docker-compose on Portainer

![GitHub Super-Linter](https://github.com/datntdev0/actions-deploy-portainer/actions/workflows/check-linter.yml/badge.svg)
![Continuous Integration](https://github.com/datntdev0/actions-deploy-portainer/actions/workflows/continuous-integration.yml/badge.svg)
![Check Transpiled JavaScript](https://github.com/datntdev0/actions-deploy-portainer/actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/datntdev0/actions-deploy-portainer/actions/workflows/codeql-analysis.yml/badge.svg)
![Coverage](./badges/coverage.svg)

This GitHub Action automates the deployment of a Docker-Compose file as a new
stack on a Portainer server. It simplifies continuous deployment workflows by
integrating directly with your Portainer instance, ensuring that your
multi-container applications are consistently up-to-date.

## Prerequisites

- You must have a running Portainer and can access from outside.
- You must have a access key with the Environment Administrator permission to
  deploy into that environment.
- At this version, we are only support to deploy with public git repository.

## Action usages

### Action inputs

Input|Description|Default
---|---|---
base-url|The base url of the Portainer server|required
access-token|The access token generated from user of Portainer|required
endpoint-id|The environment id to deploy stack|required
stack-name|The name of stack|required
repository-url|The git repository url storing the docker-compose|required
repository-ref|The ref branch name of git repository|required
compose-file|The docker-compose file path relative from the root|required
env-json|The environment varialble json object|required

### Examples

```yml
deploy-docker-images:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Portainer stack
        uses: datntdev0/actions-deploy-portainer@v0.0.1
        with:
          base-url: ${{ secrets.PORTAINER_BASE_URL }}
          access-token: ${{ secrets.PORTAINER_ACCESS_TOKEN }}
          endpoint-id: ${{ secrets.PORTAINER_ENDPOINT_ID }}
          stack-name: ${{ secrets.PORTAINER_STACK_NAME }}
          repository-url: https://github.com/${{ github.repository }}.git
          repository-ref: ${{ github.ref }}
          compose-file: .github/deploy/docker-compose.${{ inputs.environment }}.yml
          env-json: ${{ secrets.PORTAINER_ENV_JSON }}
```