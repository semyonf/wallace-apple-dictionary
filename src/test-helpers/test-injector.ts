import { createInjector } from 'typed-inject';
import { PageDOMLoader } from '../page-dom-loader';
import { Scraper } from '../scraper/scraper';
import { TaskQueue } from '../task-queue';
import { WallaceWikiParser } from '../wallace-wiki-parser/wallace-wiki-parser';
import { SilentLogger } from './silent-logger';

export const testInjector = createInjector()
  .provideClass('logger', SilentLogger)
  .provideClass('task-queue', TaskQueue)
  .provideClass('wallace-wiki-parser', WallaceWikiParser)
  .provideClass('page-dom-loader', PageDOMLoader)
  .provideClass('scraper', Scraper);
