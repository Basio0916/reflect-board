import type { Metadata } from 'next'
import { Inter, PT_Serif, Roboto_Mono } from 'next/font/google'
import '../src/main.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const ptSerif = PT_Serif({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ReflectBoard',
  description: 'Project management and reflection board',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ptSerif.variable} ${robotoMono.variable}`}>
        {children}
      </body>
    </html>
  )
}
