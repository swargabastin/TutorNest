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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={backHref}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Coin Wallet</h1>
                <p className="text-sm text-gray-600">Manage your coins for tutoring services</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="lg:col-span-1">
            <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 -mr-10 -mt-10 rounded-full bg-white/10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 -ml-6 -mb-6 rounded-full bg-white/10"></div>
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 rounded-lg p-2">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Your Balance</span>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-4xl font-bold">{loading ? '—' : balance.toLocaleString()}</p>
                  <p className="text-teal-100 mt-1">Coins Available</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-teal-100">
                  <Gift className="h-4 w-4" />
                  <span>Each coin = ₹1 value for tutor contacts</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">This Month Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-600 rounded-lg p-2">
                      <ArrowDownLeft className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Received</span>
                  </div>
                  <span className="font-bold text-green-600">+{monthReceived}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-100 text-red-600 rounded-lg p-2">
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Spent</span>
                  </div>
                  <span className="font-bold text-gray-700">-{monthSpent}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="buy">
              <TabsList className="w-full">
                <TabsTrigger value="buy" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Buy Coins
                </TabsTrigger>
                <TabsTrigger value="history" className="flex-1">
                  <History className="h-4 w-4 mr-2" />
                  Transaction History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="buy" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Select Coin Package</CardTitle>
                    <p className="text-sm text-gray-600">Choose a package to continue</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {coinPackages.map((pkg, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedPackage(index)}
                          className={`relative p-4 rounded-lg border-2 text-center transition-all ${
                            selectedPackage === index
                              ? 'border-teal-500 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {pkg.popular && (
                            <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">Popular</Badge>
                          )}
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Star className={`h-6 w-6 ${selectedPackage === index ? 'text-teal-600 fill-teal-600' : 'text-gray-400'}`} />
                            <span className={`text-2xl font-bold ${selectedPackage === index ? 'text-teal-600' : 'text-gray-900'}`}>
                              {pkg.coins.toLocaleString()}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">₹{pkg.price}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            ₹{(pkg.price / pkg.coins).toFixed(2)}/coin
                          </p>
                        </button>
                      ))}
                    </div>

                    {selectedPackage !== null && coinPackages[selectedPackage] && (
                      <div className="mt-6 p-4 rounded-lg bg-gray-50 border">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="font-medium text-gray-900">{(coinPackages[selectedPackage]?.coins ?? 0).toLocaleString()} Coins</p>
                            <p className="text-sm text-gray-600">Package selected</p>
                          </div>
                          <p className="text-xl font-bold text-gray-900">₹{coinPackages[selectedPackage]?.price ?? 0}</p>
                        </div>
                        {error && (
                          <p className="text-sm text-red-600 mb-3">{error}</p>
                        )}
                        <Button className="w-full" onClick={handleBuy} disabled={buying}>
                          <CreditCard className="h-4 w-4 mr-2" />
                          {buying ? 'Processing…' : 'Proceed to Payment'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Use Coins Info */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg">How to Use Coins</CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <Phone className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <p className="font-medium">Contact Tutor</p>
                      <p className="text-sm text-gray-600 mt-1">50 coins per contact</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <ArrowUpRight className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <p className="font-medium">Post Requirement</p>
                      <p className="text-sm text-gray-600 mt-1">20 coins per post</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gray-50">
                      <Star className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                      <p className="font-medium">Featured Post</p>
                      <p className="text-sm text-gray-600 mt-1">100 coins per feature</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transaction History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(!transactions || transactions.length === 0) && (
                        <p className="text-center text-gray-500 py-8">No transactions yet.</p>
                      )}
                      {(transactions ?? []).map((txn) => (
                        <div key={txn.id || `${txn.date}-${txn.amount}`} className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className={`rounded-lg p-3 ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {txn.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{txn.description || 'Coin transaction'}</p>
                              <p className="text-sm text-gray-500">{txn.date ? new Date(txn.date).toLocaleDateString() : '—'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-gray-700'}`}>
                              {txn.type === 'credit' ? '+' : '-'}{txn.amount ?? 0}
                            </p>
                            <p className="text-xs text-gray-500">Balance: {txn.balance ?? 0}</p>
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
