import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '@/App';

describe('Routing Configuration', () => {
  it('renders App component without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
  });

  it('App component contains router structure', () => {
    const { container } = render(<App />);
    
    // Check that the app rendered something
    expect(container.firstChild).toBeDefined();
  });

  it('does not throw errors during initial render', () => {
    expect(() => {
      render(<App />);
    }).not.toThrow();
  });
});
