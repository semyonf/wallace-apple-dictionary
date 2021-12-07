import { annotationStub } from '../test/resources/annotation-stub';
import fs from 'fs';
import { parseString } from 'xml2js';
import { AnnotationXMLBuilderStream } from './annotation-xml-builder-stream';

const firstRecord =
  '<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">';

describe(AnnotationXMLBuilderStream.name, () => {
  it('should be defined', () => {
    expect(AnnotationXMLBuilderStream).toBeDefined();
  });

  it('should start with a declaration', (done) => {
    const annotationXMLBuilder = new AnnotationXMLBuilderStream();
    annotationXMLBuilder.on('data', (data) => {
      expect(data).toBe(firstRecord);
      done();
    });

    expect.assertions(1);
  });

  it('should build correct XML for annotation', (done) => {
    let builtXML = '';
    const xmlAnnotation = fs
      .readFileSync(__dirname + '/../test/resources/parsed-annotation-stub.xml')
      .toString();

    const annotationXMLBuilder = new AnnotationXMLBuilderStream();
    annotationXMLBuilder.on('data', (chunk) => (builtXML += chunk));
    annotationXMLBuilder.write(annotationStub);
    annotationXMLBuilder.end(() => {
      parseString(xmlAnnotation, (err, parsedXmlAnnotation) => {
        parseString(builtXML, (err, parsedBuiltXML) => {
          expect(parsedBuiltXML).toStrictEqual(parsedXmlAnnotation);

          done();
        });
      });
    });

    expect.assertions(1);
  });
});
