import type {Annotation} from '../annotation';
import type {JSDOM} from 'jsdom';
import {singleton} from 'tsyringe';
import {Logger} from '../logger';

@singleton()
export class WallaceWikiParser {
  constructor(private readonly logger: Logger) {}

  parseTableOfContents(dom: JSDOM): string[] {
    const elements = this.parseDOMIntoElements(
      dom,
      '//*[@id="ij-pbp"]/a/@href',
    );
    const pathsToPagesWithAnnotations: string[] = [];

    for (const element of elements) {
      const relativeUrl = element.nodeValue;

      if (relativeUrl) {
        pathsToPagesWithAnnotations.push(relativeUrl);
      } else {
        this.logger.warn('Invalid element encountered, skipping');
      }
    }

    return pathsToPagesWithAnnotations;
  }

  parseAnnotations(dom: JSDOM): Annotation[] {
    const elements = this.parseDOMIntoElements(
      dom,
      '//*/*[self::p[b] or self::h2][preceding-sibling::h1]',
    );

    const annotations: Annotation[] = [];
    let pageName: string | null = null;

    for (const element of elements) {
      if (!element?.textContent) {
        this.logger.warn('Invalid element encountered, skipping');

        continue;
      }

      if (element.tagName === 'H2') {
        pageName = element.textContent;

        continue
      }

      if (!pageName) {
        throw new Error(`Current page is unknown`);
      }

      // todo handle extra newlines, use various strategies
      const [title, content] = element.textContent
        .split('\n')
        .map((text) => text.trim());

      if (content && title) {
        annotations.push({ title, content, pageName });
      } else {
        this.logger.warn(
          `Could not parse annotation <${element.textContent}> @ ${pageName}`,
        );
      }
    }

    return annotations;
  }

  private parseDOMIntoElements(dom: JSDOM, xPathExpression: string): Element[] {
    const elements: Element[] = [];
    const snapshotOfNodes = new dom.window.XPathEvaluator()
      .createExpression(xPathExpression)
      .evaluate(
        dom.window.document,
        dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      );

    for (let i = 0; i < snapshotOfNodes.snapshotLength; i++) {
      const item = snapshotOfNodes.snapshotItem(i) as Element | null;

      if (item) {
        elements.push(item);
      } else {
        this.logger.warn('nullish node encountered, skipping');
      }
    }

    return elements;
  }
}
