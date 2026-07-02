import { CodeBlock } from '@/components/code-block'
import { ApiKeysPanel } from '@/components/dashboard/api-keys-panel'
import { getApiKeys } from '@/lib/api-keys'
import { KeyRound } from 'lucide-react'

export const metadata = {
    title: 'API keys'
}

export default async function ApiKeysPage() {
    const keys = await getApiKeys()

    return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ApiKeysPanel initialKeys={keys} />
        <aside className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2">
                    <KeyRound className="size-4" />
                    <h2 className="font-semibold">Create a link</h2>
                </div>
                <pre className="mt-4 overflow-x-auto rounded-md bg-muted p-4 text-xs leading-6">
                    <CodeBlock lang="ts" key="create-link">{`const response = await fetch("https://execv.xyz/api/links", {
  method: "POST",
  headers: {
    authorization: \`Bearer \${process.env.EXECV_API_KEY}\`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    destination: "https://example.com/docs",
    slug: "docs"
  })
});

const link = await response.json();`}</CodeBlock>
                </pre>
            </aside>
        </div>
}
