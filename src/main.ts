import { createWriteStream } from 'fs';
import { DictionaryXMLBuilderStream } from './dictionary-xml-builder-stream/dictionary-xml-builder-stream';
import { appInjector } from './app-injector';
import { tokens } from './tokens';

const [xmlFilePath] = process.argv.slice(2);

if (!xmlFilePath) {
  throw new Error('Path is not defined');
}

const outputStream = createWriteStream(xmlFilePath, 'utf-8');

const scraper = appInjector.resolve(tokens.scraper);
const logger = appInjector.resolve(tokens.logger);

scraper
  .scrapeDictionaryEntries()
  .pipe(new DictionaryXMLBuilderStream())
  .pipe(outputStream)
  .on('close', () => logger.log('- XML IS READY'))
  .on('error', (e) => {
    logger.error(e);
    process.exit(1);
  });
