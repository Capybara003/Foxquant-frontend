import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import NotificationsBell from "@/components/ui/NotificationsBell";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FoxQuant - Trading Platform',
  description: 'Professional trading platform for quantitative analysis',
  icons: '/icon.svg'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="fixed top-4 right-4 z-50">
          <NotificationsBell />
        </div>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
} 