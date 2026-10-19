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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/student">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Subscription Plans</h1>
                <p className="text-sm text-gray-600">Choose the right plan for your learning needs</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/*
          Note: there's no yearly-billing toggle here. The backend only
          supports monthly plans (each SubscriptionPlan has a fixed
          DurationDays, no annual price) — showing a "yearly, save 20%"
          option would display a total the checkout couldn't actually
          honor, since createOrder always charges the plan's listed price.
        */}

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="max-w-2xl mx-auto mb-8 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 text-center">
            {success}
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading ? (
            <p className="col-span-full text-center text-gray-500">Loading plans…</p>
          ) : (
            plans.map((plan) => {
              const Icon = iconFor(plan);
              return (
                <Card
                  key={plan.id}
                  className={`relative overflow-hidden ${
                    plan.isPopular ? 'border-2 border-teal-500 shadow-lg' : 'border'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-0 right-0 bg-teal-500 text-white text-center py-1 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className={plan.isPopular ? 'pt-10' : 'pt-6'}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`rounded-lg p-2 ${plan.price === 0 ? 'bg-gray-100' : plan.isPopular ? 'bg-teal-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-6 w-6 ${plan.price === 0 ? 'text-gray-600' : plan.isPopular ? 'text-teal-600' : 'text-gray-600'}`} />
                      </div>
                      {plan.coinsPerMonth > 0 && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                          {plan.coinsPerMonth} coins/mo
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                        <span className="text-sm text-gray-500 ml-2">/month</span>
                      </div>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {plan.features.map((text, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{text}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.isPopular ? 'default' : 'outline'}
                      disabled={plan.price === 0 || purchasingId === plan.id}
                      onClick={() => handleChoosePlan(plan)}
                    >
                      {plan.price === 0 ? 'Current Plan' : purchasingId === plan.id ? 'Processing…' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Benefits Section */}
        <Card className="mb-12">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="bg-teal-100 text-teal-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600">All transactions are encrypted and secure</p>
              </div>
              <div>
                <div className="bg-teal-100 text-teal-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Renewal Alerts</h3>
                <p className="text-sm text-gray-600">Get notified before your subscription renews</p>
              </div>
              <div>
                <div className="bg-teal-100 text-teal-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <HeadphonesIcon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Priority Support</h3>
                <p className="text-sm text-gray-600">Get help faster with premium plans</p>
              </div>
              <div>
                <div className="bg-teal-100 text-teal-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">No Hidden Fees</h3>
                <p className="text-sm text-gray-600">What you see is what you pay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
