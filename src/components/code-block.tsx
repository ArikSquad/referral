import { BundledLanguage, codeToHtml } from "shiki"

interface Props {
    children: string
    lang: BundledLanguage
}

export async function CodeBlock(props: Props) {
    "use cache"
    
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