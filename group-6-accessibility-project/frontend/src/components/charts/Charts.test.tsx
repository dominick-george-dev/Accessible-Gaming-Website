// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Charts } from './Charts';

describe('Charts', () => {
  it('renders title and children', () => {
    render(
      <Charts title="Test Charts">
        <div>Chart 1</div>
        <div>Chart 2</div>
        <div>Chart 3</div>
      </Charts>
    );
    expect(screen.getByText(/Test Charts/i)).toBeDefined();
    expect(screen.getByText(/Chart 1/i)).toBeDefined();
    expect(screen.getByText(/Chart 2/i)).toBeDefined();
    expect(screen.getByText(/Chart 3/i)).toBeDefined();
  });

  it('last child spans full width', () => {
    render(
      <Charts>
        <div data-testid="chart1">Chart 1</div>
        <div data-testid="chart2">Chart 2</div>
      </Charts>
    );
    const chart2 = screen.getByTestId('chart2');
    expect(chart2.parentElement?.className).toMatch(/col-span-1 lg:col-span-2/);
  });
});
