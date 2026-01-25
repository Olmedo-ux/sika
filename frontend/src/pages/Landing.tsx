import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InteractiveMap } from '@/components/map/InteractiveMap';
import { useNavigate, Link } from 'react-router-dom';
import { Recycle, Truck, Factory, ArrowRight, CheckCircle, Leaf, TrendingUp, Shield, Lightbulb, Globe, Users } from 'lucide-react';
import { sortingTips } from '@/lib/mock-data';
import { statsApi } from '@/services/api';

export default function Landing() {
  const navigate = useNavigate();
  const [globalStats, setGlobalStats] = React.useState({
    totalWasteRecycled: 0,
    co2Avoided: 0,
    familiesEngaged: 0,
    activeCollectors: 0
  });

  // Fetch global stats
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsApi.getGlobal();
        setGlobalStats(response.data);
      } catch (error) {
        console.error('Error fetching global stats:', error);
      }
    };
    fetchStats();
  }, []);

  const steps = [
    { icon: <Recycle className="h-8 w-8" />, title: 'Triez vos déchets', description: 'Séparez plastique, verre, métal et organique chez vous' },
    { icon: <Truck className="h-8 w-8" />, title: 'Demandez une collecte', description: 'Un collecteur professionnel vient à votre domicile' },
    { icon: <Factory className="h-8 w-8" />, title: 'Gagnez de l\'argent', description: 'Recevez votre paiement directement en Mobile Money' },
  ];

  const benefits = [
    { icon: <TrendingUp className="h-6 w-6" />, title: 'Revenus supplémentaires', description: 'Transformez vos déchets en argent. Jusqu\'à 15 000 FCFA/mois.' },
    { icon: <Globe className="h-6 w-6" />, title: 'Impact environnemental', description: 'Réduisez votre empreinte carbone et protégez le Togo.' },
    { icon: <Shield className="h-6 w-6" />, title: 'Collecteurs vérifiés', description: 'Tous nos collecteurs sont notés et évalués par la communauté.' },
    { icon: <Users className="h-6 w-6" />, title: 'Communauté active', description: 'Rejoignez des milliers de Togolais engagés.' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Hero */}
      <section className="container max-w-6xl mx-auto py-12 md:py-24 text-center px-4">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-3 py-2 rounded-full text-sm mb-6">
          <Leaf className="h-4 w-4 shrink-0" />
          <span>Application N°1 de recyclage au Togo</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold mb-6">Vos déchets valent de <span className="text-primary">l'or</span></h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">Rejoignez l'économie circulaire au Togo. Recyclez, gagnez de l'argent, et protégez notre planète.</p>
        <div className="flex justify-center gap-4">
          <Button size="lg" onClick={() => navigate('/auth?tab=register')} className="rounded-xl text-lg px-8">Commencer</Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/marketplace')} className="rounded-xl text-lg px-8">Marketplace</Button>
        </div>
      </section>

      {/* Stats */}
      <section className="container max-w-6xl mx-auto py-12 px-4">
        <div className="bg-muted/30 rounded-2xl p-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-3xl block mb-2">♻️</span>
            <p className="text-3xl font-bold">{globalStats.totalWasteRecycled.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">kg de déchets recyclés</p>
          </div>
          <div>
            <span className="text-3xl block mb-2">🌍</span>
            <p className="text-3xl font-bold">{globalStats.co2Avoided.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">kg de CO₂ évités</p>
          </div>
          <div>
            <span className="text-3xl block mb-2">👨‍👩‍👧‍👦</span>
            <p className="text-3xl font-bold">{globalStats.familiesEngaged.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">familles engagées</p>
          </div>
          <div>
            <span className="text-3xl block mb-2">🚴</span>
            <p className="text-3xl font-bold">{globalStats.activeCollectors}</p>
            <p className="text-sm text-muted-foreground">collecteurs actifs</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="container max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Comment ça marche ?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <Card key={i} className="text-center pt-6 rounded-xl border-none shadow-md">
              <CardContent>
                <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center text-primary mb-4">{step.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Sorting Tips */}
      <section className="container max-w-5xl mx-auto py-10 sm:py-16 px-4">
        <div className="flex items-center justify-center space-x-2 mb-3 sm:mb-4">
          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6 text-secondary animate-float" />
          <h2 className="text-2xl sm:text-3xl font-bold text-center">Conseils de tri</h2>
        </div>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12 max-w-xl mx-auto text-sm sm:text-base">
          Bien trier, c'est gagner plus et protéger la planète. Voici nos astuces.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {sortingTips.map((tip, index) => (
            <Card key={tip.id} className="rounded-xl border-2 border-dashed border-primary/20 hover:border-primary/50 transition-all duration-300 group hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <span className="text-2xl sm:text-4xl mb-2 sm:mb-4 block transition-transform duration-300 group-hover:scale-125">{tip.icon}</span>
                <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{tip.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">{tip.tip}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Map Preview */}
      <section className="container max-w-6xl mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Points de collecte</h2>
        <InteractiveMap height="400px" points={[]} />
      </section>

      {/* Ecosystem */}
      <section id="partners" className="container max-w-5xl mx-auto py-10 sm:py-16 px-4">
        <div className="bg-muted/30 rounded-3xl p-6 sm:p-8 md:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Notre écosystème</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">
            Citoyens, collecteurs et entreprises de recyclage travaillent ensemble pour un Togo plus propre.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-3xl mx-auto">
            <Card className="rounded-xl group hover-lift">
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center px-2 sm:px-6">
                <span className="text-2xl sm:text-4xl mb-2 sm:mb-3 block transition-transform duration-300 group-hover:scale-125">👨‍👩‍👧‍👦</span>
                <h3 className="font-semibold text-xs sm:text-base">Citoyens</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Triez et gagnez de l'argent</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl group hover-lift" style={{ animationDelay: '0.1s' }}>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center px-2 sm:px-6">
                <span className="text-2xl sm:text-4xl mb-2 sm:mb-3 block transition-transform duration-300 group-hover:scale-125">🚛</span>
                <h3 className="font-semibold text-xs sm:text-base">Collecteurs</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Collectez et revendez</p>
              </CardContent>
            </Card>
            <Card className="rounded-xl group hover-lift" style={{ animationDelay: '0.2s' }}>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6 text-center px-2 sm:px-6">
                <span className="text-2xl sm:text-4xl mb-2 sm:mb-3 block transition-transform duration-300 group-hover:scale-125">🏭</span>
                <h3 className="font-semibold text-xs sm:text-base">Recycleurs</h3>
                <p className="text-[10px] sm:text-sm text-muted-foreground hidden sm:block">Transformez en produits finis</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container max-w-5xl mx-auto py-10 sm:py-16 px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Ce qu'ils disent de nous</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {[
            {
              id: 't-1',
              name: 'Marie Afiwa',
              role: 'Citoyenne',
              neighborhood: 'Tokoin',
              content: 'Grâce à SikaGreen, je gagne de l\'argent en recyclant mes déchets. C\'est simple et rapide !',
              rating: 5,
              avatar: '👩🏾',
            },
            {
              id: 't-2',
              name: 'EcoCollect Togo',
              role: 'Entreprise de collecte',
              neighborhood: 'Bè',
              content: 'Cette application a transformé notre activité. Nous gagnons mieux notre vie tout en protégeant l\'environnement.',
              rating: 5,
              avatar: '🚴',
            },
            {
              id: 't-3',
              name: 'TogoRecycle SA',
              role: 'Entreprise de recyclage',
              neighborhood: 'Zone Industrielle',
              content: 'Un approvisionnement régulier en matières premières de qualité. Excellent partenariat !',
              rating: 5,
              avatar: '🏭',
            },
          ].map((t, index) => (
            <Card key={t.id} className="rounded-xl group hover-lift" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl transition-transform duration-300 group-hover:scale-110">{t.avatar}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{t.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">{t.role} • {t.neighborhood}</p>
                  </div>
                </div>
                <p className="mt-2 sm:mt-3 text-muted-foreground text-xs sm:text-sm line-clamp-3">{t.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container max-w-6xl mx-auto py-16 px-4 text-center">
        <div className="bg-primary text-primary-foreground rounded-3xl p-12">
          <CheckCircle className="h-12 w-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Prêt à faire la différence ?</h2>
          <Button size="lg" variant="secondary" onClick={() => navigate('/auth?tab=register')} className="rounded-xl text-lg mt-4">Créer mon compte</Button>
        </div>
      </section>
    </div>
  );
}
