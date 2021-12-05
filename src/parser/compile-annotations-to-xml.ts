import xml from 'xml';
import { snakeCase } from 'snake-case';
import { Annotation } from './types';

export function compileAnnotationsToXML(annotations: Annotation[]): string {
  return xml(
    {
      'd:dictionary': [
        {
          _attr: {
            xmlns: 'http://www.w3.org/1999/xhtml',
            'xmlns:d': 'http://www.apple.com/DTDs/DictionaryService-1.0.rng',
          },
        },
        ...annotations.map((annotation, index) => ({
          'd:entry': [
            {
              _attr: {
                id: snakeCase(
                  `${annotation.title} ${annotation.pageName} ${index}`,
                ),
                'd:title': annotation.title,
                'd:parental-control': 1,
              },
            },
            {
              'd:index': [{ _attr: { 'd:value': annotation.title } }],
            },
            {
              'd:index': [{ _attr: { 'd:value': annotation.pageName } }],
            },
            { b: annotation.title },
            { div: [{ _attr: { class: 'd-page' } }, annotation.pageName] },
            {
              p: annotation.content,
            },
          ],
        })),
      ],
    },
    { declaration: { encoding: 'UTF-8' }, indent: '\t' },
  );
}
