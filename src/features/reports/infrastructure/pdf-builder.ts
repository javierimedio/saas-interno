import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'pdf-lib'

const PAGE_WIDTH = 595.28 // A4 en puntos
const PAGE_HEIGHT = 841.89
const MARGIN = 50
const LINE_HEIGHT = 16

/**
 * Generador de PDF minimalista basado en texto (docs: "prefiero un informe extremadamente
 * útil que uno muy bonito"). Sin dependencias de navegador/Chromium: funciona en cualquier
 * runtime de Node, incluido Vercel serverless.
 */
export class ReportPdfBuilder {
  private doc!: PDFDocument
  private page!: PDFPage
  private font!: PDFFont
  private boldFont!: PDFFont
  private y = PAGE_HEIGHT - MARGIN

  static async create(): Promise<ReportPdfBuilder> {
    const builder = new ReportPdfBuilder()
    builder.doc = await PDFDocument.create()
    builder.font = await builder.doc.embedFont(StandardFonts.Helvetica)
    builder.boldFont = await builder.doc.embedFont(StandardFonts.HelveticaBold)
    builder.page = builder.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
    return builder
  }

  private ensureSpace(lines = 1) {
    if (this.y - lines * LINE_HEIGHT < MARGIN) {
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      this.y = PAGE_HEIGHT - MARGIN
    }
  }

  title(text: string) {
    this.ensureSpace(2)
    this.page.drawText(text, { x: MARGIN, y: this.y, size: 18, font: this.boldFont })
    this.y -= LINE_HEIGHT * 2
  }

  subtitle(text: string) {
    this.ensureSpace(1.5)
    this.page.drawText(text, { x: MARGIN, y: this.y, size: 11, font: this.font, color: rgb(0.4, 0.4, 0.4) })
    this.y -= LINE_HEIGHT * 1.5
  }

  heading(text: string) {
    this.ensureSpace(2)
    this.y -= LINE_HEIGHT * 0.5
    this.page.drawText(text, { x: MARGIN, y: this.y, size: 13, font: this.boldFont })
    this.y -= LINE_HEIGHT
    this.page.drawLine({
      start: { x: MARGIN, y: this.y + 4 },
      end: { x: PAGE_WIDTH - MARGIN, y: this.y + 4 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    })
    this.y -= LINE_HEIGHT * 0.5
  }

  line(text: string) {
    this.ensureSpace(1)
    const wrapped = wrapText(text, this.font, 10, PAGE_WIDTH - MARGIN * 2)
    for (const w of wrapped) {
      this.ensureSpace(1)
      this.page.drawText(w, { x: MARGIN, y: this.y, size: 10, font: this.font })
      this.y -= LINE_HEIGHT
    }
  }

  keyValue(key: string, value: string) {
    this.ensureSpace(1)
    this.page.drawText(key, { x: MARGIN, y: this.y, size: 10, font: this.boldFont })
    this.page.drawText(value, { x: MARGIN + 160, y: this.y, size: 10, font: this.font })
    this.y -= LINE_HEIGHT
  }

  emptyLine() {
    this.y -= LINE_HEIGHT * 0.5
  }

  async toBytes(): Promise<Uint8Array> {
    return this.doc.save()
  }
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}
