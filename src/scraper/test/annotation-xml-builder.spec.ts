import { AnnotationXMLBuilder } from '../annotation-xml-builder';
import { annotationStub } from './stubs/annotation-stub';
import fs from 'fs';
import { parseString } from 'xml2js';

const firstRecord =
  '<d:dictionary xmlns="http://www.w3.org/1999/xhtml" xmlns:d="http://www.apple.com/DTDs/DictionaryService-1.0.rng">';

describe(AnnotationXMLBuilder.name, () => {
  it('should be defined', () => {
    expect(AnnotationXMLBuilder).toBeDefined();
  });

  it('should start with a declaration', (done) => {
    const annotationXMLBuilder = new AnnotationXMLBuilder();
    annotationXMLBuilder.on('data', (data) => {
      expect(data).toBe(firstRecord);
      done();
    });

    expect.assertions(1);
  });

  it('should build correct XML for annotation', (done) => {
    const chunksOfXML: string[] = [];
    const parsedAnnotation = fs
      .readFileSync(__dirname + '/stubs/parsed-annotation-stub.xml')
      .toString();

    const annotationXMLBuilder = new AnnotationXMLBuilder();
    annotationXMLBuilder.on('data', (chunk) => chunksOfXML.push(chunk));
    annotationXMLBuilder.write(annotationStub);
    annotationXMLBuilder.end(() => {
      parseString(parsedAnnotation, (err, res1) => {
        parseString(chunksOfXML.join(''), (err, res2) => {
          expect(res1).toStrictEqual(res2);
          done();
        });
      });
    });

    expect.assertions(1);
  });
});
