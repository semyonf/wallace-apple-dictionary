import { JSDOM } from 'jsdom';
import { Scraper } from './scraper';
import stream from 'stream';
import { testInjector } from '../test-helpers/test-injector';
import { tokens } from '../tokens';

beforeEach(() => jest.clearAllMocks());

const scraper = testInjector.resolve(tokens.scraper);
const taskQueue = testInjector.resolve(tokens.taskQueue);
const pageLoader = testInjector.resolve(tokens.pageDOMLoader);
const parser = testInjector.resolve(tokens.wallaceWikiParser);

describe(Scraper.prototype.scrapeAnnotations.name, () => {
  const loadPageDOMSpy = jest.spyOn(pageLoader, 'loadPageDOM');
  const queueAddSpy = jest.spyOn(taskQueue, 'add');
  const parseTableOfContentsSpy = jest.spyOn(parser, 'parseTableOfContents');

  it('should queue tasks', (done) => {
    const urls = ['url1', 'url2'];

    parseTableOfContentsSpy.mockReturnValueOnce(urls);
    loadPageDOMSpy.mockReturnValue(Promise.resolve(new JSDOM()));

    const annotations = scraper.scrapeAnnotations();

    // 'end' event will not fire unless the data is completely consumed
    annotations.pipe(new stream.PassThrough());

    annotations.on('end', () => {
      expect(queueAddSpy).toHaveBeenCalledTimes(urls.length);
      expect(loadPageDOMSpy).toHaveBeenCalledTimes(urls.length + 1);
      done();
    });
  });
});
