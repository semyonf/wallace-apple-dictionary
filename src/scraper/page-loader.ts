import axios from 'axios';
import { JSDOM } from 'jsdom';

export class PageLoader {
  constructor(
    private readonly baseURL = 'https://infinitejest.wallacewiki.com',
    private readonly wallaceWikiAxios = axios.create({
      baseURL,
      timeout: 5000,
    }),
  ) {}

  async loadPageDOM(path: string): Promise<JSDOM> {
    const html = await this.loadPageHTML(path);

    return new JSDOM(html, { url: this.baseURL, contentType: 'text/html' });
  }

  private async loadPageHTML(path: string): Promise<string> {
    const response = await this.wallaceWikiAxios.get(path);
    // todo make sure response is ok
    const { data: html } = response;

    console.log(`- Downloaded html from ${path}`);

    return html;
  }
}
