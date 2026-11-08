import clsx from 'clsx'
import type { ReactNode } from 'react'

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx('rounded-lg border border-white/[0.08] bg-ink-900/70 backdrop-blur-sm', className)}>
      {children}
    </div>
  )
}

export function SectionHeading({
  kicker,
  title,
  lead,
  align = 'left',
  action,
}: {
  kicker?: string
  title: string
  lead?: string
  align?: 'left' | 'center'
  action?: ReactNode
}) {
  return (
    <div
      className={clsx(
        'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        align === 'center' && 'sm:flex-col sm:items-center sm:text-center',
      )}
    >
      <div className={clsx(align === 'center' && 'text-center')}>
        {kicker && (
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-signal/70 sm:text-[11px]">{kicker}</p>
        )}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-paper-50 sm:text-3xl">{title}</h2>
        {lead && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-paper-400">{lead}</p>}
      </div>
      {action}
    </div>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: ReactNode
  hint?: string
  tone?: 'default' | 'signal'
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-500">{label}</span>
      <span
        className={clsx(
          'font-mono text-lg tabular-nums sm:text-xl',
          tone === 'signal' ? 'text-signal' : 'text-paper-100',
        )}
      >
        {value}
      </span>
      {hint && <span className="font-mono text-[10px] text-paper-600">{hint}</span>}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode
  title: string
  body?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/12 bg-ink-900/40 px-6 py-12 text-center">
      {icon && <div className="text-paper-600">{icon}</div>}
      <h3 className="font-mono text-sm font-semibold text-paper-200">{title}</h3>
      {body && <p className="max-w-md text-[13px] leading-relaxed text-paper-500">{body}</p>}
      {action}
    </div>
  )
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 animate-pulse rounded border border-white/[0.06] bg-white/[0.03]"
          style={{ animationDelay: `${i * 90}ms` }}
        />
      ))}
    </div>
  )
}