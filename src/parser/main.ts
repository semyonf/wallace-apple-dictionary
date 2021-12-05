import PQueue from 'p-queue';
import axios from 'axios';
import { Annotation } from './types';
import { JSDOM } from 'jsdom';
import { compileAnnotationsToXML } from './compile-annotations-to-xml';
import { parseAnnotationsFromHtml } from './parse-annotations-from-html';
import { writeFile } from 'fs/promises';

const baseURL = 'https://infinitejest.wallacewiki.com';
const wallaceWikiAxios = axios.create({ baseURL, timeout: 5000 });

async function main() {
  const xmlFileName = 'build/parsed.xml';
  const urlsOfPagesWithAnnotations = await getUrlsOfPagesContainingAnnotations();
  const annotations: Annotation[] = [];
  const tasks = createParsingTasksForUrls(
    urlsOfPagesWithAnnotations,
    annotations,
    new PQueue({ concurrency: 5 }),
  );

  await Promise.all(tasks);

  const xmlString = compileAnnotationsToXML(annotations);
  console.log('- Compiled an XML');

  await writeFile(xmlFileName, xmlString);
  console.log(`- Saved XML in "${xmlFileName}"`);
}

async function getUrlsOfPagesContainingAnnotations() {
  const { data: html } = await wallaceWikiAxios.get('/david-foster-wallace');
  const dom = new JSDOM(html, { url: baseURL, contentType: 'text/html' });
  const anchorNodesSnapshot = new dom.window.XPathEvaluator()
    .createExpression('//*[@id="ij-pbp"]/a/@href')
    .evaluate(
      dom.window.document,
      dom.window.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    );

  const urls: string[] = [];

  for (let i = 0; i < anchorNodesSnapshot.snapshotLength; i++) {
    const node = anchorNodesSnapshot.snapshotItem(i) as Element | null;
    const url = node?.nodeValue;

    if (url) {
      urls.push(url);
    } else {
      console.warn('Invalid node encountered, skipping');
    }
  }

  return urls;
}

function createParsingTasksForUrls(
  urlsOfPagesWithAnnotations: string[],
  annotations: Annotation[],
  queue: PQueue,
) {
  return urlsOfPagesWithAnnotations.map((url) =>
    queue.add(async () => await parseAnnotationsFromUrl(url, annotations)),
  );
}

async function parseAnnotationsFromUrl(url: string, annotations: Annotation[]) {
  const { data: html } = await wallaceWikiAxios.get(url);
  console.log(`- Downloaded html from ${url}`);

  annotations.push(...parseAnnotationsFromHtml(html, baseURL));
  console.log(`- Parsed annotations from ${url}`);
}

main().catch(() => process.exit(1));
