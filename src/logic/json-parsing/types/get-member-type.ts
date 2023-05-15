import { ApiTypeDefinition } from '../../../types/swagger-schema.interfaces';
import { displayWarning } from '../../cli/console/console.messages';
import { getSchemaName } from '../route/get-schema-name';

import { getArrayMemberType } from './get-array-member-type';
import { getInlineTypeDefinition } from './get-inline-type-definition';
import { mapZodTypes } from './utils/map-zod-types';

export const getMemberType = (
  propName: string,
  property: ApiTypeDefinition,
): string | undefined => {
  if (property.$ref) {
    return `${getSchemaName(property.$ref)}`;
  }

  if (property.type) {
    if (
      property.type === 'object' &&
      property.properties &&
      property.required
    ) {
      return getInlineTypeDefinition(property as never);
    }

    if (property.type === 'array' && property.items) {
      return getArrayMemberType(propName, property as never);
    }

    if (property.enum) {
      return property.enum.map((el) => `'${el}'`).join(' | ');
    }

    return mapZodTypes(property.type);
  }

  displayWarning(
    `Unable to extract type from ${propName}; no $ref or type provided`,
  );
  return undefined;
};
