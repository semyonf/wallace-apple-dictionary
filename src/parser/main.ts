import PQueue from 'p-queue';
import axios from 'axios';
import { Definition } from './types';
import { JSDOM } from 'jsdom';
import { buildXmlForDefinitions } from './build-xml-for-definitions';
import { parseDefinitionsFromHtml } from './parse-definitions-from-html';
import { writeFile } from 'fs/promises';

const xmlFileName = 'build/parsed.xml';
const baseURL = 'https://infinitejest.wallacewiki.com';
const queue = new PQueue({ concurrency: 5 });
const wallaceWikiAxios = axios.create({ baseURL, timeout: 5000 });
const definitions: Definition[] = [];

async function main() {
  const { data: html } = await wallaceWikiAxios.get('/david-foster-wallace');
  const dom = new JSDOM(html, { url: baseURL, contentType: 'text/html' });
  const anchorNodesSnapshot = new dom.window.XPathEvaluator()
    .createExpression('//*[@id="ij-pbp"]/a/@href')
    .evaluate(
      dom.window.document,
      dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    );

  const queuePromises = [];

  for (let i = 0; i < anchorNodesSnapshot.snapshotLength; i++) {
    const node = anchorNodesSnapshot.snapshotItem(i) as Element | null;
    const url = node?.nodeValue;

    if (!url) {
      console.warn('Invalid node encountered, skipping');

      continue;
    }

    const queuePromise = queue.add(async () => {
      const { data: html } = await wallaceWikiAxios.get(url);
      console.log(`- Downloaded html from ${url}`);

      definitions.push(...parseDefinitionsFromHtml(html, baseURL));
      console.log(`- Extracted definitions from ${url}`);
    });

    queuePromises.push(queuePromise);
  }

  await Promise.all(queuePromises);
  const xmlString = buildXmlForDefinitions(definitions.flat());
  console.log('- Created an XML');

  await writeFile(xmlFileName, xmlString);
  console.log(`- Saved to a file "${xmlFileName}"`);
}

main();
