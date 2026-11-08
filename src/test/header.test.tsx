import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from '../components/Header'
import { I18nProvider } from '../components/I18nProvider'
import Footer from '../components/Footer'
import { AUTHOR_X_URL } from '../lib/constants'

function renderWithProviders(ui: React.ReactNode, initialPath = '/') {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </I18nProvider>,
  )
}

describe('Header', () => {
  it('renders the author 𝕏 link with the exact required href', () => {
    renderWithProviders(<Header />)
    const links = screen.getAllByRole('link', { name: /0xkillcoin/i })
    expect(links.length).toBeGreaterThan(0)
    for (const link of links) {
      expect(link).toHaveAttribute('href', AUTHOR_X_URL)
      expect(link).toHaveAttribute('target', '_blank')
      // Reverse-tabnabbing hardening must be present on every external link.
      expect(link.getAttribute('rel')).toContain('noopener')
    }
  })

  it('exposes primary navigation routes that exist', () => {
    renderWithProviders(<Header />)
    const nav = screen.getByRole('navigation', { name: /main/i })
    const hrefs = within(nav)
      .getAllByRole('link')
      .map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/', '/explore', '/eras', '/compare', '/about'])
  })

  it('toggles the interface language', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Header />)
    // English is the default in jsdom (navigator.language === 'en-US').
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /切换到中文/i }))
    expect(screen.getByRole('link', { name: /互联网时光机/i })).toBeInTheDocument()
  })
})

describe('Footer', () => {
  it('links the author X account and the archive source', () => {
    renderWithProviders(<Footer />)
    const authorLink = screen.getAllByRole('link', { name: /0xkillcoin/i })[0]
    expect(authorLink).toHaveAttribute('href', AUTHOR_X_URL)
    expect(screen.getByRole('link', { name: /internet archive/i })).toHaveAttribute(
      'href',
      'https://web.archive.org/',
    )
  })
})