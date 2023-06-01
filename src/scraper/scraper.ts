import type { PageDOMLoader } from '../page-dom-loader';
import type { WallaceWikiParser } from '../wallace-wiki-parser/wallace-wiki-parser';
import stream from 'stream';
import type { TaskQueue } from '../task-queue';
import type { Logger } from '../logger';
import { tokens } from '../tokens';

enum PagePaths {
  Home = '/david-foster-wallace',
}

export class Scraper {
  public static inject = [
    tokens.pageDOMLoader,
    tokens.wallaceWikiParser,
    tokens.taskQueue,
    tokens.logger,
  ] as const;

  constructor(
    private readonly pageLoader: PageDOMLoader,
    private readonly wallaceWikiParser: WallaceWikiParser,
    private readonly taskQueue: TaskQueue,
    private readonly logger: Logger,
  ) {}

  scrapeDictionaryEntries(): stream.Readable {
    const dictionaryEntriesStream = new stream.PassThrough({
      objectMode: true,
    });

    this.scrapeDictionaryEntriesToStream(dictionaryEntriesStream)
      .then(() => dictionaryEntriesStream.end())
      .catch((e: Error) => dictionaryEntriesStream.emit('error', e));

    return dictionaryEntriesStream;
  }

  private async scrapeDictionaryEntriesToStream(
    dictionaryEntriesStream: stream.Readable,
  ): Promise<void> {
    const homePageDOM = await this.pageLoader.loadPageDOM(PagePaths.Home);
    const pathsToPages =
      this.wallaceWikiParser.parseTableOfContents(homePageDOM);

    await this.scrapeDictionaryEntriesFromPages(
      pathsToPages,
      dictionaryEntriesStream,
    );
  }

  private async scrapeDictionaryEntriesFromPages(
    pathsToPages: string[],
    dictionaryEntriesStream: stream.Readable,
  ): Promise<void> {
    await Promise.all(
      pathsToPages.map((path) =>
        this.taskQueue.add(
          this.createScrapingTask(path, dictionaryEntriesStream),
        ),
      ),
    );
  }

  private createScrapingTask(
    path: string,
    dictionaryEntriesStream: stream.Readable,
  ) {
    return async () => {
      const pageDOM = await this.pageLoader.loadPageDOM(path);
      const parsedDictionaryEntries =
        this.wallaceWikiParser.parseDictionaryEntries(pageDOM);

      this.logger.log(`- Parsed dictionary entries from ${path}`);

      parsedDictionaryEntries.forEach((dictionaryEntry) =>
        dictionaryEntriesStream.push(dictionaryEntry),
      );
    };
  }
}
