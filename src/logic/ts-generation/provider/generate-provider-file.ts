export const getProviderFile = (): string => {
  const imports = `
  import { HttpService } from '@nestjs/axios'
  import { Inject, Injectable } from '@nestjs/common'
  import type { AxiosError, AxiosResponse } from 'axios'
  
  import type {
    GetInstitutionsOptionsError,
    GetInstitutionsOptionsSuccess,
  } from '@hublo/api-types/service-institution/InstitutionOptionsController/getInstitutionsOptions'
  import { path as getInstitutionOptionsPath } from '@hublo/api-types/service-institution/InstitutionOptionsController/getInstitutionsOptions'
  import type { BadRequestResponseDto } from '@hublo/api-types/service-institution/api-types'
  import { AppConfig, type GlobalAppConfig } from '@hublo/configuration'
  import {
    EntityNotFoundException,
    RemoteBackendException,
  } from '@hublo/exceptions'
  
  import { InvalidInstitutionOptionsError } from './errors/invalid-institution-options.error'
  import type { GetInstitutionOptionsResponse } from './types/institution-options'`;

  const constructor = `
  constructor(
    @Inject(AppConfig)
    private readonly config: GlobalAppConfig,
    private readonly httpService: HttpService,
  ) {}`;

  const method = `
  async getInstitutionOptions(
    idInstitution: number,
  ): Promise<GetInstitutionOptionsResponse> {
    const url = \`\${this.config.monorepoBaseUrl}\${getInstitutionOptionsPath}\`
    const { data } = await this.httpService.axiosRef
      .get<GetInstitutionsOptionsSuccess>(url, {
        headers: {
          authorization: \`Bearer \${this.config.superAdminAccessToken}\`,
        },
        params: {
          idInstitutions: [idInstitution],
        },
      })
      .catch((err: AxiosError<GetInstitutionsOptionsError>) => {
        throw new RemoteBackendException(
          url,
          err.response?.data.message.toString() ?? err.message,
          err,
        )
      })
    const institution = data.result.find(({ id }) => id === idInstitution)
    if (!institution) {
      throw new EntityNotFoundException(
        \`institution \${idInstitution} not found\`,
      )
    }
    return {
      institution: {
        id: institution.id,
        name: institution.name,
      },
      options: new Map(
        institution.institutionOptions.map((option) => [option.name, option]),
      ),
    }
  }
  `;

  const providerClass = `
@Injectable()
export class InstitutionOptionsProvider {
    ${constructor}
    ${method}
}
  `;
  return `
${imports}
  
${providerClass}`;
};
