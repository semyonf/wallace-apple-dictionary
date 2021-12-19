import fs from 'fs/promises';

export enum ResourceName {
  RawPage = 'raw-page.html',
  SingleAnnotation = 'parsed-annotation-stub.xml',
}

export function loadResource(resourceName: ResourceName): Promise<string> {
  return fs.readFile(`${__dirname}/resources/${resourceName}`, {
    encoding: 'utf-8',
    flag: 'r',
  });
}
