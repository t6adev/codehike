import React from "react"
import { CodeAnnotation } from "@code-hike/smooth-code"
import { CodeLink } from "./links"
import { Code, relativeToAbsolute } from "@code-hike/utils"

function Box({
  children,
  data,
  theme,
}: {
  data: {
    url: string
    title: string | undefined
  }
  children: React.ReactNode
  theme: any
}) {
  const border =
    data ||
    theme.tokenColors.find((tc: any) =>
      tc.scope?.includes("string")
    )?.settings?.foreground ||
    "yellow"
  return (
    <span style={{ outline: `2px solid ${border}` }}>
      {children}
    </span>
  )
}

function Background({
  children,
  data,
  style,
  theme,
}: {
  data: string
  children: React.ReactNode
  style?: React.CSSProperties
  theme?: any
}) {
  const bg =
    data ||
    (((theme as any).colors[
      "editor.lineHighlightBackground"
    ] ||
      (theme as any).colors[
        "editor.selectionHighlightBackground"
      ]) as string)
  return (
    <div
      style={{
        ...style,
        background: bg,
        // cursor: "pointer",
      }}
      // onClick={_ => alert("clicked")}
    >
      {children}
    </div>
  )
}

function Label({
  children,
  data,
  style,
  theme,
}: {
  data: string
  children: React.ReactNode
  style?: React.CSSProperties
  theme?: any
}) {
  const bg = ((theme as any).colors[
    "editor.lineHighlightBackground"
  ] ||
    (theme as any).colors[
      "editor.selectionHighlightBackground"
    ]) as string
  const [hover, setHover] = React.useState(false)

  return (
    <div
      style={{
        ...style,
        background: hover ? bg : undefined,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      <div
        style={{
          position: "absolute",
          right: 0,
          paddingRight: 16,
          display: hover ? "block" : "none",
          opacity: 0.7,
        }}
      >
        {data}
      </div>
    </div>
  )
}

export const annotationsMap: Record<
  string,
  CodeAnnotation["Component"]
> = {
  box: Box,
  bg: Background,
  label: Label,
  link: CodeLink,
}

export function getAnnotationsFromMetastring(
  options: Record<string, string>
) {
  const annotations = [] as CodeAnnotation[]
  Object.keys(options).forEach(key => {
    const Component = annotationsMap[key]
    if (Component) {
      annotations?.push({ focus: options[key], Component })
    }
  })
  return annotations
}

export function getAnnotationsFromCode(code: Code) {
  const { lines } = code
  let lineNumber = 1
  const annotations = [] as CodeAnnotation[]
  const focusList = [] as string[]
  while (lineNumber <= lines.length) {
    const line = lines[lineNumber - 1]
    const { key, focus, data } = getCommentData(
      line,
      lineNumber
    )

    const Component = annotationsMap[key!]

    if (Component) {
      lines.splice(lineNumber - 1, 1)
      annotations.push({ Component, focus: focus!, data })
    } else if (key === "focus") {
      lines.splice(lineNumber - 1, 1)
      focusList.push(focus!)
    } else {
      lineNumber++
    }
  }
  return [annotations, focusList.join(",")] as const
}

function getCommentData(
  line: Code["lines"][0],
  lineNumber: number
) {
  const comment = line.tokens.find(t =>
    t.content.startsWith("//")
  )?.content

  if (!comment) {
    return {}
  }

  const commentRegex = /\/\/\s+(\w+)(\S*)\s*(.*)/
  const [, key, focusString, data] = commentRegex.exec(
    comment
  )

  return {
    key,
    focus: relativeToAbsolute(focusString, lineNumber),
    data,
  }
}
