#!/usr/bin/env node
'use strict'

const fs = require('fs')
const got = require('got')
const xml = require('xml')
const { JSDOM } = require("jsdom")
const { snakeCase } = require('snake-case')

const xmlFileName = 'WallaceDictionary.xml'
const urlTitles = [
  "Pages_3-27", "Pages_27-63", 
  // "Pages_63-87", "Pages_87-127", "Pages_127-156", "Pages_157-181",
  // "Pages_181-198", "Pages_198-219", "Pages_219-258", "Pages_258-283", "Pages_283-306", "Pages_306-321",
  // "Pages_321-342", "Pages_343-379", "Pages_380-398", "Pages_398-418", "Pages_418-442", "Pages_442-469",
  // "Pages_470-489", "Pages_489-508", "Pages_508-530", "Pages_531-562", "Pages_563-588", "Pages_589-619",
  // "Pages_620-651", "Pages_651-662", "Pages_663-686", "Pages_686-698", "Pages_698-716", "Pages_716-735", 
  // "Pages_736-755", "Pages_755-785", "Pages_785-808", "Pages_809-827", "Pages_827-845", "Pages_845-876",
  // "Pages_876-883", "Pages_883-902", "Pages_902-916", "Pages_916-934", "Pages_934-964", "Pages_964-981",
  // "Notes_and_Errata_-_Pages_983-1079"
]

Promise.all(
  urlTitles
    .map(title => got(`https://infinitejest.wallacewiki.com/david-foster-wallace/index.php`, { searchParams: { title } })
      .then(res => {
        console.log(`- Downloaded html for ${title}`)
        const definitions = parseDefinitionsFromHtml(res.body, res.url)
        console.log(`- Extracted definitions from ${title}`)
        
        return definitions
      })
    )
).then(definitions => {
  const xmlString = buildXmlForDefinitions(definitions.flat())
  console.log('- Created an XML')
  fs.writeFileSync(xmlFileName, xmlString)
  console.log(`- Saved to a file "${xmlFileName}"`)
})

function parseDefinitionsFromHtml(html, url) {
  const dom = new JSDOM(html, { url, contentType: "text/html" })

  return [...dom.window.document.querySelectorAll('#mw-content-text>h2,p')]
    .reduce((definitionPages, htmlElement) => {
      const { tagName, children, textContent } = htmlElement

      if (tagName === 'H2') {
        definitionPages.unshift({ name: textContent, definitions: [] })
      } else if (tagName === 'P' && children[0] && textContent.split("\n")[1] !== '') {
        definitionPages[0].definitions.push({ key: children[0].textContent.replace(/\.{3}|"/, ''), value: textContent.split("\n")[1] })
      } else {
        console.error(`Could not parse: ${textContent}`)
      }

      return definitionPages
    }, [])
    .map(page => page.definitions.map(definition => ({ ...definition, pageNum: page.name })))
    .flat()
}

function buildXmlForDefinitions(definitions) {
  return xml({
    'd:dictionary': [{
      _attr: {
        'xmlns': 'http://www.w3.org/1999/xhtml',
        'xmlns:d': 'http://www.apple.com/DTDs/DictionaryService-1.0.rng',
      }
    },
    ...definitions.map(definition => ({
      'd:entry': [
        {
          _attr: {
            id: snakeCase(`${definition.key} ${definition.pageNum}`),
            'd:title': definition.key,
            'd:parental-control': 1
          },
        },
        {
          'd:index': [{ _attr: { 'd:value': definition.key } }]
        },
        { h1: definition.key },
        { h3: definition.pageNum },
        {
          ul: [{
            li: definition.value
          }]
        },
      ]
    }))]
  }, { declaration: { encoding: 'UTF-8' }, indent: true })
}
