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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="p-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              {orderSummary.coins.toLocaleString()} coins have been added to your wallet.
            </p>
            <div className="bg-teal-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">Transaction ID</p>
              <p className="font-mono font-medium">TXN-{Date.now()}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/wallet">
                <Button>View Wallet</Button>
              </Link>
              <Link href="/search">
                <Button variant="outline">Find Tutors</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/wallet">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Payment</h1>
              <p className="text-sm text-gray-600">Complete your purchase</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Payment Method Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        paymentMethod === 'card'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <CreditCard className={`h-8 w-8 mx-auto mb-2 ${paymentMethod === 'card' ? 'text-teal-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${paymentMethod === 'card' ? 'text-teal-600' : 'text-gray-700'}`}>Card</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-8 w-8 mx-auto mb-2 bg-gradient-to-r from-green-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        UPI
                      </div>
                      <span className={`font-medium ${paymentMethod === 'upi' ? 'text-teal-600' : 'text-gray-700'}`}>UPI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        paymentMethod === 'netbanking'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Building2 className={`h-8 w-8 mx-auto mb-2 ${paymentMethod === 'netbanking' ? 'text-teal-600' : 'text-gray-400'}`} />
                      <span className={`font-medium ${paymentMethod === 'netbanking' ? 'text-teal-600' : 'text-gray-700'}`}>Net Banking</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      Card Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Name on Card</Label>
                      <Input
                        id="cardName"
                        placeholder="Enter name as shown on card"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="font-mono"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input
                          id="expiry"
                          placeholder="MM/YY"
                          className="font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="•••"
                          className="font-mono"
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
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">UPI Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="upiId">UPI ID</Label>
                      <Input
                        id="upiId"
                        placeholder="yourname@upi"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                        <button
                          key={app}
                          type="button"
                          className="p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-sm font-medium">{app}</span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Net Banking */}
              {paymentMethod === 'netbanking' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Net Banking</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label>Select Bank</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB', 'Yes Bank', 'Others'].map((bank, i) => (
                          <button
                            key={bank}
                            type="button"
                            className={`p-3 rounded-lg border text-sm font-medium hover:bg-gray-50 transition-colors ${i === 7 ? 'text-teal-600' : ''}`}
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
                className="w-full py-4 text-lg"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Clock className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pay ₹{orderSummary.total}
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4" />
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center gap-1">
                  <Lock className="h-4 w-4" />
                  <span>256-bit Encryption</span>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-teal-50 border border-teal-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 rounded-lg p-2">
                      <Star className="h-6 w-6 text-teal-600 fill-teal-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{orderSummary.planName}</p>
                      <p className="text-sm text-gray-600">{orderSummary.coins.toLocaleString()} coins</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{orderSummary.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (18%)</span>
                    <span>₹{orderSummary.tax}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t">
                    <span>Total</span>
                    <span className="text-teal-600">₹{orderSummary.total}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="bg-yellow-100 text-yellow-600 rounded-full p-1 mt-0.5">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Coins Added Instantly</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        Coins will be credited to your account immediately after successful payment
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
