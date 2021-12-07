import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Logger } from './logger';
import { singleton } from 'tsyringe';

@singleton()
export class PageLoader {
  private readonly baseURL = 'https://infinitejest.wallacewiki.com';
  private readonly wallaceWikiAxios = axios.create({
    baseURL: this.baseURL,
    timeout: 5000,
  });

  constructor(private readonly logger: Logger) {}

  async loadPageDOM(path: string): Promise<JSDOM> {
    const html = await this.loadPageHTML(path);

    return new JSDOM(html, { url: this.baseURL, contentType: 'text/html' });
  }

  private async loadPageHTML(path: string): Promise<string> {
    const response = await this.wallaceWikiAxios.get(path);
    // todo make sure response is ok
    const { data: html } = response;

    this.logger.info(`- Downloaded html from ${path}`);

    return html;
  }
}
