import { QuoteBlock } from '@/components/blocks/QuoteBlock'
import { TextBlock } from '@/components/blocks/TextBlock'

type ContentBlockItem = {
  id?: string | null
  blockType: string
  text?: string | null
  columnStart?: string | null
  columnSpan?: string | null
  rowStart?: string | null
  rowSpan?: string | null
  fontSize?: string | null
  fontColor?: string | null
  fontFamily?: string | null
  quote?: string | null
  attribution?: string | null
  quoteFontFamily?: string | null
  quoteFontSize?: string | null
  quoteFontColor?: string | null
  attributionFontFamily?: string | null
  attributionFontSize?: string | null
  attributionFontColor?: string | null
}

type Props = {
  blocks: ContentBlockItem[]
}

export function ContentBlocks({ blocks }: Props) {
  if (!blocks?.length) return null

  return (
    <div className="grid grid-cols-12 gap-6">
      {blocks.map((block) => {
        switch (block.blockType) {
          case 'textBlock':
            return (
              <div
                key={block.id}
                style={{
                  gridColumn: `${block.columnStart ?? '1'} / span ${block.columnSpan ?? '6'}`,
                  gridRow: block.rowStart && block.rowStart !== 'auto'
                    ? `${block.rowStart} / span ${block.rowSpan !== 'auto' ? (block.rowSpan ?? '1') : '1'}`
                    : undefined,
                }}
              >
                <TextBlock
                  text={block.text ?? ''}
                  fontSize={block.fontSize}
                  fontColor={block.fontColor}
                  fontFamily={block.fontFamily}
                />
              </div>
            )
          case 'quoteBlock':
            return (
              <div
                key={block.id}
                style={{
                  gridColumn: `${block.columnStart ?? '1'} / span ${block.columnSpan ?? '6'}`,
                  gridRow: block.rowStart && block.rowStart !== 'auto'
                    ? `${block.rowStart} / span ${block.rowSpan !== 'auto' ? (block.rowSpan ?? '1') : '1'}`
                    : undefined,
                }}
              >
                <QuoteBlock
                  quote={block.quote ?? ''}
                  attribution={block.attribution}
                  quoteFontSize={block.quoteFontSize}
                  quoteFontColor={block.quoteFontColor}
                  quoteFontFamily={block.quoteFontFamily}
                  attributionFontSize={block.attributionFontSize}
                  attributionFontColor={block.attributionFontColor}
                  attributionFontFamily={block.attributionFontFamily}
                />
              </div>
            )
          default:
            return null
        }
      })}
    </div>
  )
}
