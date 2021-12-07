import { PageLoader } from './page-loader';
import { PageProcessor } from './page-processor';
import { injectable } from 'tsyringe';
import { AnnotationXMLBuilder } from './annotation-xml-builder/annotation-xml-builder';

enum PagePaths {
  Home = '/david-foster-wallace',
}

@injectable()
export class WallaceAppleDictionary {
  constructor(
    private readonly pageLoader: PageLoader,
    private readonly pageProcessor: PageProcessor,
    private readonly annotationXMLBuilder: AnnotationXMLBuilder,
  ) {}

  async prepareXml(outputStream: NodeJS.WritableStream): Promise<void> {
    const builderStream = this.annotationXMLBuilder.createStream();
    builderStream.pipe(outputStream);

    const homePageDOM = await this.pageLoader.loadPageDOM(PagePaths.Home);
    const pathsToPages = this.pageProcessor.parseTableOfContents(homePageDOM);
    await this.pageProcessor.processPages(pathsToPages, builderStream);

    return new Promise((resolve) => builderStream.end(resolve));
  }
}
