import 'reflect-metadata';
import { WallaceAppleDictionary } from './wallace-apple-dictionary';
import { createWriteStream } from 'fs';
import { container } from 'tsyringe';

const xmlOutputPath = __dirname + '/../../build/scraped.xml';
const outputStream = createWriteStream(xmlOutputPath, 'utf-8');

const wallaceAppleDictionary = container.resolve(WallaceAppleDictionary);

wallaceAppleDictionary
  .prepareXml(outputStream)
  .then(() => console.log('- XML IS READY'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
