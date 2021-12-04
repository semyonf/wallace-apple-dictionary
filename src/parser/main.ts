import { writeFile } from 'fs/promises';
import { JSDOM } from 'jsdom';
import axios from 'axios';
import PQueue from 'p-queue';
import { Definition } from './types';
import { parseDefinitionsFromHtml } from './parse-definitions-from-html';
import { buildXmlForDefinitions } from './build-xml-for-definitions';

const xmlFileName = 'build/parsed.xml';
const baseURL = 'https://infinitejest.wallacewiki.com';
const queue = new PQueue({ concurrency: 5 });
const axiosInstance = axios.create({ baseURL });
const definitions: Definition[] = [];

async function main() {
  const { data: html } = await axiosInstance.get('/david-foster-wallace');
  const dom = new JSDOM(html, { url: baseURL, contentType: 'text/html' });

  const xPathEvaluator = new dom.window.XPathEvaluator();
  const nodesSnapshot = xPathEvaluator
    .createExpression('//*[@id="ij-pbp"]/a/@href')
    .evaluate(
      dom.window.document,
      dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    );

  const queuePromises = [];

  for (let i = 0; i < nodesSnapshot.snapshotLength; i++) {
    const node = nodesSnapshot.snapshotItem(i) as Element | null;
    const url = node?.nodeValue;

    if (!url) {
      throw new Error();
    }

    const queuePromise = queue.add(async () => {
      const { data: html } = await axiosInstance.get(url);
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
