import { Transform, TransformCallback } from 'stream';
import xml from 'xml';
import type { Annotation } from '../annotation';
import { snakeCase } from 'snake-case';

export class AnnotationXMLBuilderStream extends Transform {
  private xmlChunkId = 0;

  private readonly rootXmlElement = xml.element({
    _attr: {
      xmlns: 'http://www.w3.org/1999/xhtml',
      'xmlns:d': 'http://www.apple.com/DTDs/DictionaryService-1.0.rng',
    },
  });

  private readonly xmlStream = xml(
    { 'd:dictionary': this.rootXmlElement },
    {
      stream: true,
      indent: '\t',
      declaration: true,
    },
  );

  constructor() {
    super({ objectMode: true });
    this.xmlStream.on('data', (xmlChunk) => this.push(xmlChunk));
  }

  override _final(callback: (error?: Error | null) => void): void {
    this.rootXmlElement.close();
    this.xmlStream.once('end', callback);
  }

  override _transform(
    annotation: Annotation,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.rootXmlElement.push(this.getAnnotationXmlObject(annotation));
    this.xmlChunkId++;
    callback();
  }

  // TODO: refactor
  private getAnnotationXmlObject(annotation: Annotation): xml.XmlObject {
    return {
      'd:entry': [
        {
          _attr: {
            id: snakeCase(
              `${annotation.title} ${annotation.pageName} ${this.xmlChunkId}`,
            ),
            'd:title': annotation.title,
            'd:parental-control': 1,
          },
        },
        { 'd:index': [{ _attr: { 'd:value': annotation.title } }] },
        !annotation.title.includes('.')
          ? {}
          : {
              'd:index': [
                { _attr: { 'd:value': annotation.title.split('.').join('') } },
              ],
            },
        { 'd:index': [{ _attr: { 'd:value': annotation.pageName } }] },
        { b: annotation.title },
        { div: [{ _attr: { class: 'd-page' } }, annotation.pageName] },
        { p: annotation.content },
      ],
    };
  }
}
