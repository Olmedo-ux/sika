import { Link, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, HelpCircle, Users } from 'lucide-react';
import sikaGreenLogo from '@/assets/sikagreen-logo.png';

export default function Legal() {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'terms';

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Informations légales</h1>
          <p className="text-muted-foreground mt-2">Tout ce que vous devez savoir sur SikaGreen</p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="terms" className="gap-1 text-xs sm:text-sm">
              <FileText className="h-4 w-4 hidden sm:block" />
              CGU
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1 text-xs sm:text-sm">
              <Shield className="h-4 w-4 hidden sm:block" />
              Confidentialité
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-1 text-xs sm:text-sm">
              <HelpCircle className="h-4 w-4 hidden sm:block" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1 text-xs sm:text-sm">
              <Users className="h-4 w-4 hidden sm:block" />
              À propos
            </TabsTrigger>
          </TabsList>

          {/* Conditions d'utilisation */}
          <TabsContent value="terms">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Conditions Générales d'Utilisation
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground">Dernière mise à jour : Janvier 2026</p>
                
                <section>
                  <h3 className="text-lg font-semibold">1. Objet</h3>
                  <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme SikaGreen, une application de recyclage et d'économie circulaire au Togo. En utilisant nos services, vous acceptez ces conditions.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">2. Services proposés</h3>
                  <p>SikaGreen propose les services suivants :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Mise en relation entre citoyens et collecteurs de déchets</li>
                    <li>Marketplace pour les matières recyclées</li>
                    <li>Système de paiement via Mobile Money</li>
                    <li>Géolocalisation des points de collecte</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">3. Inscription et compte</h3>
                  <p>Pour utiliser SikaGreen, vous devez créer un compte avec des informations exactes. Vous êtes responsable de la confidentialité de vos identifiants.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">4. Rôles des utilisateurs</h3>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Citoyens :</strong> Peuvent demander des collectes et vendre leurs déchets triés</li>
                    <li><strong>Collecteurs :</strong> Professionnels qui collectent et transportent les déchets</li>
                    <li><strong>Recycleurs :</strong> Entreprises qui achètent les matières et publient sur la marketplace</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">5. Responsabilités</h3>
                  <p>SikaGreen agit en tant qu'intermédiaire. Nous ne sommes pas responsables de la qualité des matières échangées ni des différends entre utilisateurs.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">6. Contact</h3>
                  <p>Pour toute question : <a href="mailto:contact@sikagreen.tg" className="text-primary hover:underline">contact@sikagreen.tg</a></p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Politique de confidentialité */}
          <TabsContent value="privacy">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Politique de Confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <p className="text-muted-foreground">Dernière mise à jour : Janvier 2024</p>

                <section>
                  <h3 className="text-lg font-semibold">1. Données collectées</h3>
                  <p>Nous collectons les données suivantes :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Informations d'identification : nom, téléphone, email</li>
                    <li>Données de localisation pour les collectes</li>
                    <li>Historique des transactions</li>
                    <li>Évaluations et commentaires</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">2. Utilisation des données</h3>
                  <p>Vos données sont utilisées pour :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Fournir et améliorer nos services</li>
                    <li>Faciliter les transactions entre utilisateurs</li>
                    <li>Envoyer des notifications importantes</li>
                    <li>Assurer la sécurité de la plateforme</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">3. Protection des données</h3>
                  <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, modification ou divulgation.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">4. Partage des données</h3>
                  <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Les autres utilisateurs (nom, évaluations) pour les transactions</li>
                    <li>Nos partenaires de paiement (Mobile Money)</li>
                    <li>Les autorités si requis par la loi</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">5. Vos droits</h3>
                  <p>Vous avez le droit d'accéder, modifier ou supprimer vos données personnelles en nous contactant.</p>
                </section>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Foire Aux Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    q: "Comment fonctionne SikaGreen ?",
                    a: "SikaGreen connecte les citoyens qui ont des déchets recyclables avec des collecteurs professionnels. Vous triez vos déchets, demandez une collecte, et un collecteur vient les récupérer. Vous êtes payé en fonction du poids et du type de matériaux."
                  },
                  {
                    q: "Comment suis-je payé ?",
                    a: "Les paiements sont effectués via Mobile Money (Flooz, T-Money). Le montant est calculé selon le poids et le type de déchets collectés, aux tarifs affichés dans l'application."
                  },
                  {
                    q: "Quels types de déchets puis-je recycler ?",
                    a: "Nous acceptons : plastique, verre, métal, papier/carton, déchets électroniques, et déchets organiques. Chaque type a un prix au kilo différent."
                  },
                  {
                    q: "Comment devenir collecteur ?",
                    a: "Pour devenir collecteur, inscrivez-vous en tant que 'Collecteur' et complétez votre profil professionnel. Vous pourrez ensuite accepter des demandes de collecte dans votre zone."
                  },
                  {
                    q: "Qui peut vendre sur la marketplace ?",
                    a: "Seules les entreprises de recyclage (rôle Recycleur) peuvent publier des produits sur la marketplace. Ils vendent des matières premières triées et des produits finis recyclés."
                  },
                  {
                    q: "Comment contacter le support ?",
                    a: "Envoyez un email à contact@sikagreen.tg ou appelez le +228 90 12 34 56. Notre équipe répond sous 24h."
                  },
                  {
                    q: "L'application est-elle gratuite ?",
                    a: "Oui, l'inscription et l'utilisation de SikaGreen sont entièrement gratuites pour les citoyens. Une commission est prélevée sur les transactions des professionnels."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-border pb-4 last:border-0">
                    <h4 className="font-semibold mb-2">{faq.q}</h4>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* À propos */}
          <TabsContent value="about">
            <Card className="rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  À propos de SikaGreen
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm dark:prose-invert max-w-none space-y-6">
                <section>
                  <h3 className="text-lg font-semibold">Notre mission</h3>
                  <p>SikaGreen est née de la volonté de transformer la gestion des déchets au Togo en une opportunité économique pour tous. Notre mission est de créer une économie circulaire durable où chaque déchet devient une ressource.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">Notre vision</h3>
                  <p>Nous rêvons d'un Togo propre où le recyclage est un réflexe quotidien, où chaque citoyen peut contribuer à la protection de l'environnement tout en améliorant ses revenus.</p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">Notre écosystème</h3>
                  <div className="flex justify-center mb-4 mt-4">
                    <img src={sikaGreenLogo} alt="SikaGreen" className="h-16 w-auto" />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <span className="text-3xl mb-2 block">👨‍👩‍👧‍👦</span>
                      <h4 className="font-semibold">Citoyens</h4>
                      <p className="text-xs text-muted-foreground">Trient et vendent leurs déchets</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <span className="text-3xl mb-2 block">🚛</span>
                      <h4 className="font-semibold">Collecteurs</h4>
                      <p className="text-xs text-muted-foreground">Collectent et transportent</p>
                    </div>
                    <div className="bg-muted rounded-xl p-4 text-center">
                      <span className="text-3xl mb-2 block">🏭</span>
                      <h4 className="font-semibold">Recycleurs</h4>
                      <p className="text-xs text-muted-foreground">Transforment en produits finis</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">Nous contacter</h3>
                  <ul className="list-none space-y-2">
                    <li>📍 Lomé, Togo</li>
                    <li>📧 <a href="mailto:contact@sikagreen.tg" className="text-primary hover:underline">contact@sikagreen.tg</a></li>
                    <li>📞 <a href="tel:+22890123456" className="text-primary hover:underline">+228 90 12 34 56</a></li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold">Rejoignez-nous</h3>
                  <p>Ensemble, construisons un Togo plus vert. Chaque geste compte !</p>
                  <Link to="/auth?tab=register">
                    <Button className="mt-4 rounded-xl">Créer mon compte</Button>
                  </Link>
                </section>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}