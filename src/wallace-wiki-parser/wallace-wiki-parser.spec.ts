import { WallaceWikiParser } from './wallace-wiki-parser';
import { JSDOM } from 'jsdom';
import { loadResource, ResourceName } from '../test-helpers/resource-loader';
import { testInjector } from '../test-helpers/test-injector';

const wallaceWikiParser = testInjector.resolve('wallace-wiki-parser');

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
