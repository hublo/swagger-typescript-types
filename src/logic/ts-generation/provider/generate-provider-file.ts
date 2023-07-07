import { ApiRouteParameter } from '../../../types/swagger-schema.interfaces';
import { getPathName } from '../../json-parsing/route/get-route-path';
import { capitalize } from '../../util/capitalize';
import { generateOutcomeType } from '../utils/get-route-outputs-exports';

const getOutcomeTypeImport = (routeName: string): string => {
  const route = capitalize(routeName);
  return `import type {
  ${generateOutcomeType(route, 'Error')},
  ${generateOutcomeType(route, 'Success')},
} from '../${routeName}'`;
};

const getOutcomePathImport = (
  routeName: string,
  parameters: Array<ApiRouteParameter>,
): string => {
  const pathParameters = parameters.filter((el) => el.in === 'path');
  if (pathParameters.length === 0) {
    return `import { path } from '../${routeName}'`;
  }

  return `import { getPath } from '../${routeName}'`;
};

const getMethod = (
  routeName: string,
  parameters: Array<ApiRouteParameter>,
): string => {
  const route = capitalize(routeName);
  const successOutcomeType = generateOutcomeType(route, 'Success');
  const errorOutcomeType = generateOutcomeType(route, 'Error');

  const method = `
  async ${routeName}Provider(
    idInstitution: number,
  ): Promise<${successOutcomeType}> {
    const url = \`\${this.config.monorepoBaseUrl}\${${getPathName(
      parameters,
    )}}\`
    const { data } = await this.httpService.axiosRef
      .get<${successOutcomeType}>(url, {
        headers: {
          authorization: \`Bearer \${this.config.superAdminAccessToken}\`,
        },
        params: {
          idInstitutions: [idInstitution],
        },
      })
      .catch((err: AxiosError<${errorOutcomeType}>) => {
        throw new RemoteBackendException(
          url,
          err.response?.data.message.toString() ?? err.message,
          err,
        )
      })
    return data.result
  }
  `;
  return method;
};

export const getProviderFile = (
  routeName: string,
  parameters: Array<ApiRouteParameter>,
  controllerName: string,
  bodyModel?: BodyModel,
): string => {
  const outcomeTypeImport = getOutcomeTypeImport(routeName);
  const outcomePathImport = getOutcomePathImport(routeName, parameters);
  const providerName = controllerName.replace('Controller', 'Provider');

  const imports = `
  import { HttpService } from '@nestjs/axios'
  import { Inject, Injectable } from '@nestjs/common'
  import type { AxiosError, AxiosResponse } from 'axios'
  
  ${outcomeTypeImport}
  ${outcomePathImport}
  
  import type { BadRequestResponseDto } from '@hublo/api-types/service-institution/api-types'
  import { AppConfig, type GlobalAppConfig } from '@hublo/configuration'
  import {
    EntityNotFoundException,
    RemoteBackendException,
  } from '@hublo/exceptions'
  `;

  const constructor = `
  constructor(
    @Inject(AppConfig)
    private readonly config: GlobalAppConfig,
    private readonly httpService: HttpService,
  ) {}`;

  const method = getMethod(routeName, parameters);

  const providerClass = `
@Injectable()
export class ${providerName} {
    ${constructor}
    ${method}
}
  `;
  return `
${imports}
  
${providerClass}`;
};
