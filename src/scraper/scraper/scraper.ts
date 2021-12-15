import { PageDOMLoader } from '../page-dom-loader';
import { WallaceWikiParser } from '../wallace-wiki-parser/wallace-wiki-parser';
import { injectable } from 'tsyringe';
import stream from 'stream';
import { TaskQueue } from '../task-queue';
import { Logger } from '../logger';

enum PagePaths {
  Home = '/david-foster-wallace',
}

@injectable()
export class Scraper {
  constructor(
    private readonly pageLoader: PageDOMLoader,
    private readonly wallaceWikiParser: WallaceWikiParser,
    private readonly taskQueue: TaskQueue,
    private readonly logger: Logger,
  ) {}

  scrapeAnnotations(): stream.Readable {
    const streamOfAnnotations = new stream.PassThrough({ objectMode: true });

    this.scrapeAnnotationsToStream(streamOfAnnotations)
      .then(() => streamOfAnnotations.end())
      .catch((e: Error) => streamOfAnnotations.emit('error', e));

    return streamOfAnnotations;
  }

  private async scrapeAnnotationsToStream(
    annotationsStream: stream.Readable,
  ): Promise<void> {
    const homePageDOM = await this.pageLoader.loadPageDOM(PagePaths.Home);
    const pathsToPages = this.wallaceWikiParser.parseTableOfContents(
      homePageDOM,
    );

    await this.scrapeAnnotationsFromPages(pathsToPages, annotationsStream);
  }

  private async scrapeAnnotationsFromPages(
    pathsToPages: string[],
    annotationsStream: stream.Readable,
  ): Promise<void> {
    await Promise.all(
      pathsToPages.map((path) =>
        this.taskQueue.add(this.createScrapingTask(path, annotationsStream)),
      ),
    );
  }

  private createScrapingTask(path: string, annotationsStream: stream.Readable) {
    return async () => {
      const pageDOM = await this.pageLoader.loadPageDOM(path);
      const parsedAnnotations = this.wallaceWikiParser.parseAnnotations(
        pageDOM,
      );

      this.logger.log(`- Parsed annotations from ${path}`);

      parsedAnnotations.forEach((annotation) =>
        annotationsStream.push(annotation),
      );
    };
  }
}
