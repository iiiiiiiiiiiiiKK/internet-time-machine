import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'

export default function NotFoundPage() {
  const { t, lang } = useI18n()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-signal/70">ERROR 404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-paper-50 sm:text-4xl">{t('notFound.title')}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-paper-400">{t('notFound.body')}</p>
      <Link
        to="/"
        className="mt-7 inline-flex h-10 items-center rounded bg-signal px-4 font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-950 transition-colors hover:bg-signal/90"
      >
        {t('notFound.cta')}
      </Link>
      <p className="mt-8 font-mono text-[10px] text-paper-700">
        {lang === 'zh' ? '互联网从未真正遗忘，只是这一页不在档案里。' : 'The internet never forgets — this page just is not in the archive.'}
      </p>
    </div>
  )
}