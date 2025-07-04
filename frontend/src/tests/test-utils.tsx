import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { RenderOptions } from '@testing-library/react';
import React from 'react';

const customRender = (ui: ReactElement, options = {}) =>
  render(<MemoryRouter>{ui}</MemoryRouter>, options);

export * from '@testing-library/react';
export { customRender as render };

export function renderWithRouter(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(<MemoryRouter>{ui}</MemoryRouter>, options);
}
