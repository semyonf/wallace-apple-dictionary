import { WallaceWikiParser } from './wallace-wiki-parser';
import { JSDOM } from 'jsdom';
import { loadResource, ResourceName } from '../test-helpers/resource-loader';
import { testInjector } from '../test-helpers/test-injector';
import { tokens } from '../tokens';

const wallaceWikiParser = testInjector.resolve(tokens.wallaceWikiParser);

describe(WallaceWikiParser.name, () => {
  it('should be able to parse dictionary entries from a page', async () => {
    const pageHTML = await loadResource(
      ResourceName.RawPageWithDictionaryEntries,
    );
    const pageDOM = new JSDOM(pageHTML, { url: 'http://localhost' });

    const parsedDictionaryEntries =
      wallaceWikiParser.parseDictionaryEntries(pageDOM);

    expect(parsedDictionaryEntries).toMatchSnapshot();
  });

  it('should be able to parse table of contents', async () => {
    const pageHTML = await loadResource(ResourceName.RawHomePage);
    const pageDOM = new JSDOM(pageHTML, { url: 'http://localhost' });

    const parsedTableOfContents =
      wallaceWikiParser.parseTableOfContents(pageDOM);

    expect(parsedTableOfContents).toMatchSnapshot();
  });
});
