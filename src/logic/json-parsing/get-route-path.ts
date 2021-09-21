import {
  ApiRouteParameter,
  ApiTypeDefinition,
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
      return 'undefined';
    }

    return schema.type;
  }

  displayWarning(
    `Unable to extract type from ${name}; no $ref or type provided`,
    operationId,
  );
  return 'undefined';
};

export const getRoutePath = (
  routeName: string,
  envVarName: string,
  rawPath: string,
  parameters: Array<ApiRouteParameter>,
): string => {
  const root = '${process.env.' + envVarName + '}';
  const pathParameters = parameters.filter((el) => el.in === 'path');
  const path = rawPath.replace(/{/g, '${');

  if (pathParameters.length === 0) {
    return `export const path = \`${root}${path}\`;`;
  }

  const functionParameters = pathParameters.reduce<Array<string>>(
    (output, { name, required, schema }) => {
      const paramName = `${name}${required ? '' : '?'}`;
      const model = getModel(routeName, name, schema);

      return [...output, `${paramName}: ${model}`];
    },
    [],
  );

  return `export const getPath = (${functionParameters.join(
    ', ',
  )}): string => \`${root}${path}\`;`;
};