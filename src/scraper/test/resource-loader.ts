import fs from 'fs';
import assert from 'assert';

const resourceRoot = `${__dirname}/resources/`;

export enum ResourceName {
  RawPage = 'raw-page.html',
  SingleAnnotation = 'parsed-annotation-stub.xml',
}

assertResourcesArePresentSync();

export async function loadResource(
  resourceName: ResourceName,
): Promise<string> {
  return fs.promises.readFile(`${resourceRoot}${resourceName}`, {
    encoding: 'utf-8',
    flag: 'r',
  });
}

function assertResourcesArePresentSync() {
  const files = fs.readdirSync(resourceRoot);

  Object.values(ResourceName).forEach((resource) =>
    assert(files.includes(resource)),
  );
}
