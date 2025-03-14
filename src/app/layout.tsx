import '@/app/globals.css'
import Navigation from "@/components/Navigation"
import { Providers } from './providers'

export const metadata = {
  title: 'Feature Voting System',
  description: 'Vote on feature requests',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
