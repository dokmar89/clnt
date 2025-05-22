export default function AdminApprovalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
} 