import { ApiTypeDefinition } from '../../../types/swagger-schema.interfaces';
import { WithRequiredProperty } from '../../../types/with-required-property.type';
import { displayWarning } from '../../cli/console/console.messages';

import { getExampleFromType } from './get-example-from-type';
import { getInlineTypeMock } from './get-inline-type-mock';
import { getMockObjectNameFromPath } from './get-mock-object-name';

export const getArrayMemberMock = (
  propName: string,
  property: WithRequiredProperty<ApiTypeDefinition, 'items'>,
): string | undefined => {
  if (property.items) {
    const items = property.items;
    const ref = (items as ApiTypeDefinition).$ref;
    if (ref !== undefined) {
      return `[${getMockObjectNameFromPath(ref)}]`;
    }

    const example = (items as ApiTypeDefinition).example;
    if (example) {
      try {
        return `${JSON.stringify(property.example)}`;
      } catch (_) {
        displayWarning(
          `Unable to stringify the example provided for ${propName}`,
        );
      }
    }

    const type = (items as ApiTypeDefinition).type;
    const properties = (items as ApiTypeDefinition).properties;
    const required = (items as ApiTypeDefinition).required;
    if (type === 'object' && properties && required) {
      return `[${getInlineTypeMock(items as never)}]`;
    }

    if (type !== undefined) {
      return `[${getExampleFromType(propName, type)}]`;
    }

    if ((items as { oneOf: Array<ApiTypeDefinition> }).oneOf) {
      const oneOf = (items as { oneOf: Array<ApiTypeDefinition> }).oneOf;

      const refs = oneOf.map((el) => el.$ref).filter((el) => el !== undefined);
      if (refs.length > 0) {
        return `[${getMockObjectNameFromPath(refs[0] as string)}]`;
      }
    }
  }

  displayWarning(
    `Unable to extract type from ${propName}; given array without $ref or type`,
  );

  return undefined;
};
