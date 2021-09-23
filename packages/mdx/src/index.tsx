import React from "react"
import visit from "unist-util-visit"
import { Node } from "unist"
import { CodeSpring } from "@code-hike/smooth-code"
import { EditorSpring } from "@code-hike/mini-editor"
import { highlight } from "@code-hike/highlighter"

export function Code({
  code,
  meta,
  theme,
}: {
  code: string
  meta: string
  theme: string
}) {
  const { name, focus } = parseMetastring(meta)
  return name ? (
    <EditorSpring
      northPanel={{
        tabs: [name],
        active: name,
        heightRatio: 1,
      }}
      files={[
        {
          name,
          code: JSON.parse(code),
          focus,
          annotations: [],
        },
      ]}
      codeConfig={{
        theme: JSON.parse(theme),
        // TODO calculate line height (in CodeSpring) depending on focused lines
        // htmlProps: { style: { height: "18em" } },
      }}
    />
  ) : (
    <CodeSpring
      config={{
        theme: JSON.parse(theme),
        // TODO calculate line height (in CodeSpring) depending on focused lines
        // htmlProps: { style: { height: "16em" } },
      }}
      step={{
        code: JSON.parse(code),
        focus,
        annotations: [],
      }}
    />
  )
}

export function remarkCodeHike({ theme }: { theme: any }) {
  return async function transformer(tree: Node) {
    console.log(tree)
    let useCodeComponent = false
    visit(tree, "mdxjsEsm", node => {
      if (
        // TODO too fragile:
        node.value ===
        `import { Code } from "@code-hike/mdx"`
      ) {
        useCodeComponent = true
      }
    })

    if (!useCodeComponent) {
      return
    }

    const codeNodes = [] as Node[]
    visit(tree, "code", node => {
      codeNodes.push(node)
    })

    await Promise.all(
      codeNodes.map(async node => {
        // console.log("code", node);
        const code = await highlight({
          code: node.value as string,
          lang: node.lang as string,
          theme,
        })
        node.type = "mdxJsxFlowElement"
        node.name = "Code"
        node.attributes = [
          {
            type: "mdxJsxAttribute",
            name: "code",
            value: JSON.stringify(code),
          },
          {
            type: "mdxJsxAttribute",
            name: "meta",
            value:
              typeof node.meta === "string"
                ? node.meta
                : "",
          },
          {
            type: "mdxJsxAttribute",
            name: "theme",
            value: JSON.stringify(theme),
          },
        ]
        node.children = []
      })
    )
  }
}

type FileOptions = {
  focus?: string
  active?: string
  hidden?: boolean
}
function parseMetastring(
  metastring: string
): { name: string | null } & FileOptions {
  const params = metastring.split(" ")
  const options = {} as FileOptions
  let name: string | null = null
  params.forEach(param => {
    const [key, value] = param.split("=")
    if (value != null) {
      ;(options as any)[key] = value
    } else if (name === null) {
      name = key
    } else {
      ;(options as any)[key] = true
    }
  })
  return { name, ...options }
}
