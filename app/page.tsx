import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Clock,
  Users,
  Smartphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Save Time",
    description:
      "Create quotations in minutes instead of hours with preset items and templates.",
  },
  {
    icon: FileText,
    title: "Professional PDFs",
    description:
      "Generate branded, professional quotation documents with one click.",
  },
  {
    icon: Users,
    title: "Lead Management",
    description:
      "Track your leads through the sales pipeline from inquiry to conversion.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description:
      "Access your quotations and leads from anywhere, even offline.",
  },
];

const benefits = [
  "Reduce quotation time from 1 day to 15 minutes",
  "Professional, consistent branding on every quote",
  "Never lose track of leads or follow-ups",
  "Real-time business insights and analytics",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary">RenoHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Create Professional Quotations in{" "}
            <span className="text-primary">Minutes</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            RenoHub helps renovation contractors transform their quotation
            process from hours of manual work to a streamlined 15-minute
            workflow.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dashboard">View Demo</Link>
            </Button>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-16 rounded-xl border bg-white shadow-2xl overflow-hidden">
          <div className="h-8 bg-gray-100 flex items-center px-4 gap-2">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-yellow-400" />
            <div className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="p-4 md:p-8 bg-gray-50">
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "Total Leads", value: "48", color: "bg-blue-500" },
                { label: "Quotations", value: "32", color: "bg-purple-500" },
                { label: "Won Value", value: "$124K", color: "bg-green-500" },
                { label: "Conversion", value: "34%", color: "bg-orange-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <div className={`h-2 w-12 rounded ${stat.color} mb-3`} />
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything You Need to Win More Jobs
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Streamline your entire quotation workflow with powerful features
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Focus on What Matters Most
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Stop spending evenings creating quotations. Let RenoHub handle
                the paperwork while you focus on delivering quality renovations.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-green-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button size="lg" asChild>
                  <Link href="/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10" />
                  <div>
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-3 w-24 bg-gray-100 rounded mt-2" />
                  </div>
                </div>
                <div className="border-t pt-4 space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                      <div className="h-3 w-16 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-bold text-primary">
                    $24,500
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Ready to Transform Your Quotation Process?
          </h2>
          <p className="mt-4 text-lg text-primary-foreground/80">
            Join contractors who are saving hours every week with RenoHub.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/dashboard">Explore Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">RenoHub</span>
            </div>
            <p className="text-sm">
              © 2026 RenoHub. Built for renovation contractors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
