import 'reflect-metadata';
import { container } from 'tsyringe';
import { TaskQueue } from '../task-queue';
import { PageDOMLoader } from '../page-dom-loader';
import { JSDOM } from 'jsdom';
import { Scraper } from './scraper';
import { WallaceWikiParser } from '../wallace-wiki-parser/wallace-wiki-parser';
import { useDummyLogger } from '../test-helpers/use-dummy-logger';
import stream from 'stream';

useDummyLogger();

beforeEach(() => jest.clearAllMocks());

const scraper = container.resolve(Scraper);
const taskQueue = container.resolve(TaskQueue);
const pageLoader = container.resolve(PageDOMLoader);
const parser = container.resolve(WallaceWikiParser);

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
