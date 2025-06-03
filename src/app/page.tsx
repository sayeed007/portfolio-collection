// src/app/page.tsx
'use client';

import BackgroundDecoration from '@/components/common/BackgroundDecoration';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowRight,
  Download,
  FileText,
  Search,
  Users,
  Star,
  Globe,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      icon: FileText,
      title: "Easy Portfolio Creation",
      description: "Create professional portfolios with our intuitive multi-step form and advanced customization options",
      color: "blue"
    },
    {
      icon: Users,
      title: "Professional Network",
      description: "Connect with like-minded professionals and grow your network in your industry",
      color: "purple"
    },
    {
      icon: Search,
      title: "Advanced Search",
      description: "Find portfolios by skills, experience, education, and location with powerful filtering",
      color: "green"
    },
    {
      icon: Download,
      title: "PDF Export",
      description: "Export your portfolio as a professional PDF document ready for sharing",
      color: "orange"
    }
  ];

  const stats = [
    { label: "Active Users", value: "10K+" },
    { label: "Portfolios Created", value: "25K+" },
    { label: "Companies", value: "50+" },
    { label: "Satisfaction", value: "98%" }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "UX Designer at TechCorp",
      content: "This platform helped me land my dream job. The portfolio builder is incredibly intuitive and professional.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "Full Stack Developer",
      content: "Love how easy it is to showcase my projects and connect with other developers in the community.",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Manager",
      content: "The PDF export feature is a game-changer. I can easily share my portfolio with potential employers.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <BackgroundDecoration />

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-5xl mx-auto">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-purple-200 mb-8">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Join 10,000+ professionals building their careers
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 leading-tight mb-8">
                Showcase Your
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Professional{" "}
                </span>
                Journey
              </h1>

              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto">
                Create stunning professional portfolios, connect with industry peers, and showcase your expertise to the world with our cutting-edge platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/directory">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 backdrop-blur bg-white/80"
                  >
                    <Globe className="mr-2 w-5 h-5" />
                    Explore Portfolios
                  </Button>
                </Link>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                      {stat.value}
                    </div>
                    <div className="text-gray-600 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-blue-200 mb-6">
                <Zap className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Powerful Features</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need to
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Succeed
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Our platform provides all the tools you need to create, showcase, and manage your professional portfolio with enterprise-grade features.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colorClasses = {
                  blue: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
                  purple: "bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
                  green: "bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white",
                  orange: "bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                };

                return (
                  <Card key={index} className="p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border-0 bg-white/80 backdrop-blur">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${colorClasses[feature.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-8 h-8 transition-all duration-300" />
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-green-200 mb-6">
                <Users className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Simple Process</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                How It
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Works
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Get started in just a few simple steps and join thousands of professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  description: "Create your account with email or Google OAuth in seconds",
                  icon: Users
                },
                {
                  step: "2",
                  title: "Build Portfolio",
                  description: "Use our intuitive multi-step form to create your professional showcase",
                  icon: FileText
                },
                {
                  step: "3",
                  title: "Share & Connect",
                  description: "Share your portfolio and explore others in our professional community",
                  icon: Globe
                }
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="text-center group">
                    <div className="relative mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                        {item.step}
                      </div>
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto -mt-16 mb-4 shadow-lg border-4 border-gray-50">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-900">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur rounded-full border border-yellow-200 mb-6">
                <Star className="w-4 h-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Loved by Professionals</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                What Our
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {" "}Users Say
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="p-8 border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 leading-relaxed italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <Card className="max-w-4xl mx-auto p-12 lg:p-16 text-center border-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 text-white shadow-2xl">
              <div className="mb-8">
                <Shield className="w-16 h-16 mx-auto mb-6 text-blue-200" />
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Ready to Build Your Portfolio?
                </h2>
                <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
                  Join thousands of professionals showcasing their skills and advancing their careers with our platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                  >
                    Start Building Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/directory">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 text-lg border-2 border-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-300  hover:-translate-y-1 cursor-pointer"
                  >
                    <Search className="mr-2 w-5 h-5" />
                    Explore Community
                  </Button>
                </Link>
              </div>

              <div className="mt-12 pt-8 border-t border-blue-400/30">
                <p className="text-blue-200 text-sm">
                  ✨ Free to start • No credit card required • Professional templates included
                </p>
              </div>
            </Card>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
}