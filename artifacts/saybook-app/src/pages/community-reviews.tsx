import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Star, BookOpen, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { submitReview } from "@/lib/communityApi";
import { getApiBaseUrl } from "@/lib/apiBase";

export default function CommunityReviews() {
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [email, setEmail] = useState("");
  const [review, setReview] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReview({
        rating,
        authorName,
        email,
        review,
        website: honeypot,
      });
      setDone(true);
      toast({ title: "Thank you", description: "Your review was submitted." });
    } catch {
      toast({
        title: "Could not submit",
        description:
          getApiBaseUrl() === ""
            ? "Host the API on the same domain as this app, or set VITE_API_BASE_URL to your API origin."
            : "Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-serif text-3xl font-bold tracking-tight">Customer reviews</h1>
              <p className="text-muted-foreground text-sm mt-1">Share how SAYBOOK worked for you.</p>
            </div>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Leave a review</CardTitle>
              <CardDescription>Ratings and feedback help other authors discover SAYBOOK.</CardDescription>
            </CardHeader>
            <CardContent>
              {done ? (
                <p className="text-muted-foreground leading-relaxed">
                  We appreciate you taking the time. If you ever want to update anything, you can submit another review anytime.
                </p>
              ) : (
                <form onSubmit={(e) => void onSubmit(e)} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          className={`p-2 rounded-lg border transition-colors ${rating >= n ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                          aria-label={`${n} stars`}
                        >
                          <Star className={`h-5 w-5 ${rating >= n ? "fill-primary text-primary" : ""}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rev-name">Name (optional)</Label>
                    <Input id="rev-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} maxLength={120} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rev-email">Email (optional)</Label>
                    <Input id="rev-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rev-body">Your review</Label>
                    <Textarea
                      id="rev-body"
                      required
                      minLength={10}
                      rows={6}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="What stood out? What would you tell another writer?"
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
                    Submit review
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
