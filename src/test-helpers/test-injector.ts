import { createInjector } from 'typed-inject';
import { PageDOMLoader } from '../page-dom-loader';
import { Scraper } from '../scraper/scraper';
import { TaskQueue } from '../task-queue';
import { tokens } from '../tokens';
import { WallaceWikiParser } from '../wallace-wiki-parser/wallace-wiki-parser';
import { SilentLogger } from './silent-logger';

export const testInjector = createInjector()
  .provideClass(tokens.logger, SilentLogger)
  .provideClass(tokens.taskQueue, TaskQueue)
  .provideClass(tokens.wallaceWikiParser, WallaceWikiParser)
  .provideClass(tokens.pageDOMLoader, PageDOMLoader)
  .provideClass(tokens.scraper, Scraper);
