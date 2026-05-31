import { Blocks } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="flex flex-col items-center justify-between gap-2 px-6 py-4 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Blocks className="size-4" />
          <span>&copy; {new Date().getFullYear()} SUKIT. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/docs" className="hover:text-foreground transition-colors">
            Docs
          </a>
          <a href="/about" className="hover:text-foreground transition-colors">
            About
          </a>
          <a href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  )
}
