import 'reflect-metadata';
import { Scraper } from './scraper/scraper';
import { createWriteStream } from 'fs';
import { container } from 'tsyringe';
import { Logger } from './logger';
import { AnnotationXMLBuilderStream } from './annotation-xml-builder-stream/annotation-xml-builder-stream';

const [xmlFilePath] = process.argv.slice(2);
const outputStream = createWriteStream(xmlFilePath, 'utf-8');

const scraper = container.resolve(Scraper);
const logger = container.resolve(Logger);

scraper
  .scrapeAnnotations()
  .pipe(new AnnotationXMLBuilderStream())
  .pipe(outputStream)
  .on('close', () => logger.log('- XML IS READY'))
  .on('error', (e) => {
    logger.error(e);
    process.exit(1);
  });
