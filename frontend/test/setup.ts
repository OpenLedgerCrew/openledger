import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// jsdom has no ResizeObserver; recharts' <ResponsiveContainer> (used by ImpactCharts) needs one.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
(globalThis as unknown as { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver =
  ResizeObserverStub;

// Mock react-router-dom globally for tests so that links/navlinks render as standard <a> tags
// and avoid throwing "Cannot destructure property 'basename' of 'React.useContext(...)' as it is null"
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    Link: ({ to, children, className, ...props }: any) => 
      React.createElement('a', { href: to, className, ...props }, children),
    NavLink: ({ to, className, children, end, ...props }: any) => {
      const active = false; // default to inactive in component tests
      const resolvedClassName = typeof className === 'function' ? className({ isActive: active }) : className;
      return React.createElement('a', { href: to, className: resolvedClassName, ...props }, children);
    }
  };
});
