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

      if (this.isTermElement(domElement)) {
        const result = this.handleTermElement(domElement);
        previousElement = result.previousElement;
        savedTerm = result.savedTerm;
        dictionaryEntryIsBeingParsed = result.dictionaryEntryIsBeingParsed;
        continue;
      }

      if (
        this.isDefinitionAfterTerm(
          domElement,
          previousElement,
          savedTerm,
          pageName,
          dictionaryEntryIsBeingParsed,
        )
      ) {
        const entry = this.createDictionaryEntry(
          savedTerm!,
          domElement.textContent,
          pageName!,
        );
        dictionaryEntries.push(entry);
        dictionaryEntryIsBeingParsed = false;
        previousElement = domElement;
        continue;
      }

      if (this.isPageNameElement(domElement)) {
        const result = this.handlePageNameElement(domElement);
        pageName = result.pageName;
        previousElement = result.previousElement;
        dictionaryEntryIsBeingParsed = result.dictionaryEntryIsBeingParsed;
        continue;
      }

      if (!pageName) {
        throw new Error(`Current page is unknown`);
      }

      const [term, definition] = this.parseTermAndDefinition(domElement);

      if (term && definition) {
        const dictionaryEntry = this.createDictionaryEntry(
          term,
          definition,
          pageName,
        );
        dictionaryEntries.push(dictionaryEntry);
        lastDictionaryEntry = dictionaryEntry;
        previousElement = domElement;
      } else {
        if (
          this.isContinuationDefinition(
            domElement,
            previousElement,
            lastDictionaryEntry,
            dictionaryEntryIsBeingParsed,
          )
        ) {
          lastDictionaryEntry!.definition += `\n${domElement.textContent}`;
          previousElement = null;
          dictionaryEntryIsBeingParsed = false;
          continue;
        }

        if (
          this.isNewTermWithoutDefinition(
            term,
            definition,
            dictionaryEntryIsBeingParsed,
          )
        ) {
          savedTerm = term!;
          dictionaryEntryIsBeingParsed = true;
          previousElement = domElement;
          continue;
        }

        this.handleUnparsableElement(domElement, pageName);
        previousElement = null;
        dictionaryEntryIsBeingParsed = false;
        savedTerm = null;
        lastDictionaryEntry = null;
      }
    }

    return dictionaryEntries;
  }

  private isTermElement(element: Element): boolean {
    return element.tagName === 'DIV' || element.tagName === 'B';
  }

  private handleTermElement(element: Element): {
    previousElement: Element;
    savedTerm: string;
    dictionaryEntryIsBeingParsed: boolean;
  } {
    return {
      previousElement: element,
      savedTerm: element.textContent!,
      dictionaryEntryIsBeingParsed: true,
    };
  }

  private isDefinitionAfterTerm(
    element: Element,
    previousElement: Element | null,
    savedTerm: string | null,
    pageName: string | null,
    dictionaryEntryIsBeingParsed: boolean,
  ): boolean {
    return (
      element.tagName === 'P' &&
      !!previousElement &&
      ['DIV', 'B', 'P'].includes(previousElement.tagName) &&
      !!savedTerm &&
      !!pageName &&
      dictionaryEntryIsBeingParsed
    );
  }

  private isPageNameElement(element: Element): boolean {
    return element.tagName === 'H2';
  }

  private handlePageNameElement(element: Element): {
    pageName: string;
    previousElement: null;
    dictionaryEntryIsBeingParsed: boolean;
  } {
    return {
      pageName: element.textContent!,
      previousElement: null,
      dictionaryEntryIsBeingParsed: false,
    };
  }

  private parseTermAndDefinition(
    element: Element,
  ): [string | undefined, string | undefined] {
    const [term, definition] = element
      .textContent!.split('\n')
      .map((text) => text.trim());
    return [term, definition];
  }

  private createDictionaryEntry(
    term: string,
    definition: string,
    pageName: string,
  ): DictionaryEntry {
    return { term, definition, pageName };
  }

  private isContinuationDefinition(
    element: Element,
    previousElement: Element | null,
    lastDictionaryEntry: DictionaryEntry | null,
    dictionaryEntryIsBeingParsed: boolean,
  ): boolean {
    return (
      previousElement?.tagName === 'P' &&
      !!lastDictionaryEntry &&
      element.textContent!.trim() !== '' &&
      !element.innerHTML.includes('<b>') &&
      !dictionaryEntryIsBeingParsed
    );
  }

  private isNewTermWithoutDefinition(
    term: string | undefined,
    definition: string | undefined,
    dictionaryEntryIsBeingParsed: boolean,
  ): boolean {
    return !!term && !definition && !dictionaryEntryIsBeingParsed;
  }

  private handleUnparsableElement(element: Element, pageName: string): void {
    this.logger.warn(`Could not parse <${element.textContent}> @ ${pageName}`);
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
