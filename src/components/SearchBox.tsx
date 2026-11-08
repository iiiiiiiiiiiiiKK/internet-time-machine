import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Search, X } from 'lucide-react'
import { normalizeInput } from '../lib/format'
import { useI18n } from '../lib/i18n'
import clsx from 'clsx'

interface Props {
  initialValue?: string
  size?: 'hero' | 'compact'
  autoFocus?: boolean
}

export default function SearchBox({ initialValue = '', size = 'hero', autoFocus = false }: Props) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [syncedInitial, setSyncedInitial] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)

  // React's sanctioned way to reset state from a prop: adjust during render
  // rather than round-tripping through an effect.
  if (syncedInitial !== initialValue) {
    setSyncedInitial(initialValue)
    setValue(initialValue)
  }

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = normalizeInput(value)
    if (!result.ok) {
      setError(t(`error.${result.reason}`))
      return
    }
    setError(null)
    setBusy(true)
    navigate(`/site/${encodeURIComponent(result.display)}`)
  }

  const onChange = (raw: string) => {
    setValue(raw)
    if (error) setError(null)
  }

  const hero = size === 'hero'

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div
        className={clsx(
          'group relative flex items-center gap-2 rounded-lg border bg-ink-900/80 backdrop-blur transition-colors',
          error ? 'border-ember/60' : 'border-white/12 hover:border-white/25 focus-within:border-signal/70',
          hero ? 'h-14 px-3 sm:h-16 sm:px-4' : 'h-12 px-3',
        )}
      >
        <Search
          className={clsx('shrink-0 text-paper-500 transition-colors group-focus-within:text-signal', hero ? 'h-5 w-5' : 'h-4 w-4')}
          aria-hidden="true"
        />
        <label htmlFor="itm-url" className="sr-only">
          {t('search.placeholder')}
        </label>
        <input
          id="itm-url"
          ref={inputRef}
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('search.placeholder')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'itm-url-error' : undefined}
          className={clsx(
            'min-w-0 flex-1 bg-transparent text-paper-100 outline-none placeholder:text-paper-600',
            hero ? 'text-base sm:text-lg' : 'text-sm',
          )}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue('')
              setError(null)
              inputRef.current?.focus()
            }}
            aria-label={t('search.clear')}
            className="grid h-7 w-7 shrink-0 place-items-center rounded text-paper-500 transition-colors hover:text-paper-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className={clsx(
            'flex shrink-0 items-center gap-1.5 rounded bg-signal font-mono font-semibold uppercase tracking-[0.1em] text-ink-950 transition-all hover:bg-signal/90 disabled:opacity-70',
            hero ? 'h-10 px-3 text-[12px] sm:h-11 sm:px-5 sm:text-[13px]' : 'h-8 px-3 text-[11px]',
          )}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          <span className="hidden sm:inline">{busy ? t('search.searching') : t('search.button')}</span>
        </button>
      </div>

      {error ? (
        <p id="itm-url-error" role="alert" className="mt-2 font-mono text-[11px] text-ember">
          {error}
        </p>
      ) : (
        <p className="mt-2 font-mono text-[11px] text-paper-600">{t('search.hint')}</p>
      )}
    </form>
  )
}