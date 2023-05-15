import { ApiTypeDefinition } from '../../../types/swagger-schema.interfaces';
import { WithRequiredProperty } from '../../../types/with-required-property.type';
import { displayWarning } from '../../cli/console/console.messages';
import { getSchemaName } from '../route/get-schema-name';

import { getInlineTypeDefinition } from './get-inline-type-definition';

export const getArrayMemberType = (
  propName: string,
  property: WithRequiredProperty<ApiTypeDefinition, 'items'>,
): string | undefined => {
  if (property.items) {
    const items = property.items;
    const ref = (items as ApiTypeDefinition).$ref;
    if (ref !== undefined) {
      return `Array<${getSchemaName(ref)}>`;
    }

    const type = (items as ApiTypeDefinition).type;
    const properties = (items as ApiTypeDefinition).properties;
    const required = (items as ApiTypeDefinition).required;
    if (type === 'object' && properties && required) {
      return `Array<${getInlineTypeDefinition(items as never)}>`;
    }

    if (type !== undefined) {
      return `Array<${type}>`;
    }

    if ((items as { oneOf: Array<ApiTypeDefinition> }).oneOf) {
      const oneOf = (items as { oneOf: Array<ApiTypeDefinition> }).oneOf;

      const refs = oneOf.map((el) => el.$ref).filter((el) => el !== undefined);
      if (refs.length > 0) {
        return `Array<${(refs as string[])
          .map((el) => getSchemaName(el))
          .join(' | ')}>`;
      }
    }
  }

  displayWarning(
    `Unable to extract type from ${propName}; given array without $ref or type`,
  );

  return undefined;
};
