import 'reflect-metadata';
import { WallaceAppleDictionary } from './wallace-apple-dictionary';
import { createWriteStream } from 'fs';
import { container } from 'tsyringe';
import { Logger } from './logger';

const xmlOutputPath = __dirname + '/../../build/scraped.xml';
const outputStream = createWriteStream(xmlOutputPath, 'utf-8');

const wallaceAppleDictionary = container.resolve(WallaceAppleDictionary);
const logger = container.resolve(Logger);

wallaceAppleDictionary
  .prepareXml(outputStream)
  .then(() => logger.log('- XML IS READY'))
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  });
