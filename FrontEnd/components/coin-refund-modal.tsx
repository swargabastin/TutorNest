'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import { coinRefundsApi } from '@/lib/api';

interface CoinRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
  coinsAmount: number;
  description: string;
  onSuccess: () => void;
}

const REFUND_REASONS = [
  { value: 'InvalidContact', label: 'Invalid / unreachable student phone number' },
  { value: 'ParentUnresponsive48h', label: 'Parent did not respond within 48 hours' },
  { value: 'RequirementWithdrawn', label: 'Student already found tutor / requirement withdrawn' },
  { value: 'DuplicateLead', label: 'Duplicate / fraudulent student requirement' },
  { value: 'Other', label: 'Other valid policy reason' },
];

export function CoinRefundModal({
  isOpen,
  onClose,
  transactionId,
  coinsAmount,
  description,
  onSuccess,
}: CoinRefundModalProps) {
  const [reason, setReason] = useState('InvalidContact');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim()) {
      setError('Please provide a brief explanation for the refund request.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await coinRefundsApi.requestRefund({
        coinTransactionId: transactionId,
        coinsRequested: coinsAmount,
        reason,
        explanation: explanation.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSubmitted(false);
        setExplanation('');
      }, 2000);
    } catch (err: any) {
      console.error('Refund request failed', err);
      setError(err?.response?.data?.message || 'Failed to submit refund request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-3xl border-[#E2E5DF] text-[#243238]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-plum-900" />
            Request Coin Refund
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Submit a review request for debited coins under TutorNest lead quality protection policy.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle className="h-10 w-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-[#243238]">Refund Request Submitted</h4>
            <p className="text-xs text-slate-500">
              Our team will review your request. Approved refunds will credit {coinsAmount} coins directly to your wallet.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-[#F6F3EA] border border-[#E2E5DF] rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction</span>
                <span className="font-semibold text-[#243238]">{description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coins to Refund</span>
                <span className="font-bold text-plum-900">{coinsAmount} Coins</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Refund Reason</label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger className="text-xs h-9 bg-white border-[#E2E5DF] rounded-xl">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {REFUND_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value} className="text-xs">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Details & Communication Summary
              </label>
              <Textarea
                rows={3}
                placeholder="e.g., Called student multiple times over 48h but phone was switched off / invalid."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="text-xs bg-white border-[#E2E5DF] rounded-xl"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs h-9 rounded-xl border-[#E2E5DF]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-plum-900 hover:bg-plum-950 text-white text-xs h-9 rounded-xl font-semibold px-4"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Submitting…
                  </>
                ) : (
                  'Submit Refund Request'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
