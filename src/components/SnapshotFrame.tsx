import { useMemo, useState } from 'react'
import { AlertTriangle, ExternalLink, Loader2, RotateCw } from 'lucide-react'
import { useI18n } from '../lib/i18n'
import { formatDateHuman } from '../lib/format'
import { rawSnapshotUrl, snapshotUrl } from '../lib/wayback'
import clsx from 'clsx'

interface Props {
  domain: string
  timestamp: string
  originalUrl: string
  heightClass?: string
}

/**
 * Embeds a real Wayback Machine snapshot in a retro browser chassis.
 *
 * Constraint we do NOT hide: some archived sites send `X-Frame-Options` or a
 * `frame-ancestors` CSP directive, so no client-side trick can embed them. When
 * that happens we detect it and offer the external open path instead of
 * pretending the snapshot is broken.
 */
export default function SnapshotFrame({
  domain,
  timestamp,
  originalUrl,
  heightClass = 'h-[62vh] min-h-[380px] sm:h-[68vh]',
}: Props) {
  const { t, lang } = useI18n()
  const [status, setStatus] = useState<'loading' | 'ready' | 'blocked'>('loading')
  const [nonce, setNonce] = useState(0)

  const src = useMemo(() => snapshotUrl(timestamp, originalUrl), [timestamp, originalUrl])
  const raw = useMemo(() => rawSnapshotUrl(timestamp, originalUrl), [timestamp, originalUrl])
  const host = useMemo(() => {
    try {
      return new URL(originalUrl).host
    } catch {
      return domain
    }
  }, [originalUrl, domain])

  const reload = () => {
    setStatus('loading')
    setNonce((n) => n + 1)
  }

  return (
    <div className="overflow-hidden rounded-lg border border-white/12 bg-ink-900 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-white/10 bg-ink-850 px-2.5 py-2 sm:px-3">
        <div className="flex shrink-0 gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-ember/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-signal/60" />
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded border border-white/10 bg-ink-950/80 px-2 py-1">
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-wider text-paper-600">WAYBACK</span>
          <span className="min-w-0 flex-1 truncate font-mono text-[10px] text-paper-400 sm:text-[11px]">
            {timestamp.slice(0, 4)}/{timestamp.slice(4, 6)}/{timestamp.slice(6, 8)} · {host}
          </span>
        </div>

        <button
          type="button"
          onClick={reload}
          title={t('snapshot.reload')}
          aria-label={t('snapshot.reload')}
          className="grid h-7 w-7 shrink-0 place-items-center rounded text-paper-500 transition-colors hover:text-signal"
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          title={t('snapshot.openArchive')}
          aria-label={t('snapshot.openArchive')}
          className="grid h-7 w-7 shrink-0 place-items-center rounded text-paper-500 transition-colors hover:text-signal"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Viewport */}
      <div className={clsx('relative bg-paper-50', heightClass)}>
        {status === 'blocked' ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 bg-ink-900 px-6 text-center">
            <AlertTriangle className="h-7 w-7 text-ember" aria-hidden="true" />
            <h3 className="font-mono text-sm font-semibold text-paper-100">{t('snapshot.embedFailedTitle')}</h3>
            <p className="max-w-md text-[13px] leading-relaxed text-paper-400">{t('snapshot.embedFailedBody')}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded bg-signal px-3 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-signal/90"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t('snapshot.embedFailedCta')}
              </a>
              <a
                href={raw}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-1.5 rounded border border-white/15 px-3 font-mono text-[11px] uppercase tracking-wider text-paper-300 transition-colors hover:border-signal/40 hover:text-signal"
              >
                {t('snapshot.raw')}
              </a>
            </div>
          </div>
        ) : (
          <>
            <iframe
              key={nonce}
              src={src}
              title={`${domain} · ${formatDateHuman(timestamp, lang)}`}
              onLoad={() => setStatus('ready')}
              onError={() => setStatus('blocked')}
              loading="lazy"
              referrerPolicy="no-referrer"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
              className="h-full w-full border-0 bg-white"
            />
            {status === 'loading' && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink-900">
                <Loader2 className="h-6 w-6 animate-spin text-signal" />
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-paper-500">
                  {t('loading.archive')}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fallback strip — always available, because iframes are unreliable by nature */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-ink-850 px-2.5 py-2">
        <p className="font-mono text-[10px] leading-relaxed text-paper-600">{t('snapshot.notice')}</p>
        <div className="flex items-center gap-2">
          <a
            href={raw}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] uppercase tracking-wider text-paper-500 underline decoration-dotted underline-offset-2 transition-colors hover:text-signal"
          >
            {t('snapshot.raw')}
          </a>
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-signal/80 transition-colors hover:text-signal"
          >
            {t('snapshot.openArchive')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}