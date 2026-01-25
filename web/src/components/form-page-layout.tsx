import type { ReactNode } from 'react'

type FormPageLayoutProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function FormPageLayout({
  title,
  subtitle,
  children,
}: FormPageLayoutProps) {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
        {subtitle ? (
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </main>
  )
}
