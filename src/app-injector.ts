import { createInjector } from 'typed-inject';
import { Logger } from './logger';
import { PageDOMLoader } from './page-dom-loader';
import { Scraper } from './scraper/scraper';
import { TaskQueue } from './task-queue';
import { tokens } from './tokens';
import { WallaceWikiParser } from './wallace-wiki-parser/wallace-wiki-parser';

export const appInjector = createInjector()
  .provideClass(tokens.logger, Logger)
  .provideClass(tokens.taskQueue, TaskQueue)
  .provideClass(tokens.wallaceWikiParser, WallaceWikiParser)
  .provideClass(tokens.pageDOMLoader, PageDOMLoader)
  .provideClass(tokens.scraper, Scraper);
