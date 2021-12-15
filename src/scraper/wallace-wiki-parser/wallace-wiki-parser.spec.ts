import 'reflect-metadata';
import { WallaceWikiParser } from './wallace-wiki-parser';
import { container } from 'tsyringe';
import { JSDOM } from 'jsdom';
import { annotationsFromPages3To27 } from '../test/resources/annotations-from-pages-3-to-27';
import { mockLogger } from '../test/mock-logger';
import { loadResource, ResourceName } from '../test/resource-loader';

mockLogger();

const wallaceWikiParser = container.resolve(WallaceWikiParser);

describe(WallaceWikiParser.name, () => {
  it('should be able to parse annotations from a page', async () => {
    const pageHTML = await loadResource(ResourceName.RawPage);
    const pageDOM = new JSDOM(pageHTML, { url: 'http://localhost' });

    const parsedAnnotations = wallaceWikiParser.parseAnnotations(pageDOM);

    expect(parsedAnnotations).toStrictEqual(annotationsFromPages3To27);
  });
});
