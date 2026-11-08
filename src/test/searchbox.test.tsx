import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import SearchBox from '../components/SearchBox'
import { I18nProvider } from '../components/I18nProvider'

function LocationProbe() {
  const location = useLocation()
  return <div data-testid="location">{location.pathname}</div>
}

function renderSearch() {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <SearchBox />
                <LocationProbe />
              </>
            }
          />
          <Route path="/site/:domain" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  )
}

describe('SearchBox', () => {
  it('navigates to the normalized site route', async () => {
    const user = userEvent.setup()
    renderSearch()
    const input = screen.getByLabelText(/Enter a URL/i)
    await user.type(input, 'https://www.Apple.com/mac/')
    await user.click(screen.getByRole('button', { name: /Time travel/i }))
    expect(screen.getByTestId('location')).toHaveTextContent('/site/apple.com')
  })

  it('shows an inline error for invalid input and stays on the page', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByLabelText(/Enter a URL/i), 'not a domain')
    await user.click(screen.getByRole('button', { name: /Time travel/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('refuses private hosts instead of querying them', async () => {
    const user = userEvent.setup()
    renderSearch()
    await user.type(screen.getByLabelText(/Enter a URL/i), 'http://127.0.0.1:8080/')
    await user.click(screen.getByRole('button', { name: /Time travel/i }))
    expect(screen.getByRole('alert')).toHaveTextContent(/private/i)
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })

  it('clears the field with the clear button', async () => {
    const user = userEvent.setup()
    renderSearch()
    const input = screen.getByLabelText(/Enter a URL/i) as HTMLInputElement
    await user.type(input, 'example.com')
    expect(input.value).toBe('example.com')
    await user.click(screen.getByRole('button', { name: /Clear/i }))
    expect(input.value).toBe('')
  })
})