/**
 * SkipLink - Accessibility component for screen readers
 *
 * Allows keyboard users to skip directly to the main content,
 * bypassing repetitive navigation elements.
 *
 * Usage:
 * Place as the first element inside AppShell:
 * <SkipLink targetId="main-content" />
 *
 * And add the target id to your main content area:
 * <main id="main-content" tabIndex={-1}>
 */

interface SkipLinkProps {
  /** The id of the element to skip to (default: "main-content") */
  targetId?: string
  /** Custom label for the link (default: "Skip to main content") */
  label?: string
}

export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-white focus:text-stone-900 focus:rounded-md focus:shadow-lg focus:ring-2 focus:ring-lime-500 focus:outline-none dark:focus:bg-stone-800 dark:focus:text-white"
    >
      {label}
    </a>
  )
}
