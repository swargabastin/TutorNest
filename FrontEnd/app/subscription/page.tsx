'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  ArrowLeft,
  Shield,
  Bell,
  HeadphonesIcon
} from 'lucide-react';
import Link from 'next/link';
import { paymentsApi, openRazorpay, authApi } from '@/lib/api';
import type { SubscriptionPlan as Plan } from '@/lib/api';

const faqs = [
  {
    question: 'What happens when my subscription expires?',
    answer: 'Your account will revert to the Free plan. All your data and connections will be preserved.'
  },
  {
    question: 'Can I upgrade or downgrade anytime?',
    answer: 'Yes! You can change your plan at any time. The new rate will be prorated for the current billing period.'
  },
  {
    question: 'How do coins work?',
    answer: 'Coins are used to contact tutors and post requirements. Subscriptions include monthly coin credits.'
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Yes, we offer a 7-day money-back guarantee on all subscriptions.'
  }
];

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const user = authApi.getUser();
    const audience = user?.role === 'Tutor' ? 'Tutor' : 'Student';
    paymentsApi.getPlans(audience).then(setPlans).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChoosePlan = async (plan: Plan) => {
    if (!authApi.isLoggedIn()) {
      window.location.href = '/register/student?next=/subscription';
      return;
    }
    setError('');
    setSuccess('');
    setPurchasingId(plan.id);
    try {
      const order = await paymentsApi.createOrder({ planId: plan.id });
      await openRazorpay(order, { type: 'subscription', planId: plan.id });
      setSuccess(`You're now on the ${plan.name} plan!`);
    } catch (err: any) {
      setError(err?.message ?? 'Payment failed or was cancelled.');
    } finally {
      setPurchasingId(null);
    }
  };

  const iconFor = (plan: Plan) => {
    if (plan.price === 0) return Star;
    if (plan.isPopular) return Zap;
    return Crown;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1924]">
      {/* Header */}
      <div className="bg-white border-b border-[#EADDD0]">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/student">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-[#EADDD0] hover:bg-plum-50 text-slate-700">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#1F1924] tracking-tight">Subscription Plans</h1>
                <p className="text-xs text-slate-500">Pick the plan that fits your tutoring or learning volume</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {error && (
          <div className="max-w-xl mx-auto mb-6 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 text-xs text-rose-700 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="max-w-xl mx-auto mb-6 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs text-emerald-800 text-center font-medium">
            {success}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="w-8 h-8 border-2 border-plum-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500">Loading subscription tiers…</p>
            </div>
          ) : (
            plans.map((plan) => {
              const Icon = iconFor(plan);
              return (
                <Card
                  key={plan.id}
                  className={`relative rounded-2xl bg-white transition-all flex flex-col justify-between ${
                    plan.isPopular ? 'border-plum-900 shadow-md ring-2 ring-plum-900/10' : 'border-[#EADDD0] shadow-xs'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-plum-900 text-white text-[10px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pt-6 pb-2 text-center">
                    <div className="mx-auto mb-2.5 w-11 h-11 rounded-xl bg-plum-50 text-plum-900 flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    {plan.coinsPerMonth > 0 && (
                      <Badge variant="outline" className="mx-auto text-[10px] bg-plum-50 text-plum-900 border-plum-200 mb-2">
                        {plan.coinsPerMonth} coins / mo
                      </Badge>
                    )}
                    <CardTitle className="text-lg font-bold text-[#1F1924]">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 pb-6 flex-1 flex flex-col justify-between">
                    <div className="mb-4 text-center">
                      <span className="text-3xl font-extrabold text-[#1F1924]">₹{plan.price}</span>
                      <span className="text-xs text-slate-500 ml-1">/ month</span>
                    </div>

                    <ul className="space-y-2.5 mb-6 text-left">
                      {plan.features.map((text, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-plum-800 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-700 leading-snug">{text}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full rounded-xl text-xs font-semibold h-10 ${
                        plan.isPopular
                          ? 'bg-plum-900 hover:bg-plum-950 text-white'
                          : 'bg-white border border-[#EADDD0] text-plum-900 hover:bg-plum-50'
                      }`}
                      disabled={plan.price === 0 || purchasingId === plan.id}
                      onClick={() => handleChoosePlan(plan)}
                    >
                      {plan.price === 0 ? 'Current Plan' : purchasingId === plan.id ? 'Securing Gateway…' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Benefits Section */}
        <Card className="mb-12 border-[#EADDD0] bg-white rounded-2xl shadow-xs">
          <CardContent className="p-6 sm:p-8">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="bg-plum-50 text-plum-900 rounded-2xl w-11 h-11 flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-[#1F1924] mb-1">Razorpay Secured</h3>
                <p className="text-[11px] text-slate-500">RBI-compliant bank grade encryption</p>
              </div>
              <div>
                <div className="bg-plum-50 text-plum-900 rounded-2xl w-11 h-11 flex items-center justify-center mx-auto mb-3">
                  <Bell className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-[#1F1924] mb-1">Advance Alerts</h3>
                <p className="text-[11px] text-slate-500">Clear notifications before renewal</p>
              </div>
              <div>
                <div className="bg-plum-50 text-plum-900 rounded-2xl w-11 h-11 flex items-center justify-center mx-auto mb-3">
                  <HeadphonesIcon className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-[#1F1924] mb-1">Dedicated Support</h3>
                <p className="text-[11px] text-slate-500">Direct WhatsApp support helpline</p>
              </div>
              <div>
                <div className="bg-plum-50 text-plum-900 rounded-2xl w-11 h-11 flex items-center justify-center mx-auto mb-3">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-bold text-[#1F1924] mb-1">Zero Hidden Fees</h3>
                <p className="text-[11px] text-slate-500">Transparent pricing, cancel anytime</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F1924] text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid sm:grid-cols-2 gap-3.5">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-[#EADDD0] bg-white rounded-2xl shadow-xs">
                <CardContent className="p-4 sm:p-5">
                  <h3 className="text-xs font-bold text-[#1F1924] mb-1.5">{faq.question}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
