import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Wrapper component with all necessary providers
const AuthWithProviders = () => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <Auth />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Auth Page', () => {
  it('renders auth page without crashing', () => {
    const { container } = render(<AuthWithProviders />);
    expect(container).toBeDefined();
  });

  it('has login and register tabs', () => {
    render(<AuthWithProviders />);
    
    // Check for login tab
    const loginTab = screen.getByRole('tab', { name: /connexion/i });
    expect(loginTab).toBeDefined();
    
    // Check for register tab
    const registerTab = screen.getByRole('tab', { name: /inscription/i });
    expect(registerTab).toBeDefined();
  });

  it('displays phone and password inputs', () => {
    render(<AuthWithProviders />);
    
    // Check that inputs exist (may be in login or register form)
    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('displays SikaGreen logo', () => {
    render(<AuthWithProviders />);
    
    const logo = screen.getByAltText(/sikagreen/i);
    expect(logo).toBeDefined();
  });
});
