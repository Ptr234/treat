import { describe, it, expect, vi } from 'vitest'
import { renderWithProviders, userEvent } from '../../test/utils'
import AccessibleButton from '../AccessibleButton'

describe('AccessibleButton', () => {
  it('renders with default props', () => {
    const { getByRole } = renderWithProviders(
      <AccessibleButton>Click me</AccessibleButton>
    )
    
    expect(getByRole('button')).toBeInTheDocument()
    expect(getByRole('button')).toHaveTextContent('Click me')
  })

  it('handles click events', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    
    const { getByRole } = renderWithProviders(
      <AccessibleButton onClick={mockClick}>Click me</AccessibleButton>
    )
    
    await user.click(getByRole('button'))
    expect(mockClick).toHaveBeenCalledTimes(1)
  })

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    
    const { getByRole } = renderWithProviders(
      <AccessibleButton onClick={mockClick}>Click me</AccessibleButton>
    )
    
    const button = getByRole('button')
    button.focus()
    
    await user.keyboard('{Enter}')
    expect(mockClick).toHaveBeenCalledTimes(1)
    
    await user.keyboard(' ')
    expect(mockClick).toHaveBeenCalledTimes(2)
  })

  it('respects disabled state', async () => {
    const user = userEvent.setup()
    const mockClick = vi.fn()
    
    const { getByRole } = renderWithProviders(
      <AccessibleButton onClick={mockClick} disabled>Click me</AccessibleButton>
    )
    
    const button = getByRole('button')
    expect(button).toBeDisabled()
    
    await user.click(button)
    expect(mockClick).not.toHaveBeenCalled()
  })

  it('shows loading state', () => {
    const { getByRole } = renderWithProviders(
      <AccessibleButton loading>Loading...</AccessibleButton>
    )
    
    const button = getByRole('button')
    expect(button).toBeDisabled()
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('applies correct ARIA attributes', () => {
    const { getByRole } = renderWithProviders(
      <AccessibleButton 
        ariaLabel="Custom label" 
        ariaDescribedBy="description"
      >
        Button
      </AccessibleButton>
    )
    
    const button = getByRole('button')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
    expect(button).toHaveAttribute('aria-describedby', 'description')
  })
})