import 'reflect-metadata';
import { WallaceWikiParser } from './wallace-wiki-parser';
import { container } from 'tsyringe';
import { JSDOM } from 'jsdom';
import { useDummyLogger } from '../test-helpers/use-dummy-logger';
import { loadResource, ResourceName } from '../test-helpers/resource-loader';

useDummyLogger();

const wallaceWikiParser = container.resolve(WallaceWikiParser);

describe(WallaceWikiParser.name, () => {
  it('should be able to parse annotations from a page', async () => {
    const pageHTML = await loadResource(ResourceName.RawPageWithDefinitions);
    const pageDOM = new JSDOM(pageHTML, { url: 'http://localhost' });

    const parsedAnnotations = wallaceWikiParser.parseAnnotations(pageDOM);

    expect(parsedAnnotations).toMatchSnapshot();
  });

  it('should be able to parse table of contents', async () => {
    const pageHTML = await loadResource(ResourceName.RawHomePage);
    const pageDOM = new JSDOM(pageHTML, { url: 'http://localhost' });

    const parsedTOC = wallaceWikiParser.parseTableOfContents(pageDOM);

    expect(parsedTOC).toMatchSnapshot();
  });
});
