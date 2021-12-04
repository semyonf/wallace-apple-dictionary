import { writeFileSync } from 'fs'
import got from 'got'
import { JSDOM } from "jsdom"
import { snakeCase } from 'snake-case'
import xml from 'xml'

const xmlFileName = 'build/parsed.xml'
const urlTitles = [
  "Pages_3-27", "Pages_27-63",
  "Pages_63-87", "Pages_87-127", "Pages_127-156", "Pages_157-181",
  "Pages_181-198", "Pages_198-219", "Pages_219-258", "Pages_258-283", "Pages_283-306", "Pages_306-321",
  "Pages_321-342", "Pages_343-379", "Pages_380-398", "Pages_398-418", "Pages_418-442", "Pages_442-469",
  "Pages_470-489", "Pages_489-508", "Pages_508-530", "Pages_531-562", "Pages_563-588", "Pages_589-619",
  "Pages_620-651", "Pages_651-662", "Pages_663-686", "Pages_686-698", "Pages_698-716", "Pages_716-735", 
  "Pages_736-755", "Pages_755-785", "Pages_785-808", "Pages_809-827", "Pages_827-845", "Pages_845-876",
  "Pages_876-883", "Pages_883-902", "Pages_902-916", "Pages_916-934", "Pages_934-964", "Pages_964-981",
  "Notes_and_Errata_-_Pages_983-1079"
]

Promise.all(urlTitles
  .map(title => got(`https://infinitejest.wallacewiki.com`, { searchParams: { title } })
    .then(res => {
      console.log(`- Downloaded html for ${title}`)
      const definitions = parseDefinitionsFromHtml(res.body, res.url)
      console.log(`- Extracted definitions from ${title}`)

      return definitions
    })
  )).then(definitions => {
    const xmlString = buildXmlForDefinitions(definitions.flat())
    console.log('- Created an XML')
    writeFileSync(xmlFileName, xmlString)
    console.log(`- Saved to a file "${xmlFileName}"`)
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })

interface Definition {
  key: string
  value: string
  pageName: string
}

type Page = {
  name: string, 
  definitions: Array<Omit<Definition, 'pageName'>>
}

function parseDefinitionsFromHtml(html: string, url: string): Definition[] {
  const dom = new JSDOM(html, { url, contentType: "text/html" })
  const htmlElements = Array.from(dom.window.document.querySelectorAll('#mw-content-text>h2,p'));
  const pages: Page[] = [];
  let currentPage: Page | null = null;

  for (const { tagName, children, textContent } of htmlElements) {
    if (tagName === 'H2' && textContent) {
      if (currentPage) {
        pages.push(currentPage)
      }

      currentPage = { name: textContent, definitions: [] }
    } else if (currentPage && tagName === 'P' && children[0]?.textContent && textContent?.split("\n")[1] !== '') {
      currentPage.definitions.push({ key: children[0].textContent.replace(/\.{3}|"/g, ''), value: textContent!.split("\n")[1] })
    } else {
      console.error(`Could not parse: ${textContent}`)
    }
  }

  return pages.map(page => page.definitions.map(definition => ({...definition, pageName: page.name}))).flat()
}

function buildXmlForDefinitions(definitions: Definition[]) {
  return xml({
    'd:dictionary': [{
      _attr: {
        'xmlns': 'http://www.w3.org/1999/xhtml',
        'xmlns:d': 'http://www.apple.com/DTDs/DictionaryService-1.0.rng',
      }
    },
    ...definitions.map((definition, index) => ({
      'd:entry': [
        {
          _attr: {
            id: snakeCase(`${definition.key} ${definition.pageName} ${index}`),
            'd:title': definition.key,
            'd:parental-control': 1
          },
        },
        {
          'd:index': [{ _attr: { 'd:value': definition.key } }]
        },
        {
          'd:index': [{ _attr: { 'd:value': definition.pageName } }]
        },
        { b: definition.key },
        { div: [{ _attr: { class: 'd-page' } }, definition.pageName] },
        {
          p: definition.value
        },
      ]
    }))]
  }, { declaration: { encoding: 'UTF-8' }, indent: '\t' })
}
