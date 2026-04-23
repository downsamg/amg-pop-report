import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Audio Media Grading | AMG | Population Report',
  description: "Use AMG's Population Report to search grading census data for vinyl, cassettes, CDs, and 8-tracks by artist and album.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
