import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/lib/store";
import { ArrowLeft, Sparkles, BookOpen, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { generateDHM, getPlanLimits } from "@workspace/dhm-engine";
import { PLAN_STORAGE_KEY } from "@/lib/planStorage";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  audience: z.string().min(2, "Target audience must be at least 2 characters."),
  goal: z.string().min(10, "Please provide a bit more detail about your goal."),
  genre: z.string().min(1, "Please select a genre."),
});

type FormValues = z.infer<typeof formSchema>;

const fieldVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.09 + 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const generatingSteps = [
  "Analyzing your concept...",
  "Mapping your narrative arc...",
  "Structuring chapters...",
  "Applying DHM syntax...",
  "Finalizing your outline...",
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { setBookData } = useAppContext();
  const [plan, setPlan] = useState<string>("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (planParam) {
      const next = planParam.toLowerCase();
      setPlan(next);
      localStorage.setItem(PLAN_STORAGE_KEY, next);
      return;
    }
    const stored = localStorage.getItem(PLAN_STORAGE_KEY);
    if (stored) setPlan(stored);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", audience: "", goal: "", genre: "" },
  });

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    setStepIndex(0);

    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev >= generatingSteps.length - 1) {
          clearInterval(interval);
          setDone(true);
          setTimeout(() => {
            localStorage.setItem(PLAN_STORAGE_KEY, plan);
            const dhm = generateDHM({ ...values, plan });
            setBookData({ ...values, plan, dhm });
            setLocation("/output");
          }, 700);
          return prev;
        }
        return prev + 1;
      });
    }, 420);
  };

  return (
    <div className="min-h-[100dvh] bg-muted/20 py-12 px-4 md:px-6 font-sans">
      {/* Generating overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -16 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-6 text-center px-8"
            >
              {done ? (
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 20 }}
                  className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center"
                >
                  <CheckCircle2 className="h-10 w-10" />
                </motion.div>
              ) : (
                <div className="relative w-20 h-20">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                </div>
              )}

              <div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={done ? "done" : stepIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    className="text-lg font-semibold text-foreground"
                  >
                    {done ? "Outline ready." : generatingSteps[stepIndex]}
                  </motion.p>
                </AnimatePresence>
                {!done && (
                  <p className="text-sm text-muted-foreground mt-2">This takes just a moment</p>
                )}
              </div>

              {/* Step dots */}
              <div className="flex gap-2">
                {generatingSteps.map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i === stepIndex ? 1.3 : 1,
                      backgroundColor: i <= stepIndex ? "hsl(var(--primary))" : "hsl(var(--muted))",
                    }}
                    transition={{ duration: 0.2 }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors group"
            data-testid="link-back-home"
          >
            <motion.span
              className="flex items-center gap-1"
              whileHover={{ x: -3 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </motion.span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground" data-testid="text-dashboard-headline">
            Project Setup
          </h1>
          <p className="mt-2 text-muted-foreground text-lg">
            Define your book's core parameters to generate your DHM outline.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mt-4 flex flex-col gap-1"
          >
            <span className="inline-flex items-center w-fit rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary capitalize">
              {plan} plan selected
            </span>
            <p className="text-xs text-muted-foreground max-w-xl">
              This outline uses{" "}
              <strong>{getPlanLimits(plan).chapters} chapters</strong>
              {getPlanLimits(plan).revisions === "custom"
                ? " and a customizable revision cadence (Founders)."
                : ` and up to ${getPlanLimits(plan).revisions} revision${getPlanLimits(plan).revisions === 1 ? "" : "s"} on your plan (tracking coming later).`}
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Book Details</CardTitle>
              <CardDescription>
                The more precise you are, the better the resulting outline will be.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Book Title or Idea</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. The Art of Deep Work"
                              {...field}
                              data-testid="input-title"
                              className="h-12 bg-background transition-shadow focus-within:shadow-md focus-within:shadow-primary/10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-6 md:items-start">
                    <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                      <FormField
                        control={form.control}
                        name="audience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target Audience</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Mid-level managers"
                                {...field}
                                data-testid="input-audience"
                                className="h-12 bg-background transition-shadow focus-within:shadow-md focus-within:shadow-primary/10"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>

                    <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                      <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genre</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12 bg-background" data-testid="select-genre">
                                  <SelectValue placeholder="Select a genre" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="non-fiction">Non-fiction</SelectItem>
                                <SelectItem value="self-help">Self-help</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                                <SelectItem value="biography">Biography</SelectItem>
                                <SelectItem value="other">Other nonfiction</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </motion.div>
                  </div>

                  <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                    <p className="text-sm text-muted-foreground -mt-2 md:-mt-1 leading-relaxed">
                      DHM supports nonfiction book types only — fiction is not included.
                    </p>
                  </motion.div>

                  <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Main Goal / Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What is the one thing you want the reader to take away from this book?"
                              className="min-h-[120px] resize-none bg-background transition-shadow focus-within:shadow-md focus-within:shadow-primary/10"
                              {...field}
                              data-testid="input-goal"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>

                  <motion.div
                    custom={5}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="pt-4 flex justify-end"
                  >
                    <motion.div
                      className="w-full sm:w-auto"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto text-base h-12 px-8 shadow-lg shadow-primary/20"
                        disabled={isSubmitting}
                        data-testid="button-generate-dhm"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate DHM Outline
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
