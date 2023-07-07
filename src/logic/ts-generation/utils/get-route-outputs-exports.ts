import { RouteResponse } from '../../json-parsing/route/get-route-responses';
import { capitalize } from '../../util/capitalize';

const generateConsolidatedExports = (
  array: Array<RouteResponse>,
  route: string,
  outcome: 'Success' | 'Error',
): string => {
  const condition = (el: RouteResponse): boolean =>
    el.statusCode.startsWith('2') === (outcome === 'Success');
  const arr = array.filter(condition).map((el) => el.model);

  if (arr.length === 0) {
    arr.push('never');
  }

  return `export type ${generateOutcomeType(route, outcome)} = ${Array.from(
    new Set(arr),
  ).join(' | ')};`;
};

export const generateOutcomeType = (
  route: string,
  outcome: 'Success' | 'Error',
): string => `${route}${outcome}`;

export const getRouteOutputsExports = (
  routeName: string,
  responses: Array<RouteResponse>,
): string => {
  const route = capitalize(routeName);

  const success = generateConsolidatedExports(responses, route, 'Success');
  const error = generateConsolidatedExports(responses, route, 'Error');

  return [success, error].join('\n');
};
