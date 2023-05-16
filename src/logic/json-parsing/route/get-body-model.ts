import {
  ApiContent,
  ApiTypeDefinition,
} from '../../../types/swagger-schema.interfaces';
import { displayWarning } from '../../cli/console/console.messages';

import { getSchemaName } from './get-schema-name';

export interface BodyModel {
  model: string;
  underlyingModel?: string;
  isPrimitiveModel: boolean;
}

const getSchema = (requestBody: ApiContent): ApiTypeDefinition | undefined => {
  if ('application/json' in requestBody.content) {
    return requestBody.content['application/json'].schema as ApiTypeDefinition;
  }
  if ('multipart/form-data' in requestBody.content) {
    return requestBody.content['multipart/form-data']
      .schema as ApiTypeDefinition;
  }
  return undefined;
};

export const getBodyModel = (
  operationId: string,
  requestBody?: ApiContent,
): BodyModel | undefined => {
  if (!requestBody) {
    return undefined;
  }

  const schema = getSchema(requestBody);
  if (!schema) {
    return undefined;
  }

  if (schema.$ref) {
    return {
      model: getSchemaName(schema.$ref),
      isPrimitiveModel: false,
    };
  }

  if (schema.type) {
    if (schema.type === 'array' && schema.items) {
      const items = schema.items;
      const ref = (items as ApiTypeDefinition).$ref;
      if (ref) {
        const modelName = getSchemaName(ref);
        return {
          model: `Array<${modelName}>`,
          underlyingModel: modelName,
          isPrimitiveModel: false,
        };
      }

      const type = (items as ApiTypeDefinition).type;
      if (type) {
        return {
          model: `Array<${type}>`,
          isPrimitiveModel: true,
        };
      }

      displayWarning(
        `Unable to extract type for request body; given array without $ref or type`,
        operationId,
      );
      return undefined;
    }

    return {
      model: schema.type,
      isPrimitiveModel: true,
    };
  }
};
