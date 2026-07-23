import { describe, expect, it } from 'vitest'

import { ReportPdfBuilder } from '@/features/reports/infrastructure/pdf-builder'

describe('ReportPdfBuilder', () => {
  it('genera un PDF válido con título, secciones y saltos de página automáticos', async () => {
    const pdf = await ReportPdfBuilder.create()
    pdf.title('Informe de prueba')
    pdf.subtitle('Persona de ejemplo')
    pdf.keyValue('Fecha de alta', '01/01/2024')
    pdf.heading('Sección')
    for (let i = 0; i < 80; i++) {
      pdf.line(`Línea de contenido número ${i} con texto suficientemente largo para forzar el ajuste de línea.`)
    }

    const bytes = await pdf.toBytes()
    expect(bytes.length).toBeGreaterThan(0)
    // Cabecera estándar de un archivo PDF válido.
    expect(Buffer.from(bytes.slice(0, 5)).toString('utf-8')).toBe('%PDF-')
  })
})
