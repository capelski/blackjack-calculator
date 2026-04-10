import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'

type DecisionRootPageLayoutProps = {
  pageClassName: string
  navClassName: string
  tabClassName: string
  contentClassName: string
  navLabel: string
  title: string
  intro: string
  controls?: ReactNode
  children: ReactNode
}

function DecisionRootPageLayout({
  pageClassName,
  navClassName,
  tabClassName,
  contentClassName,
  navLabel,
  title,
  intro,
  controls,
  children,
}: DecisionRootPageLayoutProps) {
  return (
    <div className={`combination-page ${pageClassName}`}>
      <header className="combination-header">
        <p className="eyebrow">Blackjack Analyzer</p>
        <h1>{title}</h1>
        <p className="intro">{intro}</p>
      </header>

      {controls}

      <nav className={navClassName} aria-label={navLabel}>
        <NavLink
          to="combinations-tree"
          className={({ isActive }) => (isActive ? `${tabClassName} active` : tabClassName)}
        >
          Combinations tree
        </NavLink>
        <NavLink
          to="final-scores"
          className={({ isActive }) => (isActive ? `${tabClassName} active` : tabClassName)}
        >
          Final scores
        </NavLink>
        <NavLink
          to="expected-results"
          className={({ isActive }) => (isActive ? `${tabClassName} active` : tabClassName)}
        >
          Expected results
        </NavLink>
        <NavLink
          to="optimal-actions"
          className={({ isActive }) => (isActive ? `${tabClassName} active` : tabClassName)}
        >
          Optimal actions
        </NavLink>
      </nav>

      <section className={contentClassName}>{children}</section>
    </div>
  )
}

export default DecisionRootPageLayout
