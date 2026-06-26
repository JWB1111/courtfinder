import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

// Body font – Barlow (athletic, friendly sans)
const barlow = Barlow({
  variable: '--font-barlow',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

// Display font – Barlow Condensed (impact headlines for a sporty feel)
const barlowCondensed = Barlow_Condensed({
  variable: '--font-barlow-condensed',
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CourtFinder – Freie Plätze in Aachen',
  description: 'Finde kurzfristig freie Tennis- und Padelplätze sowie Gym-Tageskarten in Aachen.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="de"
      className={`${barlow.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink-50">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
