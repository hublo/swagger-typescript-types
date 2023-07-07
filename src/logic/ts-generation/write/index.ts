import { writeFile } from 'fs-extra';

export const writeFileToApiTypeFile = async (
  outPath: string,
  data: string,
): Promise<void> => {
  const path = `${outPath}/api-types.ts`;
  return writeFile(path, data);
};

export const writeFileToApiMockFile = async (
  outPath: string,
  data: string,
): Promise<void> => {
  const path = `${outPath}/api-types.mock.ts`;
  return writeFile(path, data);
};

export const writeFileToControllerRoute = async (
  path: string,
  data: string,
): Promise<void> => {
  return writeFile(path, data);
};
