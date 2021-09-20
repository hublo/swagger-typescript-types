# swagger-typescript-types

[![Open in Visual Studio Code](https://open.vscode.dev/badges/open-in-vscode.svg)](https://open.vscode.dev/jpb06/swagger-typescript-types)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_swagger-typescript-types&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=jpb06_swagger-typescript-types)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_swagger-typescript-types&metric=security_rating)](https://sonarcloud.io/dashboard?id=jpb06_swagger-typescript-types)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=jpb06_swagger-typescript-types&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=jpb06_swagger-typescript-types)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=jpb06_swagger-typescript-types&metric=code_smells)](https://sonarcloud.io/dashboard?id=jpb06_swagger-typescript-types)
[![Duplicated Lines (%)](https://sonarcloud.io/api/project_badges/measure?project=jpb06_swagger-typescript-types&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=jpb06_swagger-typescript-types)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=jpb06_swagger-typescript-types&metric=coverage)](https://sonarcloud.io/dashboard?id=jpb06_swagger-typescript-types)
![Coverage](./badges/coverage-global%20coverage.svg)
![Github workflow](https://img.shields.io/github/workflow/status/jpb06/swagger-typescript-types/Main%20workflow?label=last%20workflow&logo=github-actions)
![Last commit](https://img.shields.io/github/last-commit/jpb06/swagger-typescript-types?logo=git)

## :zap: Purpose

Here is a little utility to generate typescript artifacts from swagger. This can be useful when you want to sync types between your backend and your frontend.

For example, we have [this backend](https://workshop-react-back.herokuapp.com/) exposing a swagger. The `/devs/by-squads` route returns an array of `DevDto` which is a model described in swagger.

Now, I could just write the interface for it myself in the frontend codebase 🤔, right? This is simple enough in our example:

```typescript
export interface DevDto {
  id: number;
  firstName: string;
  squad: number;
}
```

But what if we could just extract these models and generate types instead? Oh...! 😏

### 🔶 Disclaimer

⚠️🚨 I wrote this for a stack based on [nestjs](https://nestjs.com/) for the backend and [react-query](https://react-query.tanstack.com/) for the frontend, so this tool may or may not suit your needs. If you think I can help, do not hesitate to drop an issue 🙃.

## :zap: Installation

To install, use either yarn or npm:

```bash
yarn add -D swagger-typescript-types
```

```bash
npm i -D swagger-typescript-types
```

## :zap: Typical use : cli

Let's say we have a backend exposing endpoints on this url: <https://workshop-react-back.herokuapp.com>.
Now, swagger exposes a json file on the [/-json](https://workshop-react-back.herokuapp.com/-json) path in this example.

Knowing this, we can add a script to our package.json:

```json
{
  "scripts": {
    "api:sync": "generateTypesFromUrl API_URL -json ./src/types/api.types.ts"
  }
}
```

The `generateTypesFromUrl` task takes tree arguments:

| #   | description                                                            | Example                  |
| --- | ---------------------------------------------------------------------- | ------------------------ |
| 1️⃣  | The name of an environment variable containing the path to our backend | API_URL                  |
| 2️⃣  | The path to the json exposed by swagger on our backend                 | -json                    |
| 3️⃣  | Where to write our extracted types                                     | ./src/types/api.types.ts |

Our task will do a few things using these arguments when called:

```misc
✔️ Fetch the json exposed by our swagger (exposed in our example at the `-json` path).
✔️ Validate the json retrieved against [openapiv3 schema](https://github.com/APIDevTools/openapi-schemas).
✔️ Extract models and generate typings from them.
✔️ Write them on the path defined as second argument (./api-types.ts).
✔️ For each route, create a file containing the endpoint path and re-exporting parameters / request body / responses types.
```

## :zap: Generated files

Taking our example backend, let's check the files generated:

> ./api-types.ts

```Typescript
export interface SquadDto {
  id: number;
  squad: number;
}
export interface ApiResponseDto {
  statusCode: number;
  message: string;
}
export interface DevDto {
  id: number;
  firstName: string;
  squad: number;
}
export interface BadRequestDto {
  statusCode: number;
  message: string | Array<string>;
  error: string;
}
export interface ChangeSquadDto {
  idDev: number;
  idSquad: number;
}
export interface GetDevelopersBySquadsDto {
  idSquads: Array<number>;
}
```

Now let's check an [endpoint](http://localhost:3001/#/squads/SquadsController_getSquadsDevelopers):

> ./SquadsController/getSquadsDevelopers.ts

```Typescript
/** getSquadsDevelopers
 * verb: get
 * summary: Get the developers belonging to a squad
 * description: Retrieves the squad developers
 */

import { DevDto, BadRequestDto, ApiResponseDto } from './../api-types';

export const getPath = (id: number): string =>
  `${process.env.API_URL}/squads/${id}/devs`;

export type GetSquadsDevelopersSuccess = Array<DevDto>;
export type GetSquadsDevelopersError = BadRequestDto | ApiResponseDto;
```

## :zap: Api

On top of the cli, this package exposes the following functions:

### 🔶 Functions

#### 🌀 fetchSwaggerJson

This function fetches the swagger json using axios. Typical use:

```typescript
const json: InputSwaggerJson = await fetchSwaggerJson(
  'https://workshop-react-back.herokuapp.com/-json',
);
```

#### 🌀 validateSchema

This function validates some arbitrary json against the [openapiv3 schema](https://github.com/APIDevTools/openapi-schemas). Typically use:

```typescript
const json: InputSwaggerJson = { ... };

const schema: ValidatedOpenaApiSchema = await validateSchema(data);
```

#### 🌀 generateTypesDefinitions

This function extracts models from the swagger json and generates typings from them. Typical use:

```typescript
const enVarName = 'API_URL';
const outPath = './src/api.types.ts';
const schema: ValidatedOpenaApiSchema = { ... };

await generateTypesDefinitions(envVarName, outPath, schema);
```
