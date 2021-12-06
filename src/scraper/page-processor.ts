import { Annotation } from './types';
import { JSDOM } from 'jsdom';
import { TaskQueue } from './task-queue';
import { PageLoader } from './page-loader';
import { AnnotationXMLBuilder } from './annotation-xml-builder';
import { injectable } from 'tsyringe';

@injectable()
export class PageProcessor {
  constructor(
    private readonly pageLoader: PageLoader,
    private readonly taskQueue: TaskQueue,
  ) {}

  parseTableOfContents(dom: JSDOM): string[] {
    const anchorNodesSnapshot = new dom.window.XPathEvaluator()
      .createExpression('//*[@id="ij-pbp"]/a/@href')
      .evaluate(
        dom.window.document,
        dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      );

    const pathsToPagesWithAnnotations: string[] = [];

    for (let i = 0; i < anchorNodesSnapshot.snapshotLength; i++) {
      const node = anchorNodesSnapshot.snapshotItem(i) as Element | null;
      const relativeUrl = node?.nodeValue;

      if (relativeUrl) {
        pathsToPagesWithAnnotations.push(relativeUrl);
      } else {
        console.warn('Invalid node encountered, skipping');
      }
    }

    return pathsToPagesWithAnnotations;
  }

  parseAnnotations(dom: JSDOM): Annotation[] {
    const nodesSnapshot = new dom.window.XPathEvaluator()
      .createExpression('//*/*[self::p[b] or self::h2][preceding-sibling::h1]')
      .evaluate(
        dom.window.document,
        dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      );

    const annotations: Annotation[] = [];
    let pageName: string | null = null;

    for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
      const node = nodesSnapshot.snapshotItem(i) as Element | null;

      if (!node?.textContent) {
        console.warn('Invalid node encountered, skipping');

        continue;
      }

      if (node.tagName === 'H2') {
        pageName = node.textContent;
      } else {
        if (!pageName) {
          throw new Error(`Current page is unknown`);
        }

        // todo handle extra newlines, use various strategies
        const [title, content] = node.textContent.split('\n');

        if (content) {
          annotations.push({ title, content, pageName });
        } else {
          console.warn(`Could not parse annotation <${title}> @ ${pageName}`);
        }
      }
    }

    return annotations;
  }

  async processPages(
    pathsToPages: string[],
    xmlSaver: AnnotationXMLBuilder,
  ): Promise<void> {
    await Promise.all(
      pathsToPages.map((path) =>
        this.taskQueue.add(async () => {
          const pageDOM = await this.pageLoader.loadPageDOM(path);
          const parsedAnnotations = this.parseAnnotations(pageDOM);
          console.log(`- Parsed annotations from ${path}`);
          parsedAnnotations.forEach((annotation) => xmlSaver.write(annotation));
        }),
      ),
    );
  }
}
