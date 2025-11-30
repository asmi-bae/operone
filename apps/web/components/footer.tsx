import Link from "next/link"
import Image from "next/image"
import { Github, Twitter, Mail, Heart } from "lucide-react"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Brand Section */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <Image 
                src="/icons/operone-logo.svg" 
                alt="OPERONE" 
                width={64} 
                height={64} 
                className="h-12 w-12"
              />
              <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">OPERONE</h3>
                <p className="text-sm text-muted-foreground font-medium">The Ultimate Development Platform</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm mb-4 max-w-md leading-relaxed">
              Build faster with our pre-configured monorepo. Modern stack for rapid development with enterprise-grade security and performance.
            </p>
            <div className="flex space-x-4">
              <Link 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank" 
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link 
                href="mailto:contact@operone.dev" 
                className="text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Links Section */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground text-sm mb-3">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t mt-6 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-muted-foreground text-xs">
              © {new Date().getFullYear()} Operone. All rights reserved.
            </div>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-current" />
              <span>by Operone team</span>
            </div>
            <div className="flex space-x-4 text-xs">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
