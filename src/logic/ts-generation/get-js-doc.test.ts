import { getJsDoc } from './get-js-doc';

describe('getJsDoc', () => {
  it('should display route name and route method', () => {
    const result = getJsDoc('UserController_getName', 'GET');

    expect(result).toMatch(/^\/\*\* getName\n \* method: GET\n \*\/$/);
  });

  it('should display the route summary', () => {
    const result = getJsDoc(
      'UserController_getName',
      'GET',
      'this is a cool route',
    );

    expect(result).toMatch(/.*\* summary: this is a cool route\n.*/);
  });

  it('should display the route description', () => {
    const result = getJsDoc(
      'UserController_getName',
      'GET',
      'this is a cool route',
      "Heeho let's go",
    );

    expect(result).toMatch(/.*\* description: Heeho let's go\n.*/);
  });

  it('should add @deprecated when deprecated is true', () => {
    const result = getJsDoc(
      'UserController_getName',
      'GET',
      undefined,
      undefined,
      true,
    );

    expect(result).toContain(' * @deprecated\n');
  });

  it('should not add @deprecated when deprecated is false', () => {
    const result = getJsDoc(
      'UserController_getName',
      'GET',
      undefined,
      undefined,
      false,
    );

    expect(result).not.toContain('@deprecated');
  });
});
