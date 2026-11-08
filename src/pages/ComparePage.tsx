import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeftRight, ExternalLink, Loader2, Play } from 'lucide-react'
import { EmptyState, Panel, SectionHeading } from '../components/ui'
import { useI18n } from '../lib/i18n'
import { formatDateHuman, normalizeInput } from '../lib/format'
import { fetchClosest, rawSnapshotUrl, snapshotUrl } from '../lib/wayback'
import clsx from 'clsx'

interface Pane {
  year: number
  month: string
  ts: string | null
  status: 'idle' | 'loading' | 'ready' | 'missing' | 'error'
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

export default function ComparePage() {
  const { t, lang } = useI18n()
  const [params, setParams] = useSearchParams()

  const initialUrl = params.get('url') ?? ''
  const [rawUrl, setRawUrl] = useState(initialUrl)
  const [leftYear, setLeftYear] = useState(Number(params.get('left') ?? '') || 2005)
  const [rightYear, setRightYear] = useState(Number(params.get('right') ?? '') || 2025)
  const [leftMonth, setLeftMonth] = useState(params.get('lm') ?? '')
  const [rightMonth, setRightMonth] = useState(params.get('rm') ?? '')

  const [panes, setPanes] = useState<{ left: Pane; right: Pane }>({
    left: { year: 0, month: '', ts: null, status: 'idle' },
    right: { year: 0, month: '', ts: null, status: 'idle' },
  })
  const [error, setError] = useState<string | null>(null)

  const target = useMemo(() => normalizeInput(rawUrl), [rawUrl])
  const domain = target.ok ? target.display : null

  const resolvePane = useCallback(
    async (side: 'left' | 'right', year: number, month: string, origin: string) => {
      const stamp = `${year}${month || '01'}01`
      setPanes((prev) => ({
        ...prev,
        [side]: { year, month, ts: null, status: 'loading' },
      }))
      try {
        const ts = await fetchClosest(origin, `${stamp}120000`.slice(0, 14))
        setPanes((prev) => ({
          ...prev,
          [side]: { year, month, ts, status: ts ? 'ready' : 'missing' },
        }))
      } catch {
        setPanes((prev) => ({ ...prev, [side]: { year, month, ts: null, status: 'error' } }))
      }
    },
    [],
  )

  const run = useCallback(() => {
    if (!target.ok) {
      setError(t(`error.${target.reason}`))
      return
    }
    if (!leftYear || !rightYear) {
      setError(t('compare.pickYear'))
      return
    }
    if (leftYear === rightYear && leftMonth === rightMonth) {
      setError(t('compare.sameYear'))
      return
    }
    setError(null)

    const next = new URLSearchParams()
    next.set('url', target.display)
    next.set('left', String(leftYear))
    next.set('right', String(rightYear))
    if (leftMonth) next.set('lm', leftMonth)
    if (rightMonth) next.set('rm', rightMonth)
    setParams(next, { replace: true })

    void resolvePane('left', leftYear, leftMonth, target.url)
    void resolvePane('right', rightYear, rightMonth, target.url)
  }, [target, leftYear, rightYear, leftMonth, rightMonth, resolvePane, setParams, t])

  // Auto-run once if the page was opened with a domain already provided.
  useEffect(() => {
    if (initialUrl && target.ok) {
      void resolvePane('left', leftYear, leftMonth, target.url)
      void resolvePane('right', rightYear, rightMonth, target.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    document.title = `${t('compare.title')} · Internet Time Machine`
  }, [t])

  const years = useMemo(() => {
    const now = new Date().getUTCFullYear()
    const out: number[] = []
    for (let y = now; y >= 1996; y -= 1) out.push(y)
    return out
  }, [])

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <SectionHeading kicker="SIDE BY SIDE" title={t('compare.title')} lead={t('compare.lead')} />

      {/* Controls */}
      <Panel className="mt-6 p-4">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Label>{t('compare.domain')}</Label>
            <input
              type="text"
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={rawUrl}
              onChange={(e) => setRawUrl(e.target.value)}
              placeholder="google.com"
              className="mt-1 h-10 w-full rounded border border-white/12 bg-ink-950/80 px-3 font-mono text-sm text-paper-100 outline-none placeholder:text-paper-600 focus:border-signal/60"
            />
          </div>

          <div className="lg:col-span-3">
            <Label>{t('compare.left')}</Label>
            <div className="mt-1 flex gap-1.5">
              <YearSelect value={leftYear} onChange={setLeftYear} years={years} />
              <MonthSelect value={leftMonth} onChange={setLeftMonth} anyLabel={t('compare.any')} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <Label>{t('compare.right')}</Label>
            <div className="mt-1 flex gap-1.5">
              <YearSelect value={rightYear} onChange={setRightYear} years={years} />
              <MonthSelect value={rightMonth} onChange={setRightMonth} anyLabel={t('compare.any')} />
            </div>
          </div>

          <div className="flex items-end lg:col-span-2">
            <button
              type="button"
              onClick={run}
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded bg-signal px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-signal/90"
            >
              <Play className="h-3.5 w-3.5" />
              {t('compare.run')}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-3 flex items-center gap-1.5 font-mono text-[11px] text-ember">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        <p className="mt-3 font-mono text-[10px] leading-relaxed text-paper-600">{t('compare.externalHint')}</p>
      </Panel>

      {/* Panes */}
      {!target.ok && rawUrl.length > 0 ? (
        <div className="mt-6">
          <EmptyState title={t(`error.${target.reason}`)} />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          <ComparePane
            side="left"
            pane={panes.left}
            domain={domain ?? ''}
            originalUrl={target.ok ? target.url : ''}
            label={`${t('compare.left')} · ${panes.left.year || leftYear}`}
          />
          <ComparePane
            side="right"
            pane={panes.right}
            domain={domain ?? ''}
            originalUrl={target.ok ? target.url : ''}
            label={`${t('compare.right')} · ${panes.right.year || rightYear}`}
          />
        </div>
      )}

      {(panes.left.ts && panes.right.ts) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={snapshotUrl(panes.left.ts, target.ok ? target.url : '')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
          >
            {t('compare.left')} · {formatDateHuman(panes.left.ts, lang)}
            <ExternalLink className="h-3 w-3" />
          </a>
          <a
            href={snapshotUrl(panes.right.ts, target.ok ? target.url : '')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded border border-white/12 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 hover:border-signal/40 hover:text-signal"
          >
            {t('compare.right')} · {formatDateHuman(panes.right.ts, lang)}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="mt-8 rounded-lg border border-white/[0.08] bg-ink-900/40 p-4">
        <p className="flex items-start gap-2 font-mono text-[10px] leading-relaxed text-paper-600">
          <ArrowLeftRight className="mt-px h-3.5 w-3.5 shrink-0 text-signal/50" />
          {lang === 'zh'
            ? '两侧预览都直接加载 Internet Archive 的原始快照。若某个站点阻止内嵌，请使用上方的外部链接。我们不生成任何对比截图。'
            : 'Both previews load the original Internet Archive snapshots. If a site blocks embedding, use the external links above. We never generate comparison screenshots.'}
        </p>
      </div>
    </div>
  )
}

function ComparePane({
  pane,
  domain,
  originalUrl,
  label,
}: {
  side: 'left' | 'right'
  pane: Pane
  domain: string
  originalUrl: string
  label: string
}) {
  const { t, lang } = useI18n()
  const [blocked, setBlocked] = useState(false)
  const [nonce, setNonce] = useState(0)
  const [loadedTs, setLoadedTs] = useState(pane.ts)

  // Reset the embed whenever a new snapshot resolves. Doing it during render
  // avoids a state-syncing effect and keeps the iframe key stable.
  if (loadedTs !== pane.ts) {
    setLoadedTs(pane.ts)
    setBlocked(false)
    setNonce((n) => n + 1)
  }

  if (pane.status === 'idle') {
    return (
      <Panel className="flex min-h-[280px] flex-col items-center justify-center gap-2 p-6 text-center">
        <ArrowLeftRight className="h-6 w-6 text-paper-700" />
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-600">{label}</p>
        <p className="text-[12px] text-paper-600">
          {lang === 'zh' ? '选择一个年份后开始对比' : 'Pick a year, then compare'}
        </p>
      </Panel>
    )
  }

  if (pane.status === 'loading') {
    return (
      <Panel className="flex min-h-[280px] items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-signal" />
      </Panel>
    )
  }

  if (pane.status === 'missing' || pane.status === 'error') {
    return (
      <Panel className="flex min-h-[280px] flex-col items-center justify-center gap-2 p-6 text-center">
        <AlertTriangle className="h-6 w-6 text-ember" />
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-paper-600">{label}</p>
        <p className="text-[12px] text-paper-500">{t('compare.noSnapshot')}</p>
      </Panel>
    )
  }

  const ts = pane.ts as string
  const src = snapshotUrl(ts, originalUrl)
  const raw = rawSnapshotUrl(ts, originalUrl)

  return (
    <div className="overflow-hidden rounded-lg border border-white/12 bg-ink-900">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-ink-850 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-signal/80">{label}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-paper-500">{formatDateHuman(ts, lang)}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <a
            href={raw}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-7 w-7 place-items-center rounded text-paper-500 hover:text-signal"
            title={t('snapshot.raw')}
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={() => {
              setBlocked(false)
              setNonce((n) => n + 1)
            }}
            className="grid h-7 w-7 place-items-center rounded text-paper-500 hover:text-signal"
            title={t('snapshot.reload')}
          >
            <Loader2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="relative h-[46vh] min-h-[300px] bg-paper-50">
        {blocked ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 bg-ink-900 px-4 text-center">
            <AlertTriangle className="h-5 w-5 text-ember" />
            <p className="font-mono text-[11px] text-paper-200">{t('snapshot.embedFailedTitle')}</p>
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex h-8 items-center gap-1.5 rounded bg-signal px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-950"
            >
              {t('snapshot.embedFailedCta')}
            </a>
          </div>
        ) : (
          <iframe
            key={nonce}
            src={src}
            title={`${domain} ${ts}`}
            onError={() => setBlocked(true)}
            loading="lazy"
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
            className="h-full w-full border-0 bg-white"
          />
        )}
      </div>

      <div className="border-t border-white/10 px-3 py-2">
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-signal/80 hover:text-signal"
        >
          {t('snapshot.openArchive')}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-paper-600">{children}</span>
}

function YearSelect({
  value,
  onChange,
  years,
}: {
  value: number
  onChange: (y: number) => void
  years: number[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label="year"
      className={clsx(
        'h-10 flex-1 rounded border border-white/12 bg-ink-950/80 px-2 font-mono text-sm tabular-nums text-paper-100 outline-none focus:border-signal/60',
      )}
    >
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  )
}

function MonthSelect({
  value,
  onChange,
  anyLabel,
}: {
  value: string
  onChange: (m: string) => void
  anyLabel: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="month"
      className="h-10 w-20 rounded border border-white/12 bg-ink-950/80 px-2 font-mono text-sm tabular-nums text-paper-100 outline-none focus:border-signal/60"
    >
      <option value="">{anyLabel}</option>
      {MONTHS.map((m) => (
        <option key={m} value={m}>
          {m}
        </option>
      ))}
    </select>
  )
}