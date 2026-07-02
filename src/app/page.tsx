import {
    ArrowRight,
    BarChart3,
    KeyRound,
    Link2,
    TerminalSquare
} from 'lucide-react'
import Link from 'next/link'
import type { BundledLanguage } from 'shiki'
import { codeToHtml } from 'shiki'
import { AuthNavActions } from '@/components/auth/auth-actions'
import { Button } from '@/components/ui/button'
import { siteConfig } from '@/lib/site'

interface Props {
    children: string
    lang: BundledLanguage
}

async function CodeBlock(props: Props) {
    const out = await codeToHtml(props.children, {
        lang: props.lang,
        theme: 'material-theme-ocean',
        // disable background:
        transformers: [
            {
                name: 'remove-pre-background',
                pre(node) {
                    const style = String(node.properties.style ?? '')

                    node.properties.style = style
                        .split(';')
                        .filter(
                            (decl) =>
                                !decl.trim().startsWith('background-color:')
                        )
                        .join(';')
                }
            }
        ]
    })

    return <div dangerouslySetInnerHTML={{ __html: out }} />
}

const features = [
    {
        icon: Link2,
        title: 'Short links',
        body: 'Create clean redirects with custom slugs from the dashboard or HTTP API.'
    },
    {
        icon: KeyRound,
        title: 'API keys',
        body: 'Issue backend keys for your user or organization and keep link creation server-side.'
    },
    {
        icon: BarChart3,
        title: 'Click tracking',
        body: 'See simple click charts and recent link activity without building analytics plumbing.'
    }
]

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-md bg-foreground text-background">
                            <TerminalSquare className="size-4" />
                        </span>
                        <span className="font-semibold tracking-tight">
                            {siteConfig.name}
                        </span>
                    </Link>
                    <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
                        <a href="#api" className="hover:text-foreground">
                            API
                        </a>
                        <a href="#features" className="hover:text-foreground">
                            Features
                        </a>
                    </nav>
                    <AuthNavActions />
                </div>
            </header>

            <main>
                <section className="border-b">
                    <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
                        <div>
                            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
                                {siteConfig.name}
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                                URL shortening for developers. Create links from
                                your backend, redirect fast, and track clicks in
                                one small dashboard.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/app">Open dashboard</Link>
                                </Button>
                            </div>
                        </div>

                        <div
                            id="api"
                            className="rounded-lg border bg-card p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-2 border-b pb-3">
                                <span className="size-3 rounded-full bg-red-500" />
                                <span className="size-3 rounded-full bg-amber-500" />
                                <span className="size-3 rounded-full bg-emerald-500" />
                                <span className="ml-3 font-mono text-xs text-muted-foreground">
                                    create-link.ts
                                </span>
                            </div>
                            <pre className="overflow-x-auto pt-4 font-mono text-sm leading-7">
                                <CodeBlock lang="ts">{`const link = await fetch("https://execv.xyz/api/links", {
  method: "POST",
  headers: {
    authorization: \`Bearer \${process.env.EXECV_API_KEY}\`,
    "content-type": "application/json"
  },
  body: JSON.stringify({
    destination: "https://example.com/docs",
    slug: "docs"
  })
}).then((res) => res.json());

console.log(link.url);`}</CodeBlock>
                            </pre>
                        </div>
                    </div>
                </section>

                <section
                    id="features"
                    className="mx-auto max-w-6xl px-4 py-16 sm:px-6"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon
                            return (
                                <article
                                    key={feature.title}
                                    className="rounded-lg border bg-card p-5"
                                >
                                    <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                                        <Icon className="size-5" />
                                    </div>
                                    <h2 className="mt-5 text-lg font-semibold">
                                        {feature.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                                        {feature.body}
                                    </p>
                                </article>
                            )
                        })}
                    </div>
                </section>
            </main>

            <footer className="border-t">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p>{siteConfig.name} by MikArt Europe</p>
                    <div className="flex gap-4">
                        <Link href="/app" className="hover:text-foreground">
                            Dashboard
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
