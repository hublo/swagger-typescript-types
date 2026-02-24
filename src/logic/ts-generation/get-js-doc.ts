import { splitOnce } from '../util/split-once';

export const getJsDoc = (
  id: string,
  method: string,
  summary?: string,
  description?: string,
  deprecated?: boolean,
): string => {
  let doc = `/** ${splitOnce(id, '_')[1]}\n * method: ${method}\n`;
  if (summary) {
    doc += ` * summary: ${summary}\n`;
  }
  if (description) {
    doc += ` * description: ${description}\n`;
  }
  if (deprecated) {
    doc += ' * @deprecated\n';
  }

  doc += ' */';

  return doc;
};
