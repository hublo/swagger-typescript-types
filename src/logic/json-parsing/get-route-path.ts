import {
  ApiRouteParameter,
  ApiTypeDefinition,
  Server,
} from '../../types/swagger-schema.interfaces';
import { displayWarning } from '../cli/console/console.messages';

import { getSchemaName } from './get-schema-name';

const getModel = (
  operationId: string,
  name: string,
  schema: ApiTypeDefinition,
): string => {
  if (schema.$ref) {
    return getSchemaName(schema.$ref);
  }

  if (schema.type) {
    if (schema.type === 'array' && schema.items) {
      if (schema.items.$ref) {
        return `Array<${getSchemaName(schema.items.$ref)}>`;
      } else if (schema.items.type) {
        return `Array<${schema.items.type}>`;
      }

      displayWarning(
        `Unable to extract type from ${name}; given array without $ref or type`,
        operationId,
      );
      return 'never';
    }

    return schema.type;
  }

  displayWarning(
    `Unable to extract type from ${name}; no $ref or type provided`,
    operationId,
  );
  return 'never';
};

const deprecatedJsdoc = '/** @deprecated */\n';

export const getRoutePath = (
  id: string,
  routeName: string,
  rawPath: string,
  parameters: Array<ApiRouteParameter>,
  servers?: Array<Server>,
  deprecated?: boolean,
): string => {
  const pathParameters = parameters.filter((el) => el.in === 'path');
  const parameterizedPath = rawPath.replace(/{/g, '${');
  const dep = deprecated ? deprecatedJsdoc : '';

  const urlParametersCount = (rawPath.match(/\{\w*\}/g) || []).length;

  if (urlParametersCount !== pathParameters.length) {
    displayWarning(
      `Missing path param(s). Expecting ${urlParametersCount} bug got ${pathParameters.length}`,
      id,
    );
  }

  if (pathParameters.length === 0) {
    const normalPath = `${dep}export const path = \`${parameterizedPath}\`;`;
    if (servers && servers.length > 0) {
      let url = servers[0].url;
      const variables = servers[0].variables || {};
      for (const variable in variables) {
        url = url.replace(
          `{${variable}}`,
          `\${${variable} || '${variables[variable].default}'}`,
        );
      }
      return (
        `${normalPath}` +
        `\n${dep}export const fullPath = \`${url + parameterizedPath}\``
      );
    }
    return normalPath;
  }

  const functionParameters = pathParameters.reduce<Array<string>>(
    (output, { name, required, schema }) => {
      const paramName = `${name}${required ? '' : '?'}`;
      const model = getModel(routeName, name, schema);

      return [...output, `${paramName}: ${model}`];
    },
    [],
  );

  const functionParametersCombined = functionParameters.join(', ');
  const normalParameterizedPath = `${dep}export const getPath = (${functionParametersCombined}): string => \`${parameterizedPath}\`;`;

  if (servers && servers.length > 0) {
    let url = servers[0].url;
    const variables = servers[0].variables || {};
    for (const variable in variables) {
      url = url.replace(
        `{${variable}}`,
        `\${${variable} || '${variables[variable].default}'}`,
      );
    }
    return (
      normalParameterizedPath +
      `\n${dep}export const getFullPath = (${functionParametersCombined}): string => \`${
        url + parameterizedPath
      }\``
    );
  }

  return normalParameterizedPath;
};
