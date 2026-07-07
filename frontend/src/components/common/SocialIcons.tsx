/**
 * Social Icons Component
 * 
 * Reusable social media icons using SVG.
 * 
 * @module SocialIcons
 */

import type { ReactNode } from "react"

interface SocialIconProps {
  className?: string
  href: string
  label: string
  color?: string
  children?: ReactNode
}

// Facebook SVG Icon
const FacebookSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

// Twitter/X SVG Icon
const TwitterSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
)

// Instagram SVG Icon
const InstagramSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

// LinkedIn SVG Icon
const LinkedinSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

// WhatsApp SVG Icon
const WhatsAppSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
)

// YouTube SVG Icon
const YoutubeSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
)

// TikTok SVG Icon
const TiktokSVG = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
)

// Social Icon Component
export function SocialIcon({ href, label, color, className = "h-5 w-5", children }: SocialIconProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`p-2 bg-muted/30 rounded-lg hover:bg-opacity-20 transition-colors group ${color}`}
      aria-label={label}
    >
      {children}
    </a>
  )
}

// Individual Social Components for easy use
export function FacebookIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-blue-100 transition-colors group"
      aria-label="Facebook"
    >
      <FacebookSVG className="h-5 w-5 text-muted-foreground group-hover:text-blue-600" />
    </a>
  )
}

export function TwitterIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-sky-100 transition-colors group"
      aria-label="Twitter"
    >
      <TwitterSVG className="h-5 w-5 text-muted-foreground group-hover:text-sky-500" />
    </a>
  )
}

export function InstagramIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-pink-100 transition-colors group"
      aria-label="Instagram"
    >
      <InstagramSVG className="h-5 w-5 text-muted-foreground group-hover:text-pink-600" />
    </a>
  )
}

export function LinkedinIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-blue-100 transition-colors group"
      aria-label="LinkedIn"
    >
      <LinkedinSVG className="h-5 w-5 text-muted-foreground group-hover:text-blue-700" />
    </a>
  )
}

export function WhatsAppIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-green-100 transition-colors group"
      aria-label="WhatsApp"
    >
      <WhatsAppSVG className="h-5 w-5 text-muted-foreground group-hover:text-green-600" />
    </a>
  )
}

export function YoutubeIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-red-100 transition-colors group"
      aria-label="YouTube"
    >
      <YoutubeSVG className="h-5 w-5 text-muted-foreground group-hover:text-red-600" />
    </a>
  )
}

export function TiktokIcon({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 bg-muted/30 rounded-lg hover:bg-muted transition-colors group"
      aria-label="TikTok"
    >
      <TiktokSVG className="h-5 w-5 text-muted-foreground group-hover:text-black" />
    </a>
  )
}