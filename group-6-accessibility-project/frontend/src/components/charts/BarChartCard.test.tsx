import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BarChartCard } from './BarChartCard';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  // Mock offsetWidth/offsetHeight for recharts ResponsiveContainer
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 400 });
  Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 300 });
  // Mock getBoundingClientRect for recharts ResponsiveContainer
  HTMLElement.prototype.getBoundingClientRect = () => ({
    width: 400,
    height: 300,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
  });
});

const data = [
  { name: 'Game 1', views: 10 },
  { name: 'Game 2', views: 20 },
];

describe('BarChartCard', () => {
  it('renders title and bars', async () => {
    render(
      <BarChartCard
        title="Top Games by Views"
        data={data}
        xKey="name"
        yKey="views"
      />
    );
    expect(screen.getByText(/Top Games by Views/i)).toBeDefined();
    // Wait for at least one SVG rect (bar) to be rendered
    await waitFor(() => {
      const bars = document.querySelectorAll('rect');
      expect(bars.length).toBeGreaterThan(0);
    });
  });
});
