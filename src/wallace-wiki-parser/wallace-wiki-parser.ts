import type { DictionaryEntry } from '../dictionary-entry';
import type { JSDOM } from 'jsdom';
import type { Logger } from '../logger';
import { tokens } from '../tokens';

export class WallaceWikiParser {
  public static inject = [tokens.logger] as const;
  constructor(private readonly logger: Logger) {}

  parseTableOfContents(dom: JSDOM): string[] {
    const pathsToPagesWithDictionaryEntries: string[] = [];
    const elements = this.parseDOMIntoElements(
      dom,
      '//*[@id="ij-pbp"]/a/@href',
    );

    for (const element of elements) {
      const relativeUrl = element.nodeValue;

      if (relativeUrl) {
        pathsToPagesWithDictionaryEntries.push(relativeUrl);
      } else {
        this.logger.warn('Invalid element encountered, skipping');
      }
    }

    return pathsToPagesWithDictionaryEntries;
  }

  parseDictionaryEntries(dom: JSDOM): DictionaryEntry[] {
    const xPathExpression =
      '//*/*[' +
      'self::div[b and not(@class)] or ' +
      'self::p[preceding-sibling::div[b and not(@class)]] or ' +
      'self::p[b or preceding-sibling::p[not(br)]] or ' +
      'self::b[following-sibling::br] or ' +
      'self::h2' +
      '][preceding-sibling::h1]';

    const domElements = this.parseDOMIntoElements(dom, xPathExpression);
    const dictionaryEntries: DictionaryEntry[] = [];

    let pageName: string | null = null;
    let previousElement: Element | null = null;
    let lastDictionaryEntry: DictionaryEntry | null = null;
    let savedTerm: string | null = null;
    let dictionaryEntryIsBeingParsed = false;

    for (const domElement of domElements) {
      if (!domElement.textContent?.trim()) {
        continue;
      }

      if (domElement.tagName === 'DIV' || domElement.tagName === 'B') {
        previousElement = domElement;
        savedTerm = domElement.textContent;
        dictionaryEntryIsBeingParsed = true;

        continue;
      }

      if (
        domElement.tagName === 'P' &&
        (previousElement?.tagName === 'DIV' ||
          previousElement?.tagName === 'B' ||
          previousElement?.tagName === 'P') &&
        savedTerm &&
        pageName &&
        dictionaryEntryIsBeingParsed
      ) {
        dictionaryEntries.push({
          term: savedTerm,
          definition: domElement.textContent,
          pageName,
        });

        dictionaryEntryIsBeingParsed = false;
        previousElement = domElement;

        continue;
      }

      if (domElement.tagName === 'H2') {
        pageName = domElement.textContent;
        previousElement = null;
        dictionaryEntryIsBeingParsed = false;

        continue;
      }

      if (!pageName) {
        throw new Error(`Current page is unknown`);
      }

      const [term, definition] = domElement.textContent
        .split('\n')
        .map((text) => text.trim());

      if (term && definition) {
        const dictionaryEntry = { term, definition, pageName };
        dictionaryEntries.push(dictionaryEntry);
        lastDictionaryEntry = dictionaryEntry;
        previousElement = domElement;
      } else {
        if (
          previousElement?.tagName === 'P' &&
          lastDictionaryEntry &&
          domElement.textContent.trim() !== '' &&
          !domElement.innerHTML.includes('<b>') &&
          !dictionaryEntryIsBeingParsed
        ) {
          lastDictionaryEntry.definition += `\n${domElement.textContent}`;
          previousElement = null;
          dictionaryEntryIsBeingParsed = false;

          continue;
        }

        if (term && !definition && !dictionaryEntryIsBeingParsed) {
          savedTerm = term;
          dictionaryEntryIsBeingParsed = true;
          previousElement = domElement;
          continue;
        }

        this.logger.warn(
          `Could not parse <${domElement.textContent}> @ ${pageName}`,
        );

        previousElement = null;
        dictionaryEntryIsBeingParsed = false;
        savedTerm = null;
        lastDictionaryEntry = null;
      }
    }

    return dictionaryEntries;
  }

  private parseDOMIntoElements(dom: JSDOM, xPathExpression: string): Element[] {
    const domElements: Element[] = [];
    const nodes = new dom.window.XPathEvaluator()
      .createExpression(xPathExpression)
      .evaluate(
        dom.window.document,
        dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      );

    for (let i = 0; i < nodes.snapshotLength; i++) {
      const domElement = nodes.snapshotItem(i) as Element | null;

      if (domElement) {
        domElements.push(domElement);
      } else {
        this.logger.warn('nullish node encountered, skipping');
      }
    }

    return domElements;
  }
}
