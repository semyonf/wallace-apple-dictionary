import { Transform, TransformCallback } from 'stream';
import xml from 'xml';
import type { DictionaryEntry } from '../dictionary-entry';
import { snakeCase } from 'snake-case';

export class DictionaryXMLBuilderStream extends Transform {
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
    dictionaryEntry: DictionaryEntry,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ): void {
    this.rootXmlElement.push(this.getDictionaryEntryXmlObject(dictionaryEntry));
    this.xmlChunkId++;
    callback();
  }

  // TODO: refactor
  private getDictionaryEntryXmlObject({
    definition,
    pageName,
    term,
  }: DictionaryEntry): xml.XmlObject {
    return {
      'd:entry': [
        {
          _attr: {
            id: snakeCase(`${term} ${pageName} ${this.xmlChunkId}`),
            'd:title': term,
            'd:parental-control': 1,
          },
        },
        { 'd:index': [{ _attr: { 'd:value': term } }] },
        !term.includes('.')
          ? {}
          : {
              'd:index': [
                {
                  _attr: {
                    'd:value': term.split('.').join(''),
                  },
                },
              ],
            },
        { 'd:index': [{ _attr: { 'd:value': pageName } }] },
        { b: term },
        { div: [{ _attr: { class: 'd-page' } }, pageName] },
        { p: definition },
      ],
    };
  }
}
