import { createInjector } from 'typed-inject';
import { Logger } from './logger';
import { PageDOMLoader } from './page-dom-loader';
import { Scraper } from './scraper/scraper';
import { TaskQueue } from './task-queue';
import { WallaceWikiParser } from './wallace-wiki-parser/wallace-wiki-parser';

export const appInjector = createInjector()
  .provideClass('logger', Logger)
  .provideClass('task-queue', TaskQueue)
  .provideClass('wallace-wiki-parser', WallaceWikiParser)
  .provideClass('page-dom-loader', PageDOMLoader)
  .provideClass('scraper', Scraper);
