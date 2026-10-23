'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Star,
  Gift,
  CreditCard,
  History,
  Phone,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { studentsApi, tutorsApi, paymentsApi, openRazorpay, authApi } from '@/lib/api';

interface CoinPackage { coins: number; price: number; popular: boolean; }
interface WalletTxn { id: string; type: 'credit' | 'debit'; amount: number; description: string; date: string; balance: number; }

export default function WalletPage() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<WalletTxn[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load coin packages
    paymentsApi.getCoinPackages()
      .then((pkgs) => setCoinPackages(pkgs || []))
      .catch((err) => console.error('Failed to load coin packages', err));

    // Load wallet for authenticated role
    const user = authApi.getUser();
    if (user?.role === 'Tutor') {
      tutorsApi.getWallet()
        .then((w) => {
          setBalance(w?.coinBalance ?? 0);
          setTransactions(w?.transactions ?? []);
        })
        .catch((err) => console.error('Failed to load tutor wallet', err))
        .finally(() => setLoading(false));
    } else if (user?.role === 'Student') {
      studentsApi.getWallet()
        .then((w) => {
          setBalance(w?.coinBalance ?? 0);
          setTransactions(w?.transactions ?? []);
        })
        .catch((err) => console.error('Failed to load student wallet', err))
        .finally(() => setLoading(false));
    } else {
      // Guest or Admin (view coin packages & pricing)
      setLoading(false);
    }
  }, []);

  const handleBuy = async () => {
    if (!authApi.isLoggedIn()) {
      window.location.href = '/register/student?next=/wallet';
      return;
    }
    if (selectedPackage === null || !coinPackages[selectedPackage]) return;
    const pkg = coinPackages[selectedPackage];
    setError('');
    setBuying(true);
    try {
      const order = await paymentsApi.createOrder({ coinPackageAmount: pkg.price });
      await openRazorpay(order, { type: 'coin_purchase', coinsAmount: pkg.coins });
      // Refresh wallet after a successful purchase
      const user = authApi.getUser();
      const wallet = user?.role === 'Tutor' ? await tutorsApi.getWallet() : await studentsApi.getWallet();
      setBalance(wallet?.coinBalance ?? 0);
      setTransactions(wallet?.transactions ?? []);
      setSelectedPackage(null);
    } catch (err: any) {
      setError(err?.message ?? 'Payment failed or was cancelled.');
    } finally {
      setBuying(false);
    }
  };

  const now = new Date();
  const thisMonthTxns = (transactions ?? []).filter((t) => {
    if (!t?.date) return false;
    const d = new Date(t.date);
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const monthReceived = thisMonthTxns.filter((t) => t?.type === 'credit').reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const monthSpent = thisMonthTxns.filter((t) => t?.type === 'debit').reduce((sum, t) => sum + (t.amount ?? 0), 0);
  const userRole = authApi.getUser()?.role;
  const backHref = userRole === 'Tutor' ? '/dashboard/tutor' : userRole === 'Admin' ? '/dashboard/admin' : '/dashboard/student';

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1924]">
      {/* Header */}
      <div className="bg-white border-b border-[#EADDD0]">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href={backHref}>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-[#EADDD0] hover:bg-plum-50 text-slate-700">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F1924] tracking-tight">Coin Wallet</h1>
                <p className="text-xs text-slate-500">Manage your coin balance to unlock leads and contact verified tutors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-[#1C081E] text-white rounded-2xl shadow-xs border-0 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-36 h-36 -mr-8 -mt-8 rounded-full bg-white/5 pointer-events-none" />
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/10 rounded-xl p-2 text-white">
                      <Wallet className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-semibold text-white/80">Available Coins</span>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">{loading ? '—' : balance.toLocaleString()}</p>
                  <p className="text-xs text-white/60 mt-0.5">Ready for instant unlocks</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-white/70 pt-2 border-t border-white/10">
                  <Gift className="h-3.5 w-3.5 shrink-0 text-amber-400" />
                  <span>1 coin = ₹1 credit across TutorNest</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-[#1F1924]">Monthly Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-50 text-emerald-700 rounded-xl p-2">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Coins Added</span>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-700">+{monthReceived}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-rose-50 text-rose-700 rounded-xl p-2">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Coins Used</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-700">-{monthSpent}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="buy" className="w-full">
              <TabsList className="w-full bg-white border border-[#EADDD0] p-1 rounded-xl h-11">
                <TabsTrigger value="buy" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-plum-900 data-[state=active]:text-white">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Buy Coin Packages
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-plum-900 data-[state=active]:text-white">
                  <History className="h-3.5 w-3.5 mr-1.5" />
                  Transaction Log
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="mt-4 space-y-4">
                <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-[#1F1924]">Select Coin Package</CardTitle>
                    <p className="text-xs text-slate-500">Pick the bundle that matches your tutoring requirements</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {coinPackages.map((pkg, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPackage(index)}
                          className={`relative p-4 rounded-xl border text-center transition-all ${
                            selectedPackage === index
                              ? 'border-plum-900 bg-plum-50/70 shadow-xs'
                              : 'border-[#EADDD0] bg-[#FAF8F5] hover:border-plum-200'
                          }`}
                        >
                          {pkg.popular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-plum-900 text-white text-[10px] font-bold px-2 py-0">
                              Best Value
                            </Badge>
                          )}
                          <div className="flex items-center justify-center gap-1.5 mb-1.5 pt-1">
                            <Star className={`h-4 w-4 ${selectedPackage === index ? 'text-amber-500 fill-amber-500' : 'text-slate-400'}`} />
                            <span className="text-xl sm:text-2xl font-extrabold text-[#1F1924]">
                              {pkg.coins.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-[#1F1924]">₹{pkg.price}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            ₹{(pkg.price / pkg.coins).toFixed(2)} / coin
                          </p>
                        </button>
                      ))}
                    </div>

                    {selectedPackage !== null && coinPackages[selectedPackage] && (
                      <div className="mt-5 p-4 rounded-xl bg-[#FAF8F5] border border-[#EADDD0]">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-xs font-bold text-[#1F1924]">{(coinPackages[selectedPackage]?.coins ?? 0).toLocaleString()} Coins Bundle</p>
                            <p className="text-[11px] text-slate-500">One-time top-up via Razorpay</p>
                          </div>
                          <p className="text-xl font-extrabold text-plum-950">₹{coinPackages[selectedPackage]?.price ?? 0}</p>
                        </div>
                        {error && (
                          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5 mb-3">{error}</p>
                        )}
                        <Button className="w-full h-11 bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs font-bold" onClick={handleBuy} disabled={buying}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          {buying ? 'Securing Gateway…' : 'Proceed to Checkout'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Use Coins Info */}
                <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#1F1924]">How Coins Work</CardTitle>
                  </CardHeader>
                  <CardContent className="grid sm:grid-cols-3 gap-3">
                    <div className="text-center p-3 rounded-xl bg-[#FAF8F5] border border-[#EADDD0]">
                      <Phone className="h-5 w-5 text-plum-800 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-[#1F1924]">Contact Tutor</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">50 coins per unlock</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-[#FAF8F5] border border-[#EADDD0]">
                      <ArrowUpRight className="h-5 w-5 text-plum-800 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-[#1F1924]">Post Requirement</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Free with account</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-[#FAF8F5] border border-[#EADDD0]">
                      <Star className="h-5 w-5 text-plum-800 mx-auto mb-1.5" />
                      <p className="text-xs font-bold text-[#1F1924]">Featured Listing</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">100 coins for 7 days</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold text-[#1F1924]">Coin Ledger</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      {(!transactions || transactions.length === 0) && (
                        <p className="text-center text-xs text-slate-500 py-8">No transaction records logged yet.</p>
                      )}
                      {(transactions ?? []).map((txn) => (
                        <div key={txn.id || `${txn.date}-${txn.amount}`} className="flex items-center justify-between p-3 rounded-xl border border-[#EADDD0] bg-[#FAF8F5]">
                          <div className="flex items-center gap-3">
                            <div className={`rounded-xl p-2 ${txn.type === 'credit' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                              {txn.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#1F1924]">{txn.description || 'Coin transaction'}</p>
                              <p className="text-[10px] text-slate-400">{txn.date ? new Date(txn.date).toLocaleDateString('en-IN') : '—'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-extrabold ${txn.type === 'credit' ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {txn.type === 'credit' ? '+' : '-'}{txn.amount ?? 0}
                            </p>
                            <p className="text-[10px] text-slate-400">Bal: {txn.balance ?? 0}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
