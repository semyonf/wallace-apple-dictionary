import { AnnotationXMLBuilderStream } from './annotation-xml-builder-stream';

export class AnnotationXMLBuilder {
  createStream(): AnnotationXMLBuilderStream {
    return new AnnotationXMLBuilderStream();
  }
}
