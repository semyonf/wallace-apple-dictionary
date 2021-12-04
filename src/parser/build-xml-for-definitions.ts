import xml from 'xml';
import { snakeCase } from 'snake-case';
import { Definition } from './types';

export function buildXmlForDefinitions(definitions: Definition[]): string {
  return xml(
    {
      'd:dictionary': [
        {
          _attr: {
            xmlns: 'http://www.w3.org/1999/xhtml',
            'xmlns:d': 'http://www.apple.com/DTDs/DictionaryService-1.0.rng',
          },
        },
        ...definitions.map((definition, index) => ({
          'd:entry': [
            {
              _attr: {
                id: snakeCase(
                  `${definition.term} ${definition.pageName} ${index}`,
                ),
                'd:title': definition.term,
                'd:parental-control': 1,
              },
            },
            {
              'd:index': [{ _attr: { 'd:value': definition.term } }],
            },
            {
              'd:index': [{ _attr: { 'd:value': definition.pageName } }],
            },
            { b: definition.term },
            { div: [{ _attr: { class: 'd-page' } }, definition.pageName] },
            {
              p: definition.explanation,
            },
          ],
        })),
      ],
    },
    { declaration: { encoding: 'UTF-8' }, indent: '\t' },
  );
}
