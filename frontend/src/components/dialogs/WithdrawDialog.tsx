import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Smartphone, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onWithdraw?: (amount: number) => void;
}

export function WithdrawDialog({ open, onOpenChange, balance, onWithdraw }: WithdrawDialogProps) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('+228 ');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const handleSubmit = () => {
    const withdrawAmount = parseInt(amount);
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      toast({
        title: 'Montant invalide',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }

    if (withdrawAmount > balance) {
      toast({
        title: 'Solde insuffisant',
        description: 'Le montant demandé dépasse votre solde',
        variant: 'destructive',
      });
      return;
    }

    if (phone.length < 12) {
      toast({
        title: 'Numéro invalide',
        description: 'Veuillez entrer un numéro de téléphone valide',
        variant: 'destructive',
      });
      return;
    }

    // Mock withdrawal
    onWithdraw?.(withdrawAmount);
    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setAmount('');
    setPhone('+228 ');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-xl sm:max-w-md" aria-describedby="withdraw-description">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Retirer des fonds</DialogTitle>
              <p id="withdraw-description" className="sr-only">Formulaire de retrait de fonds du portefeuille</p>
              <DialogDescription>
                Solde disponible : {formatCurrency(balance)} FCFA
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant (FCFA)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Ex: 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Numéro Mobile Money</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+228 90 00 00 00"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl pl-10"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[1000, 2500, 5000].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    className="rounded-xl flex-1"
                    onClick={() => setAmount(preset.toString())}
                    disabled={preset > balance}
                  >
                    {formatCurrency(preset)}
                  </Button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} className="rounded-xl">
                Annuler
              </Button>
              <Button onClick={handleSubmit} className="rounded-xl bg-primary">
                Confirmer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Retrait confirmé !</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {formatCurrency(parseInt(amount))} FCFA seront envoyés à {phone}
              </p>
            </div>
            <Button onClick={handleClose} className="rounded-xl bg-primary">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
