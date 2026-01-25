import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { wasteTypes } from '@/lib/mock-data';
import { collectionsApi } from '@/services/api';
import { ArrowLeft, ArrowRight, Check, MapPin, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

type Step = 'waste' | 'location' | 'confirm';

export default function NewCollection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('waste');
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [quantity, setQuantity] = useState('5');

  useEffect(() => {
    // Pre-fill address with user's neighborhood if available
    if (user?.neighborhood) {
      setAddress(user.neighborhood);
    }
  }, [user]);

  const steps: { key: Step; label: string }[] = [
    { key: 'waste', label: 'Type de déchet' },
    { key: 'location', label: 'Localisation' },
    { key: 'confirm', label: 'Confirmation' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const toggleWaste = (wasteId: string) => {
    setSelectedWaste(prev => 
      prev.includes(wasteId) ? prev.filter(w => w !== wasteId) : [...prev, wasteId]
    );
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Erreur', description: 'La géolocalisation n\'est pas supportée', variant: 'destructive' });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGettingLocation(false);
        toast({ title: 'Position obtenue', description: 'Votre position a été enregistrée' });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setGettingLocation(false);
        toast({ title: 'Erreur', description: 'Impossible d\'obtenir votre position', variant: 'destructive' });
      }
    );
  };

  const handleNext = () => {
    if (step === 'waste' && selectedWaste.length === 0) {
      toast({ title: 'Sélection requise', description: 'Choisissez au moins un type de déchet', variant: 'destructive' });
      return;
    }
    if (step === 'location' && !address.trim()) {
      toast({ title: 'Adresse requise', description: 'Veuillez saisir votre adresse', variant: 'destructive' });
      return;
    }
    
    if (step === 'waste') setStep('location');
    else if (step === 'location') setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'location') setStep('waste');
    else if (step === 'confirm') setStep('location');
    else navigate('/dashboard/citizen');
  };

  const handleSubmit = async () => {
    if (!address.trim()) return;
    
    try {
      await collectionsApi.create({
        waste_type: selectedWasteNames.join(', '),
        quantity: `${quantity} kg`,
        location_lat: locationCoords?.lat || 0,
        location_lng: locationCoords?.lng || 0,
        location_address: address,
        amount: estimatedAmount,
      });
      
      toast({ 
        title: 'Demande envoyée ! 🎉', 
        description: 'Un collecteur vous contactera bientôt' 
      });
      navigate('/dashboard/citizen');
    } catch (error) {
      console.error('Error creating collection:', error);
      toast({ 
        title: 'Erreur', 
        description: 'Impossible de créer la demande. Veuillez réessayer.', 
        variant: 'destructive' 
      });
    }
  };

  const selectedWasteNames = wasteTypes.filter(w => selectedWaste.includes(w.id)).map(w => w.name);
  const estimatedAmount = selectedWaste.reduce((acc, id) => {
    const waste = wasteTypes.find(w => w.id === id);
    return acc + (waste?.pricePerKg || 0) * parseInt(quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto py-6 space-y-6 px-4">
        {/* Progress */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                i <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {i < currentStepIndex ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'w-12 sm:w-24 h-1 mx-2',
                  i < currentStepIndex ? 'bg-primary' : 'bg-muted'
                )} />
              )}
            </div>
          ))}
        </div>

        <h1 className="text-2xl font-bold">{steps[currentStepIndex].label}</h1>

        {/* Step 1: Waste Type - Only non-recyclable waste for citizens */}
        {step === 'waste' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Sélectionnez les types de déchets non recyclables à collecter</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wasteTypes.filter(w => !w.recyclable).map((waste) => (
                <Card 
                  key={waste.id}
                  className={cn(
                    'cursor-pointer transition-all rounded-xl',
                    selectedWaste.includes(waste.id) 
                      ? 'ring-2 ring-primary bg-primary/10' 
                      : 'hover:border-primary/50'
                  )}
                  onClick={() => toggleWaste(waste.id)}
                >
                  <CardContent className="p-4 text-center">
                    <span className="text-3xl">{waste.icon}</span>
                    <p className="font-medium mt-2">{waste.name}</p>
                    <p className="text-xs text-muted-foreground">{waste.pricePerKg} FCFA/kg</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedWaste.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantité estimée (kg)</label>
                <div className="flex gap-2">
                  {['2', '5', '10', '20'].map((q) => (
                    <Button
                      key={q}
                      variant={quantity === q ? 'default' : 'outline'}
                      className="rounded-xl flex-1"
                      onClick={() => setQuantity(q)}
                    >
                      {q} kg
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Location */}
        {step === 'location' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Indiquez l'adresse de collecte (votre domicile)</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Adresse complète</label>
                <Input
                  placeholder="Ex: Quartier Hédzranawoé, Rue 123, Lomé"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={getLocation}
                disabled={gettingLocation}
              >
                <Navigation className={cn("h-4 w-4 mr-2", gettingLocation && "animate-spin")} />
                {gettingLocation ? 'Obtention de la position...' : 'Utiliser ma position actuelle'}
              </Button>

              {locationCoords && (
                <Card className="rounded-xl bg-primary/10 border-primary">
                  <CardContent className="p-3 flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div className="text-xs">
                      <p className="font-medium">Position GPS enregistrée</p>
                      <p className="text-muted-foreground">
                        {locationCoords.lat.toFixed(6)}, {locationCoords.lng.toFixed(6)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <Card className="rounded-xl">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Adresse de collecte</span>
                  <span className="font-medium text-right flex-1 ml-2">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quantité</span>
                  <span className="font-medium">{quantity} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Types de déchets</span>
                  <span className="font-medium">{selectedWasteNames.join(', ')}</span>
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="font-semibold">Gain estimé</span>
                  <span className="text-xl font-bold text-primary">{estimatedAmount.toLocaleString('fr-FR')} FCFA</span>
                </div>
              </CardContent>
            </Card>
            <p className="text-sm text-muted-foreground text-center">
              Un collecteur vous contactera dans les prochaines heures pour organiser la collecte.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button variant="outline" onClick={handleBack} className="rounded-xl flex-1">
            <ArrowLeft className="h-4 w-4 mr-2" /> Retour
          </Button>
          {step !== 'confirm' ? (
            <Button onClick={handleNext} className="rounded-xl flex-1 bg-primary">
              Suivant <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="rounded-xl flex-1 bg-primary">
              <Check className="h-4 w-4 mr-2" /> Confirmer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
