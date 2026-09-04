interface SiteFooterProps {
  lastUpdated: string
}

export function SiteFooter({ lastUpdated }: SiteFooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-border/40 pt-8 text-center">
      <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
        Last updated: {lastUpdated}
      </p>
      <p className="mt-2 text-[11px] tracking-[0.12em] text-muted-foreground/60">
        Mani © {year} — Don&apos;t steal my work. I&apos;ll find you.
      </p>
    </footer>
  )
}
