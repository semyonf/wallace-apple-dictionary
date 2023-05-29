import axios from 'axios';
import { JSDOM } from 'jsdom';
import type { Logger } from './logger';
import { tokens } from './tokens';
import { readFile, writeFile } from 'fs/promises';

export class PageDOMLoader {
  public static inject = [tokens.logger] as const;
  constructor(private readonly logger: Logger) {}

  private readonly baseURL = 'https://infinitejest.wallacewiki.com';
  private readonly wallaceWikiAxios = axios.create({
    baseURL: this.baseURL,
    timeout: 5000,
  });

  async loadPageDOM(path: string): Promise<JSDOM> {
    const pathToCache = this.getPathToCache(path);
    let html = await this.loadCacheIfExists(pathToCache);

    if (!html) {
      html = await this.loadPageHTML(path);

      writeFile(pathToCache, html).then(() => {
        this.logger.info(`- Cached html from ${path}`);
      });
    } else {
      this.logger.info(`- Loaded cached html from ${pathToCache}`);
    }

    return new JSDOM(html, { url: this.baseURL, contentType: 'text/html' });
  }

  private getPathToCache(path: string) {
    return __dirname + `/../vendor/cache/${path.replace(/\//g, '_')}.html`;
  }

  private async loadPageHTML(path: string): Promise<string> {
    const response = await this.wallaceWikiAxios.get(path);
    const { data: html } = response;

    this.logger.info(`- Downloaded html from ${path}`);

    return html;
  }

  private async loadCacheIfExists(path: string): Promise<string | null> {
    return readFile(path, 'utf-8')
      .then((contents) => contents)
      .catch(() => null);
  }
}
