import { beforeAll, describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { PublisherAnalyticsTab } from './PublisherAnalyticsTab';

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const mockAnalytics = {
  totalGames: 2,
  avgTotalRating: 4.5,
  topViewedGames: [{ gameId: 1, _count: { gameId: 10 } }],
  topRatedGames: [{ gameId: 1, avgRating: 4.5 }],
  accessibilityFeatureDistribution: [{ category: 'Visual', count: 5 }],
  games: [
    { gameId: 1, title: 'Game 1', totalViews: 10, totalReviews: 2, avgRating: 4.5, favourites: [1], dailyViews: [{ date: '2025-12-01', count: 5 }] },
    { gameId: 2, title: 'Game 2', totalViews: 20, totalReviews: 3, avgRating: 4.0, favourites: [], dailyViews: [] },
  ],
};

describe('PublisherAnalyticsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(mockAnalytics), status: 200 })));
  });

  it('renders analytics and charts', async () => {
    render(<PublisherAnalyticsTab />);
    await waitFor(() => expect(screen.getByText(/Game Analytics Charts/i)).toBeDefined());
    expect(screen.getByText(/Total Games/i)).toBeDefined();
    expect(screen.getByText(/Top Games by Views/i)).toBeDefined();
    expect(screen.getByText(/Accessibility Distribution/i)).toBeDefined();
    expect(screen.getByText(/Game Performance Details/i)).toBeDefined();
  });

  it('opens dialog with daily views chart', async () => {
    render(<PublisherAnalyticsTab />);
    await waitFor(() => expect(screen.getAllByText(/Game 1/i)[0]).toBeDefined());
    fireEvent.click(screen.getAllByText(/Game 1/i)[0]);
    await waitFor(() => expect(screen.getAllByText(/Daily Views/i)).toBeDefined());
  });

  it('shows unauthorized message', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ status: 403, ok: false })));
    render(<PublisherAnalyticsTab />);
    await waitFor(() => expect(screen.getByText(/Unauthorized access/i)).toBeDefined());
  });

  it('shows failed to load message', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, status: 500 })));
    render(<PublisherAnalyticsTab />);
    await waitFor(() => expect(screen.getByText(/Failed to load analytics/i)).toBeDefined());
  });
});
