'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import Footer from '@/components/footer';
import {
  Check,
  X,
  Star,
  Zap,
  Crown,
  Coins
} from 'lucide-react';
import { paymentsApi } from '@/lib/api';
import type { SubscriptionPlan as Plan } from '@/lib/api';

export default function PricingPage() {
  const [studentPlans, setStudentPlans] = useState<Plan[]>([]);
  const [tutorPlans, setTutorPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      paymentsApi.getPlans('Student'),
      paymentsApi.getPlans('Tutor'),
    ])
      .then(([students, tutors]) => {
        setStudentPlans(students);
        setTutorPlans(tutors);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <section className="py-16 bg-gradient-to-br from-teal-600 to-emerald-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-lg text-teal-100 max-w-2xl mx-auto">
            Choose the plan that works best for you. All plans come with a 7-day money-back guarantee.
          </p>
        </div>
      </section>

      {/* Student Plans */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Students</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find the perfect tutor without breaking the bank
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <p className="col-span-full text-center text-gray-500">Loading plans…</p>
            ) : (
              studentPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${plan.isPopular ? 'border-2 border-teal-500 shadow-lg' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-teal-500">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      {plan.price === 0 ? (
                        <Star className="h-6 w-6 text-teal-600" />
                      ) : (
                        <Coins className="h-6 w-6 text-teal-600" />
                      )}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                    {plan.coinsPerMonth > 0 && (
                      <p className="text-sm text-teal-600 font-medium mt-2">
                        Includes {plan.coinsPerMonth} coins
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((text, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 flex-shrink-0 mt-0.5 text-teal-500" />
                          <span className="text-sm text-gray-700">{text}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.price === 0 ? '/register/student' : '/subscription'}>
                      <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                        {plan.price === 0 ? 'Get Started' : `Choose ${plan.name}`}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Tutor Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For Tutors</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Plans built for tutors — coins unlock student leads, and higher tiers get you more visibility in search.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {loading ? (
              <p className="col-span-full text-center text-gray-500">Loading plans…</p>
            ) : (
              tutorPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative ${plan.isPopular ? 'border-2 border-teal-500 shadow-lg' : ''}`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-teal-500">Best Value</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                      {plan.price === 0 ? <Star className="h-6 w-6 text-teal-600" /> :
                       plan.isPopular ? <Zap className="h-6 w-6 text-teal-600" /> :
                       <Crown className="h-6 w-6 text-teal-600" />}
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                      <span className="text-gray-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((text, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-teal-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{text}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register/tutor">
                      <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { q: 'Can I change plans anytime?', a: 'Yes! You can upgrade or downgrade anytime. Changes take effect immediately with prorated billing.' },
              { q: 'What are coins used for?', a: 'Coins are used to contact tutors. Each contact costs 50 coins. Higher plans include more monthly coins.' },
              { q: 'Is there a free trial?', a: 'The Free plan lets you explore the platform. Premium features require a subscription.' },
              { q: 'How do I cancel?', a: 'You can cancel anytime from your dashboard. No questions asked, and you keep your benefits until the billing period ends.' }
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-teal-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-teal-100 mb-8">
            Join thousands of students and tutors on TutorNest
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/register/student">
              <Button className="bg-white text-teal-600 hover:bg-gray-100">
                Sign Up as Student
              </Button>
            </Link>
            <Link href="/register/tutor">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 bg-transparent">
                Sign Up as Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
