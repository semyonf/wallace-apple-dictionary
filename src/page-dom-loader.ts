import axios from 'axios';
import { JSDOM } from 'jsdom';
import type { Logger } from './logger';

export class PageDOMLoader {
  public static inject = ['logger'] as const;
  constructor(private readonly logger: Logger) {}

  private readonly baseURL = 'https://infinitejest.wallacewiki.com';
  private readonly wallaceWikiAxios = axios.create({
    baseURL: this.baseURL,
    timeout: 5000,
  });

  async loadPageDOM(path: string): Promise<JSDOM> {
    const html = await this.loadPageHTML(path);

    return new JSDOM(html, { url: this.baseURL, contentType: 'text/html' });
  }

  private async loadPageHTML(path: string): Promise<string> {
    const response = await this.wallaceWikiAxios.get(path);
    const { data: html } = response;

    this.logger.info(`- Downloaded html from ${path}`);

    return html;
  }
}
