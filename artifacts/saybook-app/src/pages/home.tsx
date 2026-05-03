import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, PlayCircle, BookOpen, PenTool, Layout } from "lucide-react";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "$59",
    description: "Perfect for getting started with your first book idea.",
    features: ["1 DHM outline", "3 chapters", "1 revision", "1 ebook"],
    badge: null,
  },
  {
    name: "Standard",
    price: "$79",
    description: "The complete toolkit for serious authors.",
    features: ["3 DHM outlines", "8 chapters", "3 revisions", "2 ebooks + 1 course"],
    badge: "Most Popular",
  },
  {
    name: "Founders",
    price: "$199",
    description: "Unlimited access and priority support for pros.",
    features: ["Unlimited outlines", "All chapters", "Unlimited revisions", "All resources", "Priority support", "Founders Badge"],
    badge: "Best Value",
  },
];

export default function Home() {
  const [, setLocation] = useLocation();

  const handleSelectPlan = (planName: string) => {
    setLocation(`/dashboard?plan=${planName.toLowerCase()}`);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-xl tracking-tight">SAYBOOK</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">How it works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">Pricing</a>
            <Button size="sm" onClick={() => handleSelectPlan('standard')} data-testid="button-nav-get-started">Get Started</Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />
          <div className="container max-w-5xl mx-auto px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]" data-testid="text-hero-headline">
                Generate High-Quality Book Outlines with AI
              </h1>
              <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-hero-subtext">
                The Double Helix Map (DHM) is a proprietary narrative system that turns your raw ideas into a structured, compelling chapter-by-chapter outline in minutes.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg" onClick={() => handleSelectPlan('standard')} data-testid="button-hero-get-started">
                  Get Started
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base" data-testid="button-hero-watch-demo">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo Video
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-muted/30 border-y border-border/50">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-dhm-headline">The Anatomy of a Bestseller</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                DHM intertwines your core message with your reader's emotional journey. It creates narrative tension that makes your book impossible to put down.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: PenTool, title: "Structured Precision", desc: "Every chapter serves a specific purpose in the Awareness, Resolution, and Call to Action arcs." },
                { icon: Layout, title: "Narrative Syntax", desc: "Our proprietary syntax tags guide the tone and structure of your chapters." },
                { icon: BookOpen, title: "Editorial Advice", desc: "Get actionable writing advice tailored to the specific beat of your book." }
              ].map((feature, i) => (
                <div key={i} className="bg-background border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-pricing-headline">Invest in Your Craft</h2>
              <p className="mt-4 text-lg text-muted-foreground">Select the plan that fits your writing goals.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
              {plans.map((plan, i) => (
                <Card 
                  key={plan.name} 
                  className={`relative flex flex-col ${plan.name === 'Standard' ? 'border-primary shadow-xl md:-mt-8 md:mb-8' : 'border-border/50 shadow-md'}`}
                  data-testid={`card-pricing-${plan.name.toLowerCase()}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                    <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                      {plan.price}
                    </div>
                    <CardDescription className="mt-2 text-sm">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-3">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start text-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mr-3" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant={plan.name === 'Standard' ? 'default' : 'outline'}
                      onClick={() => handleSelectPlan(plan.name)}
                      data-testid={`button-select-plan-${plan.name.toLowerCase()}`}
                    >
                      Select Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12 border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-xl tracking-tight">SAYBOOK</span>
          </div>
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} SAYBOOK. Crafted for authors.
          </p>
        </div>
      </footer>
    </div>
  );
}
