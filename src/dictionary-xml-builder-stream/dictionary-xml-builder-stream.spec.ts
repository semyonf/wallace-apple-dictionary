import { parseStringPromise } from 'xml2js';
import { DictionaryXMLBuilderStream } from './dictionary-xml-builder-stream';
import { loadResource, ResourceName } from '../test-helpers/resource-loader';
import type { DictionaryEntry } from '../dictionary-entry';

describe(DictionaryXMLBuilderStream.name, () => {
  let parsedDictionaryEntryXML: string;

  beforeAll(async () => {
    parsedDictionaryEntryXML = await loadResource(
      ResourceName.ParsedDictionaryEntryXml,
    );
  });

  it('should emit declaration chunk first', (done) => {
    const dictionaryXMLBuilder = new DictionaryXMLBuilderStream();
    const xmlDeclaration =
      '<?xml version="1.0" encoding="UTF-8"?>\n<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">';

    dictionaryXMLBuilder.on('data', (data) => {
      expect(data).toBe(xmlDeclaration);
      done();
    });

    expect.assertions(1);
  });

  it('should build correct XML representation of a dictionary entry', async () => {
    const parsedXmlDictionaryEntry = await parseStringPromise(
      parsedDictionaryEntryXML,
    );
    const dictionaryEntryStub: DictionaryEntry = {
      term: 'Uncle Charles',
      definition: `Hal's Uncle, Charles Tavis, is head of the Enfield Tennis Academy.`,
      pageName: 'Page 3',
    };

    let builtXML = '';
    const dictionaryXMLBuilderStream = new DictionaryXMLBuilderStream();
    dictionaryXMLBuilderStream
      .on('data', (chunk) => (builtXML += chunk))
      .write(dictionaryEntryStub);

    await new Promise<void>((resolve) => {
      dictionaryXMLBuilderStream.end(async () => {
        const parsedBuiltXML = await parseStringPromise(builtXML);

        expect(parsedBuiltXML).toStrictEqual(parsedXmlDictionaryEntry);
        resolve();
      });
    });

    expect.assertions(1);
  });
});
