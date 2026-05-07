import { useCallback, useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  fetchAdminCommunity,
  postAdminFounderReply,
  type FounderSuggestionDto,
  type ReviewRecordDto,
} from "@/lib/communityApi";

const TOKEN_SESSION_KEY = "saybook-admin-token";

export default function AdminCommunity() {
  const [tokenInput, setTokenInput] = useState("");
  const [token, setToken] = useState("");
  const [reviews, setReviews] = useState<ReviewRecordDto[]>([]);
  const [founders, setFounders] = useState<FounderSuggestionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_SESSION_KEY);
    if (stored) setToken(stored);
  }, []);

  const load = useCallback(async () => {
    if (!token.trim()) return;
    setLoading(true);
    try {
      const data = await fetchAdminCommunity(token);
      setReviews(data.reviews);
      setFounders(data.founderSuggestions);
      const drafts: Record<string, string> = {};
      for (const f of data.founderSuggestions) {
        drafts[f.id] = f.adminReply ?? "";
      }
      setReplyDrafts(drafts);
    } catch {
      toast({ title: "Load failed", description: "Check your token and API URL.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) void load();
  }, [token, load]);

  const unlock = () => {
    const t = tokenInput.trim();
    if (!t) return;
    sessionStorage.setItem(TOKEN_SESSION_KEY, t);
    setToken(t);
  };

  const signOut = () => {
    sessionStorage.removeItem(TOKEN_SESSION_KEY);
    setToken("");
    setTokenInput("");
    setReviews([]);
    setFounders([]);
  };

  const saveReply = async (id: string) => {
    const text = replyDrafts[id]?.trim();
    if (!text || !token) return;
    try {
      const updated = await postAdminFounderReply(token, id, text);
      setFounders((prev) => prev.map((x) => (x.id === id ? updated : x)));
      toast({ title: "Reply saved", description: "Authors will benefit when you share summaries externally." });
    } catch {
      toast({ title: "Save failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-[100dvh] bg-muted/20 py-12 px-4 md:px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3 mb-8">
          <Shield className="h-10 w-10 text-primary shrink-0" />
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Community admin</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Paste the same token as <code className="text-xs bg-muted px-1 py-0.5 rounded">SAYBOOK_ADMIN_TOKEN</code> on your API server. Token stays in this browser tab only.
            </p>
          </div>
        </motion.div>

        {!token ? (
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Unlock
              </CardTitle>
              <CardDescription>Requires API env SAYBOOK_ADMIN_TOKEN (min 8 characters).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adm-token">Admin token</Label>
                <Input id="adm-token" type="password" autoComplete="off" value={tokenInput} onChange={(e) => setTokenInput(e.target.value)} />
              </div>
              <Button type="button" onClick={unlock}>
                Continue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>

            <Tabs defaultValue="founders" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="founders">Founder feedback</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="founders" className="mt-6 space-y-4">
                {founders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No founder submissions yet.</p>
                ) : (
                  founders.map((f) => (
                    <Card key={f.id} className="border-border/70">
                      <CardHeader className="pb-2">
                        <div className="flex flex-wrap gap-2 justify-between items-start">
                          <CardTitle className="text-base font-medium">
                            {f.authorName ?? "Anonymous"}
                            {f.email ? (
                              <span className="text-muted-foreground font-normal text-sm block">{f.email}</span>
                            ) : null}
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">{new Date(f.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-full">FAQ keyword hints</span>
                          {f.faqKeywords.length === 0 ? (
                            <span className="text-xs text-muted-foreground">—</span>
                          ) : (
                            f.faqKeywords.map((k) => (
                              <Badge key={k} variant="secondary" className="font-normal">
                                {k}
                              </Badge>
                            ))
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Writing problems</p>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{f.writingProblems}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Questions</p>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{f.questions}</p>
                        </div>
                        <div className="space-y-2 pt-2 border-t border-border/60">
                          <Label htmlFor={`reply-${f.id}`}>Your reply (saved with this submission)</Label>
                          <Textarea
                            id={`reply-${f.id}`}
                            rows={4}
                            value={replyDrafts[f.id] ?? ""}
                            onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [f.id]: e.target.value }))}
                            placeholder="Answer here for your records; wire email notifications later if you like."
                          />
                          <Button type="button" size="sm" onClick={() => void saveReply(f.id)}>
                            Save reply
                          </Button>
                          {f.adminReply && f.repliedAt ? (
                            <p className="text-xs text-muted-foreground">Last saved {new Date(f.repliedAt).toLocaleString()}</p>
                          ) : null}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews yet.</p>
                ) : (
                  reviews.map((r) => (
                    <Card key={r.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between gap-2 flex-wrap">
                          <CardTitle className="text-base">
                            {r.authorName ?? "Anonymous"} · {r.rating}/5
                          </CardTitle>
                          <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                        {r.email ? <p className="text-xs text-muted-foreground">{r.email}</p> : null}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.review}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
