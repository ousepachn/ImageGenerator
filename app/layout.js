import { Roboto } from 'next/font/google'
import './globals.css'

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'AI Image Generator',
  description: 'Generate images using AI with Flux',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  )
} 