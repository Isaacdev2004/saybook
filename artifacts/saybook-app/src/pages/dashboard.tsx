import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppContext } from "@/lib/store";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters."),
  audience: z.string().min(2, "Target audience must be at least 2 characters."),
  goal: z.string().min(10, "Please provide a bit more detail about your goal."),
  genre: z.string().min(1, "Please select a genre."),
});

type FormValues = z.infer<typeof formSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { setBookData } = useAppContext();
  const [plan, setPlan] = useState<string>("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planParam = params.get("plan");
    if (planParam) {
      setPlan(planParam);
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      audience: "",
      goal: "",
      genre: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);
    // Simulate generation delay for effect
    setTimeout(() => {
      setBookData({ ...values, plan });
      setLocation("/output");
    }, 1200);
  };

  return (
    <div className="min-h-[100dvh] bg-muted/20 py-12 px-4 md:px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="link-back-home">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="mb-8">
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground" data-testid="text-dashboard-headline">
              Project Setup
            </h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Define your book's core parameters to generate your DHM outline.
            </p>
            <div className="mt-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
              <span className="capitalize">{plan} Plan Selected</span>
            </div>
          </div>

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
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Title or Idea</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. The Art of Deep Work" {...field} data-testid="input-title" className="h-12 bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="audience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target Audience</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mid-level managers" {...field} data-testid="input-audience" className="h-12 bg-background" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                              <SelectItem value="fiction">Fiction</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Main Goal / Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="What is the one thing you want the reader to take away from this book?" 
                            className="min-h-[120px] resize-none bg-background" 
                            {...field} 
                            data-testid="input-goal"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" className="w-full sm:w-auto text-base h-12 px-8" disabled={isSubmitting} data-testid="button-generate-dhm">
                      {isSubmitting ? (
                        <>Generating DHM...</>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Generate DHM Outline
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
