#!/usr/bin/env node
'use strict'

const https = require('https')
const fs = require('fs')
const jsdom = require("jsdom")
const xml = require('xml')
const { snakeCase } = require('snake-case')
const { JSDOM } = jsdom

const url = 'https://infinitejest.wallacewiki.com/david-foster-wallace/index.php?title=Pages_3-27'
let html = ''

https.get(url, (res) => {
    res.setEncoding('utf8')
    res.on('data', (chunk) => {
      if (res.statusCode !== 200) {
        console.log('Status: ' + res.statusCode)
        console.log('Body: ' + chunk)

        process.exit(1)
      } else {
        html += chunk
      }
    })
  })
  .on('error', (e) => {
    console.log('Something went wrong: ' + e.message)

    process.exit(1)
  })
  .on('close', () => {
    console.log('Downloaded dictionaries')
    buildXmlFromHtml(html)
  })

function buildXmlFromHtml(html) {
  const dom = new JSDOM(html, { url, contentType: "text/html" })
  const definitions = [...dom.window.document.querySelectorAll('#mw-content-text>h2,p')]
    .reduce((prev, curr) => {
      if (curr.tagName === 'H2') {
        prev.unshift({ name: curr.textContent, definitions: [] })
      } else if (curr.tagName === 'P' && curr.children[0] && curr.textContent.split("\n")[1] !== '') {
        prev[0].definitions.push({ key: curr.children[0].textContent, value: curr.textContent.split("\n")[1] })
      }
      return prev
    }, []).map(page => page.definitions.map(definition => ({ ...definition, pageNum: page.name }))).flat()

  console.log('Parsed dictionaries')

  const xmlString = xml({
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

  console.log('Created an XML')

  fs.writeFileSync('WallaceDictionary.xml', xmlString)
}
