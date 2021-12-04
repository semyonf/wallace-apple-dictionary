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
                  `${definition.key} ${definition.pageName} ${index}`,
                ),
                'd:title': definition.key,
                'd:parental-control': 1,
              },
            },
            {
              'd:index': [{ _attr: { 'd:value': definition.key } }],
            },
            {
              'd:index': [{ _attr: { 'd:value': definition.pageName } }],
            },
            { b: definition.key },
            { div: [{ _attr: { class: 'd-page' } }, definition.pageName] },
            {
              p: definition.value,
            },
          ],
        })),
      ],
    },
    { declaration: { encoding: 'UTF-8' }, indent: '\t' },
  );
}
