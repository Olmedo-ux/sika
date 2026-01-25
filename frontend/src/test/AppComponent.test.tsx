import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import Auth from '@/pages/Auth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock des modules externes
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      headers: {
        common: {}
      }
    }
  }
}));

// Helper pour wrapper les composants avec les providers nécessaires
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {component}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('AppComponent Tests', () => {
  describe('Header Component', () => {
    it('devrait afficher le logo SikaGreen', () => {
      renderWithProviders(<Header />);
      
      // Vérifier que le logo est présent via son alt text
      const logo = screen.getByAltText('SikaGreen');
      expect(logo).toBeInTheDocument();
    });

    it('devrait afficher les liens de navigation', () => {
      renderWithProviders(<Header />);
      
      // Vérifier que les liens Accueil et Marketplace sont présents
      const accueilLinks = screen.getAllByText('Accueil');
      const marketplaceLinks = screen.getAllByText('Marketplace');
      
      expect(accueilLinks.length).toBeGreaterThan(0);
      expect(marketplaceLinks.length).toBeGreaterThan(0);
    });

    it('devrait afficher le bouton de changement de thème', () => {
      renderWithProviders(<Header />);
      
      // Vérifier que tous les boutons sont présents (au moins 3: thème, connexion, inscription)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(3);
    });

    it('devrait afficher les boutons de connexion/inscription pour les invités', () => {
      renderWithProviders(<Header />);
      
      // Vérifier que les boutons Connexion et S'inscrire sont présents
      const connexionButton = screen.getByText('Connexion');
      const inscriptionButton = screen.getByText("S'inscrire");
      
      expect(connexionButton).toBeInTheDocument();
      expect(inscriptionButton).toBeInTheDocument();
    });
  });

  describe('Login Form', () => {
    it('devrait afficher le formulaire de connexion avec les champs requis', () => {
      renderWithProviders(<Auth />);
      
      // Vérifier que les labels des champs sont présents
      const phoneLabel = screen.getByText('Numéro de téléphone');
      const passwordLabel = screen.getByText('Mot de passe');
      
      expect(phoneLabel).toBeInTheDocument();
      expect(passwordLabel).toBeInTheDocument();
    });

    it('devrait afficher le bouton de connexion', () => {
      renderWithProviders(<Auth />);
      
      // Vérifier que le bouton "Se connecter" est présent
      const loginButton = screen.getByRole('button', { name: /se connecter/i });
      expect(loginButton).toBeInTheDocument();
    });

    it('devrait avoir les inputs de type correct', () => {
      renderWithProviders(<Auth />);
      
      // Récupérer les inputs par leur placeholder
      const phoneInput = screen.getByPlaceholderText(/\+228 90 12 34 56/i);
      const passwordInput = screen.getByPlaceholderText(/••••••••/);
      
      // Vérifier les types d'input
      expect(phoneInput).toHaveAttribute('type', 'tel');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('devrait afficher les comptes de test', () => {
      renderWithProviders(<Auth />);
      
      // Vérifier que les informations des comptes de test sont présentes
      const testAccountsTitle = screen.getByText(/comptes de test/i);
      expect(testAccountsTitle).toBeInTheDocument();
    });
  });
});
