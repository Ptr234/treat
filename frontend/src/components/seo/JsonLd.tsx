import type { ReactElement } from 'react';

/** Renders schema.org structured data. `<` is escaped so the payload cannot close the script tag. */
export function JsonLd({ data }: { data: object | object[] }): ReactElement {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
