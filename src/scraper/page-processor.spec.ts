import 'reflect-metadata';
import { PageProcessor } from './page-processor';
import { container } from 'tsyringe';
import fs from 'fs';
import { JSDOM } from 'jsdom';
import { annotationsFromPages3To27 } from './test/resources/annotations/annotations-from-pages-3-to-27';
import { TaskQueue } from './task-queue';
import { PageLoader } from './page-loader';
import { mockLogger } from './test/mock-logger';
import { AnnotationXMLBuilder } from './annotation-xml-builder/annotation-xml-builder';

mockLogger();

const pageHTML = fs.readFileSync(
  __dirname + '/test/resources/raw-pages/pages-3-27-with-annotations.html',
);
const pageDOM = new JSDOM(pageHTML, { url: 'http://localhost' });

describe(PageProcessor.name, () => {
  const pageProcessor = container.resolve(PageProcessor);

  it('should be able to parse annotations from a page', async () => {
    const parsedAnnotations = pageProcessor.parseAnnotations(pageDOM);
    expect(parsedAnnotations).toStrictEqual(annotationsFromPages3To27);
  });

  describe(PageProcessor.prototype.processPages.name, () => {
    const taskQueue = container.resolve(TaskQueue);
    const pageLoader = container.resolve(PageLoader);
    const annotationXMLBuilder = container.resolve(AnnotationXMLBuilder);

    it('should put tasks into queue', async () => {
      const queueAddSpy = jest.spyOn(taskQueue, 'add');
      const loadPageDOMSpy = jest
        .spyOn(pageLoader, 'loadPageDOM')
        .mockReturnValue(Promise.resolve(new JSDOM()));

      const urls = ['url1', 'url2'];

      await pageProcessor.processPages(
        urls,
        annotationXMLBuilder.createStream(),
      );

      expect(queueAddSpy).toHaveBeenCalledTimes(urls.length);
      expect(loadPageDOMSpy).toHaveBeenCalledTimes(urls.length);
    });
  });
});
