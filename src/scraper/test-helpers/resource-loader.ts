import fs from 'fs';
import assert from 'assert';

const resourceRoot = `${__dirname}/resources/`;
const resourceCache = new Map<string, string>();

export enum ResourceName {
  RawPage = 'raw-page.html',
  SingleAnnotation = 'parsed-annotation-stub.xml',
}

assertResourcesArePresentSync();

export async function loadResource(
  resourceName: ResourceName,
): Promise<string> {
  const cachedResource = resourceCache.get(resourceName);

  if (cachedResource) {
    return cachedResource;
  }

  const fileContents = await fs.promises.readFile(
    `${resourceRoot}${resourceName}`,
    {
      encoding: 'utf-8',
      flag: 'r',
    },
  );

  resourceCache.set(resourceName, fileContents);

  return fileContents;
}

function assertResourcesArePresentSync() {
  const files = fs.readdirSync(resourceRoot);
  Object.values(ResourceName).forEach((resource) =>
    assert(files.includes(resource)),
  );
}
