import 'reflect-metadata';
import { PageProcessor } from '../page-processor';
import { container } from 'tsyringe';
import fs from 'fs/promises';
import { JSDOM } from 'jsdom';
import { annotationsFromPages3To27 } from './stubs/annotations-from-pages-3-to-27';

describe(PageProcessor.name, () => {
  const pageProcessor = container.resolve(PageProcessor);

  it('should be able to parse basic annotations', async () => {
    const html = await fs.readFile(
      __dirname + '/stubs/pages-3-27-with-annotations.html',
    );
    const pageDOM = new JSDOM(html, { url: 'http://localhost' });
    const parsedAnnotations = pageProcessor.parseAnnotations(pageDOM);

    expect(parsedAnnotations).toStrictEqual(annotationsFromPages3To27);
  });
});
