import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, ChevronRight, Leaf } from 'lucide-react';
import sikaGreenLogo from '@/assets/sikagreen-logo.png';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="sm:col-span-2 lg:col-span-1">
            <img src={sikaGreenLogo} alt="SikaGreen" className="h-12 sm:h-14 w-auto mb-2" />
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
              La première plateforme de recyclage au Togo. Transformez vos déchets en revenus tout en protégeant l'environnement.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm text-foreground">Liens rapides</h4>
            <ul className="space-y-1.5">
              <li><Link to="/profile" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3 shrink-0" /> Mon profil</Link></li>
              <li><Link to="/chat" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3 shrink-0" /> Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm text-foreground">Suivez-nous</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3 shrink-0" /> Facebook</a></li>
              <li><a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"><ChevronRight className="h-3 w-3 shrink-0" /> Instagram</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-sm text-foreground">Contact</h4>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><MapPin className="h-3 w-3 text-primary shrink-0 mt-0.5" /><span className="text-xs text-muted-foreground">Lomé, Togo</span></li>
              <li className="flex items-center gap-2"><Phone className="h-3 w-3 text-primary shrink-0" /><a href="tel:+22879859416" className="text-xs text-muted-foreground hover:text-primary transition-colors">+228 79 85 94 16</a></li>
              <li className="flex items-center gap-2"><Mail className="h-3 w-3 text-primary shrink-0" /><a href="mailto:contact@sikagreen.tg" className="text-xs text-muted-foreground hover:text-primary transition-colors">contact@sikagreen.tg</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container max-w-5xl mx-auto px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <p className="text-xs text-muted-foreground">
              © 2024 SikaGreen. Tous droits réservés.
            </p>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Leaf className="h-2.5 w-2.5" />
                Écologique
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                🇹🇬 Made in Togo
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
