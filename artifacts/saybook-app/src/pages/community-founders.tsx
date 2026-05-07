import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Lightbulb, Lock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { PLAN_STORAGE_KEY } from "@/lib/planStorage";
import { submitFounderFeedback } from "@/lib/communityApi";
import { getApiBaseUrl } from "@/lib/apiBase";

export default function CommunityFounders() {
  const [isFounder, setIsFounder] = useState<boolean | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [writingProblems, setWritingProblems] = useState("");
  const [questions, setQuestions] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const plan = localStorage.getItem(PLAN_STORAGE_KEY)?.toLowerCase() ?? "";
    setIsFounder(plan === "founders");
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitFounderFeedback({
        authorName,
        email,
        writingProblems,
        questions,
        website: honeypot,
      });
      setDone(true);
      toast({ title: "Received", description: "Your founder feedback was submitted." });
    } catch {
      toast({
        title: "Could not submit",
        description:
          getApiBaseUrl() === ""
            ? "Host the API on the same domain, or set VITE_API_BASE_URL to your API origin."
            : "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isFounder === null) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-muted/20">
        <p className="text-muted-foreground text-sm">Checking access…</p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-muted/20 py-12 px-4 md:px-6 font-sans">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight">Founders lab</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Shape the future SAYBOOK app — writing struggles and questions we can study for FAQs.
              </p>
            </div>
          </div>

          {!isFounder ? (
            <Alert className="border-amber-500/30 bg-amber-500/5">
              <Lock className="h-4 w-4 text-amber-600" />
              <AlertTitle>Founders only</AlertTitle>
              <AlertDescription className="pt-1">
                This space is reserved for customers on the Founders plan. Select Founders from pricing, then return here from the same browser.
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link href="/#pricing">View pricing</Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : (
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Suggestion &amp; questions
                </CardTitle>
                <CardDescription>
                  Describe your writing problems and anything you wish the SAYBOOK app answered. We aggregate themes for FAQs; you’ll see replies from the team in future updates (check back or watch your email if you shared it).
                </CardDescription>
              </CardHeader>
              <CardContent>
                {done ? (
                  <p className="text-muted-foreground leading-relaxed">
                    Thank you — your notes help prioritize the roadmap. Duplicate themes surface as FAQ candidates for the team (and optional AI review later).
                  </p>
                ) : (
                  <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="f-name">Name (optional)</Label>
                      <Input id="f-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={120} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="f-email">Email (optional)</Label>
                      <Input id="f-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="f-problems">Writing problems</Label>
                      <Textarea
                        id="f-problems"
                        required
                        minLength={10}
                        rows={5}
                        value={writingProblems}
                        onChange={(e) => setWritingProblems(e.target.value)}
                        placeholder="Where do you get stuck? Outlining, voice, evidence, publishing…"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="f-q">Questions for SAYBOOK</Label>
                      <Textarea
                        id="f-q"
                        required
                        minLength={10}
                        rows={5}
                        value={questions}
                        onChange={(e) => setQuestions(e.target.value)}
                        placeholder="What should the app explain or automate for authors like you?"
                      />
                    </div>
                    <input
                      type="text"
                      name="website"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden
                    />
                    <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                      <Send className="mr-2 h-4 w-4" />
                      Submit feedback
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
