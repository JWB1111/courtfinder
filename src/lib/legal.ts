import { readFileSync } from 'fs'
import { join } from 'path'
import { marked } from 'marked'

export type LegalSlug = 'impressum' | 'datenschutz' | 'agb'

export const LEGAL_TITLES: Record<LegalSlug, string> = {
  impressum: 'Impressum',
  datenschutz: 'Datenschutzerklärung',
  agb: 'Allgemeine Geschäftsbedingungen',
}

/** Reads content/legal/<slug>.md and returns rendered HTML. Server-only. */
export function getLegalHtml(slug: LegalSlug): string {
  const filePath = join(process.cwd(), 'content', 'legal', `${slug}.md`)
  const markdown = readFileSync(filePath, 'utf-8')
  return marked.parse(markdown) as string
}
