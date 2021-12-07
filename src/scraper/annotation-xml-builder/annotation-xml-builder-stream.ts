import { Duplex } from 'stream';
import xml from 'xml';
import { Annotation } from '../types';
import { snakeCase } from 'snake-case';

/**
 * This should have been a Transform stream, but since xml library
 * only partially implements Readable stream interface, I was only
 * able to implement this one as Duplex.
 */
export class AnnotationXMLBuilderStream extends Duplex {
  private readonly rootElement = xml.element({
    _attr: {
      xmlns: 'http://www.w3.org/1999/xhtml',
      'xmlns:d': 'http://www.apple.com/DTDs/DictionaryService-1.0.rng',
    },
  });

  private readonly xmlStream = xml(
    { 'd:dictionary': this.rootElement },
    {
      stream: true,
      indent: '\t',
    },
  );

  private chunkId = 0;

  constructor() {
    super({ objectMode: true });
    this.xmlStream.on('data', (chunk) => this.push(chunk));
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  _read(): void {}

  _final(callback: (error?: Error | null) => void): void {
    this.rootElement.close();
    callback();
  }

  _write(
    annotation: Annotation,
    _encoding: never,
    callback: (error?: Error | null) => void,
  ): void {
    this.rootElement.push(this.getAnnotationXmlObject(annotation));
    callback();
  }

  private getAnnotationXmlObject(annotation: Annotation): xml.XmlObject {
    return {
      'd:entry': [
        {
          _attr: {
            id: snakeCase(
              `${annotation.title} ${annotation.pageName} ${this.chunkId++}`,
            ),
            'd:title': annotation.title,
            'd:parental-control': 1,
          },
        },
        {
          'd:index': [{ _attr: { 'd:value': annotation.title } }],
        },
        {
          'd:index': [{ _attr: { 'd:value': annotation.pageName } }],
        },
        { b: annotation.title },
        { div: [{ _attr: { class: 'd-page' } }, annotation.pageName] },
        {
          p: annotation.content,
        },
      ],
    };
  }
}
