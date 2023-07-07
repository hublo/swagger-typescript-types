import swaggerJsonWithMissingRouteName from '../../tests-related/mock-data/swagger-with-missing-routename.json';
import swaggerWithoutSuccessTypeJson from '../../tests-related/mock-data/swagger-without-success-type.json';
import swaggerWithoutTypesJson from '../../tests-related/mock-data/swagger-without-types.json';
import swaggerJson from '../../tests-related/mock-data/swagger.json';
import { transpileRaw } from '../../tests-related/ts/transpile-raw';
import { ValidatedOpenaApiSchema } from '../../types/swagger-schema.interfaces';

import { generateTypesDefinitions } from './generate-types-definitions';
import {
  writeFileToApiMockFile,
  writeFileToApiTypeFile,
  writeFileToControllerRoute,
} from './write';

jest.mock('fs-extra', () => ({
  writeFile: jest.fn(),
  ensureDir: jest.fn(),
}));

jest.mock('./write', () => ({
  writeFileToApiTypeFile: jest.fn(),
  writeFileToApiMockFile: jest.fn(),
  writeFileToControllerRoute: jest.fn(),
}));

const expectWriteFileToControllerRouteCallToContain = (
  index: number,
  regex: RegExp,
): void => {
  const rawResult = jest.mocked(writeFileToControllerRoute).mock.calls[
    index
  ][1];
  expect(rawResult).toMatch(regex);
};

const expectWriteFileToControllerRouteToContainSuccessAndError = (
  index: number,
  successExport: string,
  errorExport: string,
): void => {
  const rawResult = jest.mocked(writeFileToControllerRoute).mock.calls[
    index
  ][1];
  expect(rawResult).toContain(successExport);
  expect(rawResult).toContain(errorExport);
};

describe('generateTypesDefinitions function', () => {
  global.console = { error: jest.fn() } as unknown as Console;
  const json = swaggerJson as unknown as ValidatedOpenaApiSchema;
  const outPath = './src/api';

  beforeEach(() => jest.clearAllMocks());

  it('should generate all the types', async () => {
    const result = await generateTypesDefinitions(outPath, json, false);

    expect(result).toStrictEqual({
      typesGenerated: true,
      endpointsCount: 5,
    });

    expect(writeFileToApiTypeFile).toHaveBeenCalledTimes(1);
    const rawResultApiType = jest.mocked(writeFileToApiTypeFile).mock
      .calls[0][1] as string;

    expect(
      rawResultApiType.startsWith(
        '/* eslint-disable */\n/* tslint:disable */\n',
      ),
    ).toBeTruthy();

    const exports = rawResultApiType
      .split('/* eslint-disable */\n/* tslint:disable */\n\n')[1]
      .split('export ')
      .filter((el) => el !== '');

    expect(exports[0]).toBe('interface LoginBodyDto {\n  token: string;\n}\n');
    expect(exports[1]).toBe(
      'interface LoginResultDataDto {\n  token: string;\n}\n',
    );
    expect(exports[2]).toBe(
      'interface LoginResultDto {\n  data: LoginResultDataDto;\n}\n',
    );
    expect(exports[3]).toBe(
      'interface ApiResponseDto {\n  statusCode: number;\n  message: string;\n}\n',
    );
    expect(exports[4]).toBe(
      'interface ChapterMemberDto {\n' +
        '  idUser: number;\n' +
        '  userFullName: string;\n' +
        '  userEmail: string;\n' +
        '  userPictureUrl: string;\n' +
        '  role?: string;\n' +
        '}\n',
    );
    expect(exports[5]).toBe(
      'interface ChapterWithMembersDto {\n' +
        '  id: number;\n' +
        '  name: string;\n' +
        '  members: Array<ChapterMemberDto>;\n' +
        '}\n',
    );
    expect(exports[6]).toBe(
      'interface ChaptersWithMembersResultDto {\n' +
        '  data: Array<ChapterWithMembersDto>;\n' +
        '}\n',
    );
    expect(exports[7]).toBe(
      'interface DiscussionDto {\n' +
        '  id: number;\n' +
        '  idUser: number;\n' +
        '  userFullName: string;\n' +
        '  userEmail: string;\n' +
        '  comment: string;\n' +
        '  link: string;\n' +
        '  createdAt: string;\n' +
        '}\n',
    );
    expect(exports[8]).toBe(
      'interface SubjectWithDiscussionsDto {\n' +
        '  id: number;\n' +
        '  title: string;\n' +
        '  details: string;\n' +
        '  link: string;\n' +
        '  createdAt: string;\n' +
        '  closedAt: string;\n' +
        '  answer: string;\n' +
        '  chapterId: number;\n' +
        '  chapterName: string;\n' +
        '  discussion: Array<DiscussionDto>;\n' +
        '}\n',
    );
    expect(exports[9]).toBe(
      'interface SubjectsResultDto {\n  data: Array<SubjectWithDiscussionsDto>;\n}\n',
    );
    expect(exports[10]).toBe(
      'interface NewSubjectDto {\n' +
        '  idChapter: number;\n' +
        '  title: string;\n' +
        '  details: string;\n' +
        '  link: string;\n' +
        '}\n',
    );
    expect(exports[11]).toBe(
      'interface SubjectDto {\n' +
        '  id: number;\n' +
        '  title: string;\n' +
        '  details: string;\n' +
        '  link: string;\n' +
        '  createdAt: string;\n' +
        '  closedAt: string;\n' +
        '  answer: string;\n' +
        '  chapterId: number;\n' +
        '  chapterName: string;\n' +
        '}\n',
    );
    expect(exports[12]).toBe(
      'interface CreateSubjectResultDto {\n  data: SubjectDto;\n}\n',
    );

    expect(writeFileToApiMockFile).toHaveBeenCalledTimes(1);
    const rawResultMock = jest.mocked(writeFileToApiMockFile).mock
      .calls[0][1] as string;
    expect(
      rawResultMock.startsWith(
        '/* eslint-disable */\n/* tslint:disable */\n// @ts-nocheck\n\n',
      ),
    ).toBeTruthy();

    const mocks = rawResultMock
      .split(
        '/* eslint-disable */\n/* tslint:disable */\n// @ts-nocheck\n\n',
      )[1]
      .split('import ')
      .filter((el) => el !== '');

    expect(mocks[0]).toBe(
      `type { LoginBodyDto } from './api-types'\n` +
        'export const mockLoginBodyDto: LoginBodyDto = {\n' +
        `  token: 'token',\n` +
        '}\n',
    );

    expect(mocks[1]).toBe(
      `type { LoginResultDataDto } from './api-types'\n` +
        'export const mockLoginResultDataDto: LoginResultDataDto = {\n' +
        `  token: 'token',\n` +
        '}\n',
    );

    expect(mocks[2]).toBe(
      `type { LoginResultDto } from './api-types'\n` +
        'export const mockLoginResultDto: LoginResultDto = {\n' +
        `  data: mockLoginResultDataDto,\n` +
        '}\n',
    );

    expect(mocks[3]).toBe(
      `type { ApiResponseDto } from './api-types'\n` +
        'export const mockApiResponseDto: ApiResponseDto = {\n' +
        `  statusCode: 400,\n` +
        `  message: 'message',\n` +
        '}\n',
    );

    expect(mocks[4]).toBe(
      `type { ChapterMemberDto } from './api-types'\n` +
        'export const mockChapterMemberDto: ChapterMemberDto = {\n' +
        `  idUser: 123,\n` +
        `  userFullName: 'userFullName',\n` +
        `  userEmail: 'userEmail',\n` +
        `  userPictureUrl: 'userPictureUrl',\n` +
        `  role: 'role',\n` +
        '}\n',
    );

    expect(mocks[5]).toBe(
      `type { ChapterWithMembersDto } from './api-types'\n` +
        'export const mockChapterWithMembersDto: ChapterWithMembersDto = {\n' +
        `  id: 12345,\n` +
        `  name: 'name',\n` +
        `  members: [mockChapterMemberDto],\n` +
        '}\n',
    );

    expect(mocks[6]).toBe(
      `type { ChaptersWithMembersResultDto } from './api-types'\n` +
        'export const mockChaptersWithMembersResultDto: ChaptersWithMembersResultDto = {\n' +
        `  data: [mockChapterWithMembersDto],\n` +
        '}\n',
    );

    expect(mocks[7]).toBe(
      `type { DiscussionDto } from './api-types'\n` +
        'export const mockDiscussionDto: DiscussionDto = {\n' +
        `  id: 12345,\n` +
        `  idUser: 123,\n` +
        `  userFullName: 'userFullName',\n` +
        `  userEmail: 'userEmail',\n` +
        `  comment: 'comment',\n` +
        `  link: 'link',\n` +
        `  createdAt: '2021-12-31T23:59:59.999Z',\n` +
        '}\n',
    );

    expect(mocks[8]).toBe(
      `type { SubjectWithDiscussionsDto } from './api-types'\n` +
        'export const mockSubjectWithDiscussionsDto: SubjectWithDiscussionsDto = {\n' +
        `  id: 12345,\n` +
        `  title: 'title',\n` +
        `  details: 'details',\n` +
        `  link: 'link',\n` +
        `  createdAt: '2021-12-31T23:59:59.999Z',\n` +
        `  closedAt: '2021-12-31T23:59:59.999Z',\n` +
        `  answer: 'answer',\n` +
        `  chapterId: 123,\n` +
        `  chapterName: 'chapterName',\n` +
        `  discussion: [mockDiscussionDto],\n` +
        '}\n',
    );

    expect(mocks[9]).toBe(
      `type { SubjectsResultDto } from './api-types'\n` +
        'export const mockSubjectsResultDto: SubjectsResultDto = {\n' +
        `  data: [mockSubjectWithDiscussionsDto],\n` +
        '}\n',
    );

    expect(mocks[10]).toBe(
      `type { NewSubjectDto } from './api-types'\n` +
        'export const mockNewSubjectDto: NewSubjectDto = {\n' +
        `  idChapter: 123,\n` +
        `  title: 'title',\n` +
        `  details: 'details',\n` +
        `  link: 'link',\n` +
        '}\n',
    );
    expect(mocks[11]).toBe(
      `type { SubjectDto } from './api-types'\n` +
        'export const mockSubjectDto: SubjectDto = {\n' +
        `  id: 12345,\n` +
        `  title: 'title',\n` +
        `  details: 'details',\n` +
        `  link: 'link',\n` +
        `  createdAt: '2021-12-31T23:59:59.999Z',\n` +
        `  closedAt: '2021-12-31T23:59:59.999Z',\n` +
        `  answer: 'answer',\n` +
        `  chapterId: 123,\n` +
        `  chapterName: 'chapterName',\n` +
        '}\n',
    );
  });

  it('should export one path variable by exposed endpoint', async () => {
    await generateTypesDefinitions(outPath, json, false);

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(5);

    const pathExportRegex =
      /(export const path = `.*`;)|(export const getPath = (.*) => `.*`;)/;
    expectWriteFileToControllerRouteCallToContain(0, pathExportRegex);
    expectWriteFileToControllerRouteCallToContain(1, pathExportRegex);
    expectWriteFileToControllerRouteCallToContain(2, pathExportRegex);
    expectWriteFileToControllerRouteCallToContain(3, pathExportRegex);
    expectWriteFileToControllerRouteCallToContain(4, pathExportRegex);
  });

  it('should import related types for each exposed endpoint', async () => {
    await generateTypesDefinitions(outPath, json, false);

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(5);

    const reExportingRegex = /import { .* } from '.\/..\/api-types';\n\n/;
    expectWriteFileToControllerRouteCallToContain(0, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(1, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(2, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(3, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(4, reExportingRegex);
  });

  it('should use the import type syntax for imports', async () => {
    await generateTypesDefinitions(outPath, json, true);

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(5);

    const reExportingRegex = /import type { .* } from '.\/..\/api-types';\n\n/;
    expectWriteFileToControllerRouteCallToContain(0, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(1, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(2, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(3, reExportingRegex);
    expectWriteFileToControllerRouteCallToContain(4, reExportingRegex);
  });

  it('should not include the api-types import', async () => {
    await generateTypesDefinitions(
      outPath,
      swaggerWithoutTypesJson as unknown as ValidatedOpenaApiSchema,
      false,
    );

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(1);
    expect(
      jest.mocked(writeFileToControllerRoute).mock.calls.join(''),
    ).not.toContain(`from './../api-types';`);
  });

  it('should set success and error types as never', async () => {
    await generateTypesDefinitions(
      outPath,
      swaggerWithoutSuccessTypeJson as unknown as ValidatedOpenaApiSchema,
      false,
    );

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(1);

    const output = jest.mocked(writeFileToControllerRoute).mock.calls.join('');

    expect(output).toContain('export type LoginSuccess = never;');
    expect(output).toContain('export type LoginError = never;');
  });

  it('should generate jsdoc for each endpoint', async () => {
    await generateTypesDefinitions(outPath, json, false);

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(5);

    const jsDocRegex =
      /\/\*\* .*\n.*\* method: .*\n.*\* summary: .*\n.*\* description: .*\n.*\n\n/;
    expectWriteFileToControllerRouteCallToContain(0, jsDocRegex);
    expectWriteFileToControllerRouteCallToContain(1, jsDocRegex);
    expectWriteFileToControllerRouteCallToContain(2, jsDocRegex);
    expectWriteFileToControllerRouteCallToContain(3, jsDocRegex);
    expectWriteFileToControllerRouteCallToContain(4, jsDocRegex);
  });

  it('should export one type by response', async () => {
    await generateTypesDefinitions(outPath, json, false);

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(5);

    expectWriteFileToControllerRouteToContainSuccessAndError(
      0,
      'export type LoginSuccess = LoginResultDto;',
      'export type LoginError = ApiResponseDto;',
    );
    expectWriteFileToControllerRouteToContainSuccessAndError(
      1,
      'export type GetChaptersWithMembersSuccess = ChaptersWithMembersResultDto;',
      'export type GetChaptersWithMembersError = ApiResponseDto;',
    );
    expectWriteFileToControllerRouteToContainSuccessAndError(
      2,
      'export type GetSubjectsSuccess = SubjectsResultDto;',
      'export type GetSubjectsError = ApiResponseDto;',
    );
    expectWriteFileToControllerRouteToContainSuccessAndError(
      3,
      'export type GetChaptersSubjectsSuccess = SubjectsResultDto;',
      'export type GetChaptersSubjectsError = ApiResponseDto;',
    );
    expectWriteFileToControllerRouteToContainSuccessAndError(
      4,
      'export type CreateSubjectSuccess = CreateSubjectResultDto;',
      'export type CreateSubjectError = ApiResponseDto;',
    );
  });

  it('should export the request body type if any', async () => {
    await generateTypesDefinitions(outPath, json, false);

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(5);

    const requestBodyExportsRegex = /export type RequestBody = .*\n/;
    expectWriteFileToControllerRouteCallToContain(0, requestBodyExportsRegex);
  });

  it('should generate valid typescript for types', async () => {
    await generateTypesDefinitions(outPath, json, false);

    expect(writeFileToApiTypeFile).toHaveBeenCalledTimes(1);
    const rawResult = jest.mocked(writeFileToApiTypeFile).mock.calls[0][1];
    const transpilationResult = await transpileRaw(rawResult);
    expect(transpilationResult).toHaveLength(0);
  });

  it('should display a warning if route has no name', async () => {
    await generateTypesDefinitions(
      outPath,
      swaggerJsonWithMissingRouteName as unknown as ValidatedOpenaApiSchema,
      false,
    );

    expect(console.error).toHaveBeenCalledTimes(1);
    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(0);
  });

  it('should not write anything', async () => {
    const result = await generateTypesDefinitions(
      outPath,
      {
        components: { schemas: {} },
        paths: [],
      },
      false,
    );

    expect(result).toStrictEqual({
      typesGenerated: false,
      endpointsCount: 0,
    });

    expect(writeFileToControllerRoute).toHaveBeenCalledTimes(0);
  });
});
