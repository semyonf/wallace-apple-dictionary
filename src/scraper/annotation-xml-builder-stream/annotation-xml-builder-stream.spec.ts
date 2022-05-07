import { parseStringPromise } from 'xml2js';
import { AnnotationXMLBuilderStream } from './annotation-xml-builder-stream';
import { loadResource, ResourceName } from '../test-helpers/resource-loader';
import type { Annotation } from '../annotation';

describe(AnnotationXMLBuilderStream.name, () => {
  let parsedAnnotationXML: string;

  beforeAll(async () => {
    parsedAnnotationXML = await loadResource(ResourceName.SingleAnnotation);
  });

  it('should emit declaration chunk first', (done) => {
    const annotationXMLBuilder = new AnnotationXMLBuilderStream();
    const xmlDeclaration =
      '<?xml version="1.0" encoding="UTF-8"?>\n<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">';

    annotationXMLBuilder.on('data', (data) => {
      expect(data).toBe(xmlDeclaration);
      done();
    });

    expect.assertions(1);
  });

  it('should build correct XML representation of an annotation', async () => {
    const parsedXmlAnnotation = await parseStringPromise(parsedAnnotationXML);
    const annotationStub: Annotation = {
      title: 'Uncle Charles',
      content: `Hal's Uncle, Charles Tavis, is head of the Enfield Tennis Academy.`,
      pageName: 'Page 3',
    };

    let builtXML = '';
    const annotationXMLBuilder = new AnnotationXMLBuilderStream();
    annotationXMLBuilder
      .on('data', (chunk) => (builtXML += chunk))
      .write(annotationStub);

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
