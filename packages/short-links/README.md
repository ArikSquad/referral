# @execv/short-links

Typed utilities and client helpers for publishing and editing execv shortened URLs.

```ts
import { createShortLinksClient } from '@execv/short-links'

const links = createShortLinksClient({
    apiKey: process.env.EXECV_API_KEY!
})

const link = await links.create({
    destination: 'https://example.com/docs',
    slug: 'docs'
})

await links.update(link.id, {
    destination: 'https://example.com/new-docs'
})
```

Publish with:

```sh
bun run build
npm publish --access public
```
