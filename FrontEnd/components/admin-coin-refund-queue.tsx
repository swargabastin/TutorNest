'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Coins,
} from 'lucide-react';
import { coinRefundsApi, CoinRefundRequest } from '@/lib/api';

export function AdminCoinRefundQueue() {
  const [refunds, setRefunds] = useState<CoinRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('Pending');
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadRefunds = () => {
    setLoading(true);
    coinRefundsApi
      .getAdminRefunds(filterStatus === 'All' ? undefined : filterStatus)
      .then(setRefunds)
      .catch((err) => console.error('Failed to load coin refunds', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRefunds();
  }, [filterStatus]);

  const handleResolve = async (id: string, approve: boolean) => {
    setActioningId(id);
    setFeedback(null);
    try {
      await coinRefundsApi.resolveRefund(id, {
        approve,
        adminNotes: adminNotes[id]?.trim() || undefined,
      });
      setFeedback(`Refund request ${approve ? 'approved and coins credited' : 'rejected'}.`);
      loadRefunds();
    } catch (err: any) {
      console.error('Failed to resolve refund', err);
      setFeedback('Action failed. Please try again.');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs overflow-hidden">
      <CardHeader className="border-b border-[#E2E5DF] bg-[#F6F3EA]/60 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-[#243238] flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-plum-900" />
              Tutor Coin Refund Queue
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Review and resolve refund requests for invalid or unresponsive student leads.
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            {['Pending', 'Approved', 'Rejected', 'All'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-plum-900 text-white font-semibold shadow-2xs'
                    : 'bg-white text-slate-600 border border-[#E2E5DF] hover:bg-[#F6F3EA]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-4">
        {feedback && (
          <div className="flex items-center gap-2 p-3 bg-plum-50 border border-plum-200 text-plum-950 text-xs rounded-xl">
            <CheckCircle className="h-4 w-4 text-plum-700 shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {loading ? (
          <p className="text-center text-xs text-slate-500 py-6">Loading refund requests…</p>
        ) : refunds.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500/70" />
            No {filterStatus.toLowerCase()} coin refund requests.
          </div>
        ) : (
          <div className="space-y-3">
            {refunds.map((req) => {
              const isPending = req.status === 'Pending';
              return (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-[#E2E5DF] bg-[#F6F3EA] space-y-3 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs sm:text-sm text-[#243238]">
                          {req.tutorName}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-plum-50 text-plum-900 border-plum-200 text-[10px] font-bold"
                        >
                          <Coins className="h-3 w-3 mr-1 text-plum-800" />
                          {req.coinsRequested} Coins
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : req.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {req.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Claim Reason: <span className="font-semibold text-slate-700">{req.reason}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString('en-IN')} at{' '}
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-[#E2E5DF] text-xs text-slate-700">
                    <p className="font-semibold text-slate-500 text-[11px] mb-0.5">Tutor Explanation:</p>
                    <p className="italic">“{req.explanation}”</p>
                  </div>

                  {req.adminNotes && (
                    <div className="p-2.5 bg-plum-50/50 rounded-lg border border-plum-150 text-xs text-slate-700">
                      <span className="font-bold text-plum-950">Reviewer Note:</span> {req.adminNotes}
                    </div>
                  )}

                  {isPending && (
                    <div className="pt-2 border-t border-[#E2E5DF] space-y-2">
                      <Input
                        type="text"
                        placeholder="Admin note (e.g. Phone confirmed disconnected / Unresponsive parent verified)"
                        value={adminNotes[req.id] || ''}
                        onChange={(e) => setAdminNotes({ ...adminNotes, [req.id]: e.target.value })}
                        className="text-xs h-8 bg-white border-[#E2E5DF] rounded-lg"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={actioningId === req.id}
                          onClick={() => handleResolve(req.id, true)}
                          className="flex-1 h-8 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg"
                        >
                          {actioningId === req.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve & Credit {req.coinsRequested} Coins
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actioningId === req.id}
                          onClick={() => handleResolve(req.id, false)}
                          className="h-8 border-[#E2E5DF] text-rose-700 hover:bg-rose-50 text-xs font-semibold rounded-lg px-3"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Reject Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
