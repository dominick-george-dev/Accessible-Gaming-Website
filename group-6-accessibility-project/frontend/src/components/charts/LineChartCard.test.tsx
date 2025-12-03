import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { LineChartCard } from './LineChartCard';
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
  { date: '2025-12-01', count: 5 },
  { date: '2025-12-02', count: 10 },
];

describe('LineChartCard', () => {
  it('renders title and line chart', async () => {
    render(
      <LineChartCard
        title="Daily Views"
        data={data}
        xKey="date"
        yKey="count"
      />
    );
    expect(screen.getByText(/Daily Views/i)).toBeDefined();
    // Check SVG axis labels for at least one expected date
    const svgTexts = Array.from(document.querySelectorAll('text')).map(el => el.textContent);
    expect(svgTexts.some(t => t === '2025-12-01' || t === '2025-12-02')).toBe(true);
    // Wait for at least one SVG path (line) to be rendered
    await waitFor(() => {
      const lines = document.querySelectorAll('path');
      expect(lines.length).toBeGreaterThan(0);
    });
  });
});
