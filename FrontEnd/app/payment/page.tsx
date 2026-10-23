'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Shield,
  Check,
  ArrowLeft,
  Clock,
  Lock,
  Star,
  Wallet,
  Building2
} from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const orderSummary = {
    coins: 1000,
    amount: 849,
    tax: 153,
    total: 1002,
    planName: '1000 Coins Package'
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#F6F3EA] flex items-center justify-center p-4 text-[#243238]">
        <Card className="max-w-lg w-full text-center border-[#E2E5DF] bg-white rounded-3xl shadow-xs">
          <CardContent className="p-8 sm:p-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#243238] mb-2">Payment Successful!</h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              {orderSummary.coins.toLocaleString()} coins have been credited to your wallet balance.
            </p>
            <div className="bg-[#F6F3EA] border border-[#E2E5DF] rounded-xl p-3.5 mb-6 text-xs">
              <p className="text-slate-500 font-medium mb-0.5">Order Reference</p>
              <p className="font-mono font-bold text-plum-950">TXN-{Date.now()}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <Link href="/wallet">
                <Button className="w-full sm:w-auto bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs font-semibold px-5 h-10">
                  View Coin Wallet
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="outline" className="w-full sm:w-auto border-[#E2E5DF] text-[#243238] hover:bg-plum-50 rounded-xl text-xs font-semibold px-5 h-10">
                  Browse Verified Tutors
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F3EA] text-[#243238]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E5DF]">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center gap-3">
            <Link href="/wallet">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-[#E2E5DF] hover:bg-plum-50 text-slate-700">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-extrabold text-[#243238] tracking-tight">Checkout</h1>
              <p className="text-xs text-slate-500">Secure Razorpay coin transaction</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-5">
              {/* Payment Method Selection */}
              <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold text-[#243238]">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-plum-900 bg-plum-50/70 shadow-xs'
                          : 'border-[#E2E5DF] bg-[#F6F3EA] hover:border-plum-200'
                      }`}
                    >
                      <CreditCard className={`h-6 w-6 mx-auto mb-1.5 ${paymentMethod === 'card' ? 'text-plum-900' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold ${paymentMethod === 'card' ? 'text-plum-950' : 'text-slate-700'}`}>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-plum-900 bg-plum-50/70 shadow-xs'
                          : 'border-[#E2E5DF] bg-[#F6F3EA] hover:border-plum-200'
                      }`}
                    >
                      <div className="h-6 w-6 mx-auto mb-1.5 bg-plum-900 text-white rounded-lg flex items-center justify-center font-bold text-[10px]">
                        UPI
                      </div>
                      <span className={`text-xs font-bold ${paymentMethod === 'upi' ? 'text-plum-950' : 'text-slate-700'}`}>UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3.5 rounded-xl border-2 text-center transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border-plum-900 bg-plum-50/70 shadow-xs'
                          : 'border-[#E2E5DF] bg-[#F6F3EA] hover:border-plum-200'
                      }`}
                    >
                      <Building2 className={`h-6 w-6 mx-auto mb-1.5 ${paymentMethod === 'netbanking' ? 'text-plum-900' : 'text-slate-400'}`} />
                      <span className={`text-xs font-bold ${paymentMethod === 'netbanking' ? 'text-plum-950' : 'text-slate-700'}`}>Net Banking</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-[#243238]">
                      <CreditCard className="h-4 w-4 text-plum-800" />
                      Card Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cardName" className="text-xs font-bold text-[#243238]">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="Enter full name"
                        className="h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cardNumber" className="text-xs font-bold text-[#243238]">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="font-mono h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="expiry" className="text-xs font-bold text-[#243238]">Expiry</Label>
                        <Input
                          id="expiry"
                          placeholder="MM / YY"
                          className="font-mono h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="cvv" className="text-xs font-bold text-[#243238]">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="•••"
                          className="font-mono h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* UPI */}
              {paymentMethod === 'upi' && (
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#243238]">UPI Virtual Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="upiId" className="text-xs font-bold text-[#243238]">UPI ID / VPA</Label>
                      <Input
                        id="upiId"
                        placeholder="username@okaxis"
                        className="h-10 rounded-xl border-[#E2E5DF] bg-[#F6F3EA] text-xs sm:text-sm"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          className="p-2.5 rounded-xl border border-[#E2E5DF] bg-[#F6F3EA] hover:bg-plum-50 hover:border-plum-200 text-xs font-semibold text-slate-700 transition-colors"
                        >
                          {app}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && (
                <Card className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-[#243238]">Net Banking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-[#243238]">Select Bank</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Federal Bank', 'Canara', 'Kotak', 'Others'].map((bank) => (
                          <button
                            key={bank}
                            type="button"
                            className="p-2.5 rounded-xl border border-[#E2E5DF] bg-[#F6F3EA] text-xs font-semibold hover:bg-plum-50 hover:border-plum-200 transition-colors"
                          >
                            {bank}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Pay Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-plum-900 hover:bg-plum-950 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Securing Transaction…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pay ₹{orderSummary.total} Securely
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-6 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-plum-800" />
                  <span>256-bit SSL</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-plum-800" />
                  <span>Razorpay Certified</span>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-[#243238]">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F6F3EA] border border-[#E2E5DF]">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-plum-100 text-plum-900 rounded-lg p-1.5">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#243238]">{orderSummary.planName}</p>
                      <p className="text-[11px] text-slate-500">{orderSummary.coins.toLocaleString()} coins credit</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#E2E5DF] text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Base Amount</span>
                    <span>₹{orderSummary.amount}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span>₹{orderSummary.tax}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-[#E2E5DF]">
                    <span>Total Payable</span>
                    <span className="text-plum-950">₹{orderSummary.total}</span>
                  </div>
                </div>

                <div className="bg-plum-50/60 border border-plum-100 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <Wallet className="h-3.5 w-3.5 text-plum-800 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-plum-950">Instant Activation</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Coins will be immediately accessible in your wallet after payment.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
