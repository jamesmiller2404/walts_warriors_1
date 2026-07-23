import React from 'react'

type LexicalNode = {
  type?: string
  tag?: string
  text?: string
  format?: number
  children?: LexicalNode[]
  listType?: string
  [key: string]: unknown
}

type LexicalRoot = {
  root?: {
    children?: LexicalNode[]
  }
}

const IS_BOLD = 1
const IS_ITALIC = 2
const IS_UNDERLINE = 8

function renderText(node: LexicalNode, key: string | number): React.ReactNode {
  let content: React.ReactNode = node.text ?? ''
  const format = node.format ?? 0

  if (format & IS_BOLD) content = <strong key={`${key}-b`}>{content}</strong>
  if (format & IS_ITALIC) content = <em key={`${key}-i`}>{content}</em>
  if (format & IS_UNDERLINE) content = <u key={`${key}-u`}>{content}</u>

  return <React.Fragment key={key}>{content}</React.Fragment>
}

function renderNodes(nodes: LexicalNode[] = [], keyPrefix = 'n'): React.ReactNode[] {
  return nodes.map((node, index) => {
    const key = `${keyPrefix}-${index}`

    switch (node.type) {
      case 'text':
        return renderText(node, key)
      case 'paragraph':
        return (
          <p key={key} className="mb-4 last:mb-0">
            {renderNodes(node.children, key)}
          </p>
        )
      case 'heading': {
        const tag = (node.tag || 'h2') as keyof React.JSX.IntrinsicElements
        const className =
          tag === 'h1'
            ? 'mb-4 text-3xl font-bold'
            : tag === 'h2'
              ? 'mb-3 text-2xl font-semibold'
              : 'mb-2 text-xl font-semibold'
        return React.createElement(tag, { key, className }, renderNodes(node.children, key))
      }
      case 'list': {
        const ListTag = node.listType === 'number' ? 'ol' : 'ul'
        const listClass =
          node.listType === 'number' ? 'mb-4 list-decimal pl-6' : 'mb-4 list-disc pl-6'
        return (
          <ListTag key={key} className={listClass}>
            {renderNodes(node.children, key)}
          </ListTag>
        )
      }
      case 'listitem':
        return (
          <li key={key} className="mb-1">
            {renderNodes(node.children, key)}
          </li>
        )
      case 'link': {
        const url = (node.fields as { url?: string } | undefined)?.url || (node.url as string) || '#'
        return (
          <a
            key={key}
            href={url}
            className="font-medium text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
          >
            {renderNodes(node.children, key)}
          </a>
        )
      }
      case 'linebreak':
        return <br key={key} />
      default:
        if (node.children?.length) {
          return <React.Fragment key={key}>{renderNodes(node.children, key)}</React.Fragment>
        }
        return null
    }
  })
}

export function RichText({
  data,
  className,
}: {
  data: LexicalRoot | null | undefined
  className?: string
}) {
  if (!data?.root?.children?.length) return null
  return <div className={className}>{renderNodes(data.root.children)}</div>
}
