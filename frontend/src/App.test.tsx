import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

test('renders app title', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /random graph lab/i })).toBeInTheDocument()
})

test('renders graph parameter controls', () => {
  render(<App />)

  expect(screen.getByLabelText('n')).toBeInTheDocument()
  expect(screen.getByLabelText('p')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument()
})

test('shows deterministic stats for p = 0', () => {
  render(<App />)

  fireEvent.change(screen.getByLabelText('n'), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText('p'), { target: { value: '0' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  expect(screen.getByText('0')).toBeInTheDocument()
  expect(screen.getByText('4')).toBeInTheDocument()
  expect(screen.getByText('1')).toBeInTheDocument()
  expect(screen.getByText('0.250')).toBeInTheDocument()
  expect(screen.getByText('0.000')).toBeInTheDocument()
})

test('shows deterministic stats for p = 1', () => {
  render(<App />)

  fireEvent.change(screen.getByLabelText('n'), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText('p'), { target: { value: '1' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  expect(screen.getByText('6')).toBeInTheDocument()
  expect(screen.getByText('1')).toBeInTheDocument()
  expect(screen.getByText('4')).toBeInTheDocument()
  expect(screen.getByText('1.000')).toBeInTheDocument()
  expect(screen.getByText('3.000')).toBeInTheDocument()
})

test('shows an error for invalid n and keeps previous stats', () => {
  render(<App />)

  fireEvent.change(screen.getByLabelText('n'), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText('p'), { target: { value: '0' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  fireEvent.change(screen.getByLabelText('n'), { target: { value: '-1' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'n must be a non-negative integer',
  )
  expect(screen.getByText('0.250')).toBeInTheDocument()
})

test('shows an error for non-integer n', () => {
  render(<App />)

  fireEvent.change(screen.getByLabelText('n'), { target: { value: '3.5' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'n must be a non-negative integer',
  )
})

test('shows an error for invalid p', () => {
  render(<App />)

  fireEvent.change(screen.getByLabelText('p'), { target: { value: '1.5' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  expect(screen.getByRole('alert')).toHaveTextContent(
    'p must be between 0 and 1',
  )
})

test('shows an error for empty inputs', () => {
  render(<App />)

  fireEvent.change(screen.getByLabelText('n'), { target: { value: '' } })
  fireEvent.click(screen.getByRole('button', { name: /generate/i }))

  expect(screen.getByRole('alert')).toHaveTextContent('n is required')
})
