import { Wallet, ArrowDownToLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { WithdrawDialog } from '@/components/dialogs/WithdrawDialog';

interface WalletCardProps {
  balance: number;
  onWithdraw?: (amount: number) => void;
}

export function WalletCard({ balance, onWithdraw }: WalletCardProps) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <>
      <Card className="rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-foreground/20 rounded-xl shrink-0">
                <Wallet className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm opacity-90">Mon portefeuille</p>
                <p className="text-xl sm:text-2xl font-bold truncate">{formatCurrency(balance)} FCFA</p>
              </div>
            </div>
            <Button
              variant="secondary"
              className="rounded-xl bg-primary-foreground text-primary hover:bg-primary-foreground/90 w-full sm:w-auto"
              onClick={() => setWithdrawOpen(true)}
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Retirer
            </Button>
          </div>
        </CardContent>
      </Card>

      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        balance={balance}
        onWithdraw={onWithdraw}
      />
    </>
  );
}
