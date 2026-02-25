import {
  ValidatedOpenApiSchema,
  ApiRouteParameter,
  Server,
} from '../../types/swagger-schema.interfaces';

import { BodyModel, getBodyModel } from './get-body-model';
import { getRouteResponses, RouteResponse } from './get-route-responses';

const HTTP_METHODS = new Set([
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'options',
  'head',
]);

export interface Route {
  id: string;
  summary?: string;
  servers?: Array<Server>;
  description?: string;
  deprecated?: boolean;
  path: string;
  method: string;
  parameters: Array<ApiRouteParameter>;
  bodyModel?: BodyModel;
  responses: Array<RouteResponse>;
}

export const getExposedEndpoints = (
  json: ValidatedOpenApiSchema,
): Array<Route> => {
  const routes: Array<Route> = [];

  for (const [path, pathItem] of Object.entries(json.paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!HTTP_METHODS.has(method)) {
        continue;
      }
      const {
        operationId,
        responses,
        summary,
        description,
        deprecated,
        requestBody,
        parameters,
        servers,
      } = operation;
      const bodyModel = getBodyModel(operationId, requestBody);
      const routeResponses = getRouteResponses(operationId, responses);

      routes.push({
        id: operationId,
        servers: servers ?? json.servers,
        summary,
        description,
        deprecated,
        path,
        method,
        parameters,
        bodyModel,
        responses: routeResponses,
      });
    }
  }

  return routes;
};
