import { AnnotationXMLBuilder } from './annotation-xml-builder';
import { PageLoader } from './page-loader';
import { PageProcessor } from './page-processor';
import { injectable } from 'tsyringe';

enum PagePaths {
  Home = '/david-foster-wallace',
}

@injectable()
export class WallaceAppleDictionary {
  constructor(
    private readonly pageLoader: PageLoader,
    private readonly pageProcessor: PageProcessor,
  ) {}

  async prepareXml(
    outputStream: NodeJS.WritableStream,
    annotationXMLBuilder = new AnnotationXMLBuilder(), // fixme
  ): Promise<void> {
    annotationXMLBuilder.pipe(outputStream);

    const homePageDOM = await this.pageLoader.loadPageDOM(PagePaths.Home);
    const pathsToPages = this.pageProcessor.parseTableOfContents(homePageDOM);
    await this.pageProcessor.processPages(pathsToPages, annotationXMLBuilder);

    return new Promise((resolve) => annotationXMLBuilder.end(() => resolve()));
  }
}
