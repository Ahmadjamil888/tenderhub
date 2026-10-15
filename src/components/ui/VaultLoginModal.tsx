import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent } from "./card";
import { Badge } from "./badge";
import { Lock, ShieldCheck, User, Key, CheckCircle2, AlertCircle } from "lucide-react";

type Officer = {
  id: string;
  name: string;
  role: string;
  isAuthenticated: boolean;
  password?: string;
  otp?: string;
};

type VaultLoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  officers: Officer[];
  onAuthenticate: (officerId: string, password: string, otp: string) => void;
  onAllAuthenticated?: () => void;
  className?: string;
};

export function VaultLoginModal({
  isOpen,
  onClose,
  title = "Tender Bid Vault",
  officers: initialOfficers,
  onAuthenticate,
  onAllAuthenticated,
  className = ""
}: VaultLoginModalProps) {
  const [officers, setOfficers] = useState<Officer[]>(
    initialOfficers.map(o => ({ ...o, isAuthenticated: false }))
  );

  const handleOfficerAuth = (officerId: string, password: string, otp: string) => {
    onAuthenticate(officerId, password, otp);
    
    // Simulate authentication (in real app, this would be validated server-side)
    setOfficers(prev =>
      prev.map(o =>
        o.id === officerId
          ? { ...o, isAuthenticated: true, password, otp }
          : o
      )
    );
  };

  const allAuthenticated = officers.every(o => o.isAuthenticated);

  const handleUnlock = () => {
    if (allAuthenticated) {
      onAllAuthenticated?.();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl ${className}`}>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
              <Lock className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">{title}</DialogTitle>
              <DialogDescription>
                All 4 authorized officers must authenticate with 2FA to unlock the vault
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Banner */}
          <div className={`rounded-lg p-4 ${
            allAuthenticated 
              ? "bg-emerald-50 border border-emerald-200" 
              : "bg-amber-50 border border-amber-200"
          }`}>
            <div className="flex items-center gap-2">
              {allAuthenticated ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span className="font-medium text-emerald-700">
                    All officers authenticated - Vault ready to unlock
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  <span className="font-medium text-amber-700">
                    {officers.filter(o => o.isAuthenticated).length} of 4 officers authenticated
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Officers Authentication Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {officers.map((officer) => (
              <OfficerAuthCard
                key={officer.id}
                officer={officer}
                onAuthenticate={(password, otp) => 
                  handleOfficerAuth(officer.id, password, otp)
                }
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleUnlock}
              disabled={!allAuthenticated}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Unlock Vault
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type OfficerAuthCardProps = {
  officer: Officer;
  onAuthenticate: (password: string, otp: string) => void;
};

function OfficerAuthCard({ officer, onAuthenticate }: OfficerAuthCardProps) {
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSubmit = () => {
    if (password && otp) {
      onAuthenticate(password, otp);
    }
  };

  return (
    <Card className={`border-2 ${officer.isAuthenticated ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
              officer.isAuthenticated ? 'bg-emerald-600' : 'bg-slate-200'
            }`}>
              {officer.isAuthenticated ? (
                <CheckCircle2 className="h-5 w-5 text-white" />
              ) : (
                <User className="h-5 w-5 text-slate-600" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">{officer.name}</h4>
              <Badge variant="outline" className="text-xs">
                {officer.role}
              </Badge>
            </div>
          </div>
          {officer.isAuthenticated && (
            <Badge className="bg-emerald-600">Authenticated</Badge>
          )}
        </div>

        {!officer.isAuthenticated && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <Key className="h-3 w-3" />
                Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={officer.isAuthenticated}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                OTP Code
              </label>
              <Input
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                disabled={officer.isAuthenticated}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!password || !otp || otp.length !== 6}
              className="w-full"
              size="sm"
            >
              Authenticate
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
