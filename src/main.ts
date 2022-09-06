import { createWriteStream } from 'fs';
import { AnnotationXMLBuilderStream } from './annotation-xml-builder-stream/annotation-xml-builder-stream';
import { appInjector } from './app-injector';

const [xmlFilePath] = process.argv.slice(2);

if (!xmlFilePath) {
  throw new Error('Path is not defined');
}

const outputStream = createWriteStream(xmlFilePath, 'utf-8');

const scraper = appInjector.resolve('scraper');
const logger = appInjector.resolve('logger');

scraper
  .scrapeAnnotations()
  .pipe(new AnnotationXMLBuilderStream())
  .pipe(outputStream)
  .on('close', () => logger.log('- XML IS READY'))
  .on('error', (e) => {
    logger.error(e);
    process.exit(1);
  });
