import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PieChartCard } from './PieChartCard';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const data = [
  { category: 'Visual', count: 5 },
  { category: 'Audio', count: 3 },
];
const colors = ['#3b82f6', '#8b5cf6'];

describe('PieChartCard', () => {
  it('renders title and legend', () => {
    render(
      <PieChartCard
        title="Accessibility Distribution"
        data={data}
        nameKey="category"
        valueKey="count"
        colors={colors}
      />
    );
    expect(screen.getByText(/Accessibility Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Visual/i)).toBeInTheDocument();
    expect(screen.getByText(/Audio/i)).toBeInTheDocument();
    expect(screen.getByText(/5 accessibility features/i)).toBeInTheDocument();
    expect(screen.getByText(/3 accessibility features/i)).toBeInTheDocument();
  });
});
