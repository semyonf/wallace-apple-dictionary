import { annotationStub } from '../test/resources/annotation-stub';
import fs from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import { AnnotationXMLBuilderStream } from './annotation-xml-builder-stream';

describe(AnnotationXMLBuilderStream.name, () => {
  let parsedAnnotationXML: string;

  beforeAll(async () => {
    parsedAnnotationXML = await fs.readFile(
      __dirname + '/../test/resources/parsed-annotation-stub.xml',
      'utf-8',
    );
  });

  it('should start with a declaration', (done) => {
    const annotationXMLBuilder = new AnnotationXMLBuilderStream();
    const xmlDeclaration =
      '<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">';

    annotationXMLBuilder.on('data', (data) => {
      expect(data).toBe(xmlDeclaration);
      done();
    });

    expect.assertions(1);
  });

  it('should build correct XML for annotation', async () => {
    const parsedXmlAnnotation = await parseStringPromise(parsedAnnotationXML);

    let builtXML = '';
    const annotationXMLBuilder = new AnnotationXMLBuilderStream();
    annotationXMLBuilder.on('data', (chunk) => (builtXML += chunk));
    annotationXMLBuilder.write(annotationStub);

    await new Promise<void>((resolve) => {
      annotationXMLBuilder.end(async () => {
        const parsedBuiltXML = await parseStringPromise(builtXML);

        expect(parsedBuiltXML).toStrictEqual(parsedXmlAnnotation);
        resolve();
      });
    });

    expect.assertions(1);
  });
});
