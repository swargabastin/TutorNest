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
    <div className="min-h-screen bg-[#F6F3EA] text-[#243238] flex flex-col">
      <Header />

      {/* Hero */}
      <section className="py-12 md:py-16 bg-[#0E3342] text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-4 border border-white/15">
            Transparent Subscription Plans
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Invest in Your Academic Success
          </h1>
          <p className="text-sm md:text-base text-white/80 max-w-xl mx-auto leading-relaxed">
            Choose the plan tailored for your learning goals. Unlock verified tutor contacts with zero hidden charges.
          </p>
        </div>
      </section>

      {/* Student Plans */}
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#243238] mb-2">For Students & Parents</h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
              Connect directly with verified tutors across Kerala.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="w-8 h-8 border-2 border-plum-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading student plans…</p>
              </div>
            ) : (
              studentPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-plum-900 shadow-md ring-2 ring-plum-900/10'
                      : 'border-[#E2E5DF] shadow-xs'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-plum-900 hover:bg-plum-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-6">
                    <div className="mx-auto mb-3 w-11 h-11 rounded-xl bg-plum-50 text-plum-900 flex items-center justify-center">
                      {plan.price === 0 ? (
                        <Star className="h-5 w-5" />
                      ) : (
                        <Coins className="h-5 w-5" />
                      )}
                    </div>
                    <CardTitle className="text-lg font-bold text-[#243238]">{plan.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-3xl font-extrabold text-[#243238]">₹{plan.price}</span>
                      <span className="text-xs text-slate-500">/month</span>
                    </div>
                    {plan.coinsPerMonth > 0 && (
                      <p className="text-xs text-plum-800 font-semibold mt-1">
                        Includes {plan.coinsPerMonth} coins
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-2 pb-6 flex-1 flex flex-col justify-between">
                    <ul className="space-y-2.5 mb-6 text-left">
                      {plan.features.map((text, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-plum-800" />
                          <span className="text-xs text-slate-700 leading-snug">{text}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={plan.price === 0 ? '/register/student' : '/subscription'} className="w-full">
                      <Button
                        className={`w-full rounded-xl text-xs font-semibold h-10 ${
                          plan.isPopular
                            ? 'bg-plum-900 hover:bg-plum-950 text-white'
                            : 'bg-white border border-[#E2E5DF] text-plum-950 hover:bg-plum-50'
                        }`}
                      >
                        {plan.price === 0 ? 'Get Started Free' : `Choose ${plan.name}`}
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
      <section className="py-10 md:py-14 bg-white border-y border-[#E2E5DF]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#243238] mb-2">For Tutors</h2>
            <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto">
              Unlock genuine student leads, stand out in search, and grow your teaching income.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {loading ? (
              <div className="col-span-full text-center py-12">
                <div className="w-8 h-8 border-2 border-plum-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading tutor plans…</p>
              </div>
            ) : (
              tutorPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`relative rounded-2xl border transition-all duration-200 bg-white flex flex-col justify-between ${
                    plan.isPopular
                      ? 'border-plum-900 shadow-md ring-2 ring-plum-900/10'
                      : 'border-[#E2E5DF] shadow-xs'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-plum-900 hover:bg-plum-900 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                        Best Value
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-6">
                    <div className="mx-auto mb-3 w-11 h-11 rounded-xl bg-plum-50 text-plum-900 flex items-center justify-center">
                      {plan.price === 0 ? <Star className="h-5 w-5" /> :
                       plan.isPopular ? <Zap className="h-5 w-5" /> :
                       <Crown className="h-5 w-5" />}
                    </div>
                    <CardTitle className="text-lg font-bold text-[#243238]">{plan.name}</CardTitle>
                    <div className="mt-3">
                      <span className="text-3xl font-extrabold text-[#243238]">₹{plan.price}</span>
                      <span className="text-xs text-slate-500">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2 pb-6 flex-1 flex flex-col justify-between">
                    <ul className="space-y-2.5 mb-6 text-left">
                      {plan.features.map((text, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-plum-800 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-700 leading-snug">{text}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register/tutor" className="w-full">
                      <Button
                        className={`w-full rounded-xl text-xs font-semibold h-10 ${
                          plan.isPopular
                            ? 'bg-plum-900 hover:bg-plum-950 text-white'
                            : 'bg-white border border-[#E2E5DF] text-plum-950 hover:bg-plum-50'
                        }`}
                      >
                        Start as Tutor
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
      <section className="py-10 md:py-14 bg-[#F6F3EA]">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#243238] mb-2">Frequently Asked Questions</h2>
            <p className="text-xs md:text-sm text-slate-500">Everything you need to know about TutorNest subscriptions.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { q: 'Can I change plans anytime?', a: 'Yes! You can upgrade or downgrade anytime. Changes take effect immediately with prorated billing.' },
              { q: 'What are coins used for?', a: 'Coins are used to contact tutors or unlock student requirements. Higher tier plans include generous monthly coins.' },
              { q: 'Is there a free trial?', a: 'The Free tier lets you search all tutors and browse posted student requirements without paying anything.' },
              { q: 'How do I cancel my plan?', a: 'You can cancel anytime with one click in your account settings. You keep all benefits until the end of your billing cycle.' }
            ].map((faq, index) => (
              <Card key={index} className="border-[#E2E5DF] bg-white rounded-2xl shadow-xs">
                <CardContent className="p-5">
                  <h3 className="text-sm font-bold text-[#243238] mb-1.5">{faq.q}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-plum-950 text-white">
        <div className="container mx-auto px-4 text-center max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Ready to Get Started?</h2>
          <p className="text-xs md:text-sm text-white/80 mb-6">
            Join thousands of students and tutors across Kerala on TutorNest.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/register/student">
              <Button className="bg-[#F6F3EA] text-plum-950 hover:bg-white rounded-xl h-10 px-5 text-xs font-bold">
                Sign Up as Student
              </Button>
            </Link>
            <Link href="/register/tutor">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 bg-transparent rounded-xl h-10 px-5 text-xs font-semibold">
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
