import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, PlayCircle, BookOpen, PenTool, Layout, ArrowRight, Sparkles } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const plans = [
  {
    name: "Basic",
    price: "$59",
    description: "Perfect for getting started with your first book idea.",
    features: ["1 DHM outline", "Multi-chapter structure (up to 3 chapters)", "1 revision", "1 ebook"],
    badge: null,
    upgrade: "Upgrade to Standard for more chapters and revisions.",
  },
  {
    name: "Standard",
    price: "$79",
    description: "The complete toolkit for serious authors.",
    features: ["3 DHM outlines", "Multi-chapter structure (up to 8 chapters)", "3 revisions", "2 ebooks + 1 course"],
    badge: "Most Popular",
    upgrade: "Upgrade to Founders to be one of our 50 founders.",
  },
  {
    name: "Founders",
    price: "$199",
    description:
      "Limited to 50 founders — 5 outlines and 5 reviews, priority support, and a lifetime 25% SAYBOOK App subscription discount.",
    features: [
      "5 DHM outlines",
      "5 reviews",
      "Full multi-chapter structure",
      "All resources",
      "Priority support",
      "Lifetime 25% SAYBOOK App subscription discount",
      "Founders Badge",
    ],
    badge: "Best Value",
    upgrade: null,
  },
];

const features = [
  { icon: PenTool, title: "Structured Precision", desc: "Every chapter serves a specific purpose in the Awareness, Resolution, and Call to Action arcs." },
  { icon: Layout, title: "Narrative Syntax", desc: "Our proprietary syntax tags guide the tone and structure of each chapter with editorial confidence." },
  { icon: BookOpen, title: "Editorial Advice", desc: "Get actionable writing advice tailored to the specific beat of your book — chapter by chapter." },
];

function FadeInWhenVisible({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const handleSelectPlan = (planName: string) => {
    setLocation(`/dashboard?plan=${planName.toLowerCase()}`);
  };

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans bg-background text-foreground selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Navbar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full border-b border-border/40 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-xl tracking-tight">SAYBOOK</span>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">How it works</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">Pricing</a>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="sm" onClick={() => handleSelectPlan('standard')} data-testid="button-nav-get-started">Get Started</Button>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <section ref={heroRef} className="relative py-24 md:py-36 lg:py-48 overflow-hidden">
          {/* Ambient background blobs */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <motion.div
              animate={{ scale: [1, 1.06, 1], rotate: [0, 3, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl"
            />
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, -4, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 3 }}
              className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl"
            />
          </div>

          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="container max-w-5xl mx-auto px-4 md:px-6 text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Introducing the Double Helix Map
              </motion.div>

              <h1
                className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]"
                data-testid="text-hero-headline"
              >
                Generate High-Quality{" "}
                <span className="text-primary">Book Outlines</span>{" "}
                with AI
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-7 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
                data-testid="text-hero-subtext"
              >
                The Double Helix Map (DHM) is a proprietary narrative system that turns your raw ideas into a structured, compelling chapter-by-chapter outline in minutes.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.38 }}
                className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: "spring", stiffness: 400 }}>
                  <Button size="lg" className="h-13 px-9 text-base shadow-lg shadow-primary/20" onClick={() => handleSelectPlan('standard')} data-testid="button-hero-get-started">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button size="lg" variant="outline" className="h-13 px-9 text-base" data-testid="button-hero-watch-demo">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Watch Demo Video
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Floating stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="mt-16 grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 max-w-3xl mx-auto"
            >
              {["Multi-chapter structure", "3-part ARC system", "Editable output", "PDF export"].map((stat, i) => (
                <motion.span
                  key={stat}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-muted/60 border border-border/60 px-3 sm:px-4 py-1.5 text-sm text-muted-foreground text-center sm:text-left"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {stat}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-dhm-headline">
                The Anatomy of a Bestseller
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                DHM intertwines your core message with your reader's emotional journey — creating narrative tension that makes your book impossible to put down.
              </p>
            </FadeInWhenVisible>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <FadeInWhenVisible key={feature.title} delay={i * 0.12}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="bg-background border border-border p-7 rounded-2xl shadow-sm h-full cursor-default"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 6 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6"
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Video Placeholder */}
        <FadeInWhenVisible>
          <section className="py-24">
            <div className="container max-w-5xl mx-auto px-4 md:px-6">
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="relative rounded-3xl overflow-hidden bg-foreground/5 border border-border/50 aspect-video flex items-center justify-center cursor-pointer group shadow-xl"
                data-testid="section-demo-video"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
                <div className="text-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.12 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-shadow"
                  >
                    <PlayCircle className="h-10 w-10" />
                  </motion.div>
                  <p className="text-lg font-semibold text-foreground">Watch the Demo</p>
                  <p className="text-sm text-muted-foreground mt-1">See how DHM generates your outline in under 2 minutes</p>
                </div>
              </motion.div>
            </div>
          </section>
        </FadeInWhenVisible>

        {/* Pricing */}
        <section id="pricing" className="py-24 bg-muted/20 border-t border-border/50">
          <div className="container max-w-6xl mx-auto px-4 md:px-6">
            <FadeInWhenVisible className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-bold" data-testid="text-pricing-headline">
                Invest in Your Craft
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Select the plan that fits your writing goals. No current subscription — one-time access.
              </p>
            </FadeInWhenVisible>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto md:items-stretch">
              {plans.map((plan, i) => (
                <FadeInWhenVisible key={plan.name} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: plan.name === "Standard" ? -10 : -6 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="h-full"
                  >
                    <Card
                      className={`relative flex flex-col h-full ${plan.name === "Standard" ? "border-primary shadow-xl shadow-primary/10" : "border-border/60 shadow-md"}`}
                      data-testid={`card-pricing-${plan.name.toLowerCase()}`}
                    >
                      {plan.badge && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -8 }}
                          whileInView={{ opacity: 1, scale: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 + 0.3, type: "spring" }}
                          className="absolute -top-4 left-1/2 -translate-x-1/2"
                        >
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                            {plan.badge}
                          </span>
                        </motion.div>
                      )}
                      <CardHeader className="shrink-0 space-y-0 pb-4 pt-8">
                        <CardTitle className="font-serif text-2xl">{plan.name}</CardTitle>
                        <div className="mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                          <span className="text-5xl font-extrabold tracking-tight leading-none">{plan.price}</span>
                          <span className="text-muted-foreground text-sm font-medium">one-time</span>
                        </div>
                        <CardDescription className="mt-3 text-sm leading-snug min-h-[4.75rem] text-pretty">
                          {plan.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col min-h-0 px-6 pb-0 pt-0">
                        <ul className="space-y-3 shrink-0">
                          {plan.features.map((feature, j) => (
                            <motion.li
                              key={j}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.08 + j * 0.05 + 0.2 }}
                              className="flex items-start gap-3 text-sm"
                            >
                              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                              <span className="text-muted-foreground leading-snug">{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                        <div className="flex-1 min-h-2 shrink-0" aria-hidden />
                        <div className="shrink-0 border-t border-border/50 pt-4 min-h-[3.5rem]">
                          {plan.upgrade ? (
                            <p className="text-xs text-muted-foreground/80 leading-snug italic">{plan.upgrade}</p>
                          ) : null}
                        </div>
                      </CardContent>
                      <CardFooter className="mt-auto shrink-0 px-6 pb-8 pt-4">
                        <motion.div className="w-full" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <Button
                            className="w-full h-11"
                            variant={plan.name === "Standard" ? "default" : "outline"}
                            onClick={() => handleSelectPlan(plan.name)}
                            data-testid={`button-select-plan-${plan.name.toLowerCase()}`}
                          >
                            Select {plan.name}
                          </Button>
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </FadeInWhenVisible>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-foreground text-background py-12 border-t border-border">
        <div className="container max-w-6xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-xl tracking-tight">SAYBOOK</span>
          </div>
          <p className="text-sm text-background/40">
            © {new Date().getFullYear()} SAYBOOK. Crafted for authors.
          </p>
        </div>
      </footer>
    </div>
  );
}
