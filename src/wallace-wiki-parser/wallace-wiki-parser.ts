import type { Annotation } from '../annotation';
import type { JSDOM } from 'jsdom';
import type { Logger } from '../logger';
import { tokens } from '../tokens';

export class WallaceWikiParser {
  public static inject = [tokens.logger] as const;
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

  // TODO: Refactor
  parseAnnotations(dom: JSDOM): Annotation[] {
    const elements = this.parseDOMIntoElements(
      dom,
      '//*/*[self::div[b and not(@class)] or self::p[preceding-sibling::div[b and not(@class)]] or self::p[b or preceding-sibling::p[not(br)]] or self::b[following-sibling::br] or self::h2][preceding-sibling::h1]',
    );

    const annotations: Annotation[] = [];
    let pageName: string | null = null;
    let previousElement: Element | null = null;
    let lastAnnotation: Annotation | null = null;
    let savedTitle: string | null = null;
    let annotationIsBeingParsed = false;

    for (const element of elements) {
      if (!element.textContent?.trim()) {
        continue;
      }

      if (element.tagName === 'DIV' || element.tagName === 'B') {
        previousElement = element;
        savedTitle = element.textContent;
        annotationIsBeingParsed = true;

        continue;
      }

      if (
        element.tagName === 'P' &&
        (previousElement?.tagName === 'DIV' ||
          previousElement?.tagName === 'B' ||
          previousElement?.tagName === 'P') &&
        savedTitle &&
        pageName &&
        annotationIsBeingParsed
      ) {
        annotations.push({
          title: savedTitle,
          content: element.textContent,
          pageName,
        });

        annotationIsBeingParsed = false;
        previousElement = element;

        continue;
      }

      if (element.tagName === 'H2') {
        pageName = element.textContent;
        previousElement = null;
        annotationIsBeingParsed = false;

        continue;
      }

      if (!pageName) {
        throw new Error(`Current page is unknown`);
      }

      const [title, content] = element.textContent
        .split('\n')
        .map((text) => text.trim());

      if (content && title) {
        const annotation = { title, content, pageName };
        annotations.push(annotation);

        lastAnnotation = annotation;
        previousElement = element;
      } else {
        if (
          previousElement?.tagName === 'P' &&
          lastAnnotation &&
          element.textContent.trim() !== '' &&
          !element.innerHTML.includes('<b>') &&
          !annotationIsBeingParsed
        ) {
          lastAnnotation.content += `\n${element.textContent}`;
          previousElement = null;
          annotationIsBeingParsed = false;

          continue;
        }

        if (title && !content && !annotationIsBeingParsed) {
          savedTitle = title;
          annotationIsBeingParsed = true;
          previousElement = element;
          continue;
        }

        this.logger.warn(
          `Could not parse annotation <${element.textContent}> @ ${pageName}`,
        );

        previousElement = null;
        annotationIsBeingParsed = false;
        savedTitle = null;
        lastAnnotation = null;
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
