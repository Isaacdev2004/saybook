import { useAppContext } from "@/lib/store";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DHMOutput } from "@/components/DHMOutput";
import { DHM_ENGINE_VERSION, listBookStoryParagraphs, normalizePlan, type DHMResult } from "@workspace/dhm-engine";
import { requestDhmGeneration } from "@/lib/dhmApi";
import { Download, RefreshCw, BookOpen, ArrowUp, Sparkles, TrendingUp, FileType2 } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { downloadDHMPdf } from "@/lib/exportDHMPdf";
import { downloadDHMDocx } from "@/lib/exportDHMDocx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function dhmMatchesCurrentEngine(dhm: DHMResult | undefined): boolean {
  if (!dhm || typeof dhm.storyOfThesis !== "string") return false;
  if (dhm.dhmEngineVersion !== DHM_ENGINE_VERSION) return false;
  const all = [...dhm.arc.awareness, ...dhm.arc.resolution, ...dhm.arc.callToAction];
  if (all.length === 0) return true;
  const ch = all[0];
  return (
    typeof ch.chapterStoryOfThesis === "string" &&
    Array.isArray(ch.strands) &&
    ch.strands.length > 0 &&
    typeof ch.strands[0]?.strandThesis === "string"
  );
}

export default function Output() {
  const [, setLocation] = useLocation();
  const { bookData, setBookData } = useAppContext();
  const [editedTitles, setEditedTitles] = useState<Record<number, string>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookData) setLocation("/dashboard");
  }, [bookData, setLocation]);

  useEffect(() => {
    if (!bookData || dhmMatchesCurrentEngine(bookData.dhm)) return;
    let cancelled = false;
    setRefreshing(true);
    setRefreshError(null);
    void requestDhmGeneration({
      title: bookData.title,
      audience: bookData.audience,
      goal: bookData.goal,
      genre: bookData.genre,
      plan: bookData.plan,
      chapterSyntaxMatrix: bookData.chapterSyntaxMatrix,
      syntaxVaryPerChapter: bookData.syntaxVaryPerChapter !== false,
      syntaxAlwaysLeadWithStory: bookData.syntaxAlwaysLeadWithStory === true,
    })
      .then((dhm) => {
        if (cancelled) return;
        setBookData({ ...bookData, dhm });
      })
      .catch((err) => {
        if (cancelled) return;
        setRefreshError(err instanceof Error ? err.message : "Could not refresh this outline.");
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bookData, setBookData]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTitleEdit = useCallback((num: number, val: string) => {
    setEditedTitles((prev) => ({ ...prev, [num]: val }));
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!bookData) return;
    setEditedTitles({});
    setRefreshing(true);
    setRefreshError(null);
    void requestDhmGeneration({
      title: bookData.title,
      audience: bookData.audience,
      goal: bookData.goal,
      genre: bookData.genre,
      plan: bookData.plan,
      chapterSyntaxMatrix: bookData.chapterSyntaxMatrix,
      syntaxVaryPerChapter: bookData.syntaxVaryPerChapter !== false,
      syntaxAlwaysLeadWithStory: bookData.syntaxAlwaysLeadWithStory === true,
    })
      .then((dhm) => setBookData({ ...bookData, dhm }))
      .catch((err) =>
        setRefreshError(err instanceof Error ? err.message : "Could not regenerate this outline."),
      )
      .finally(() => setRefreshing(false));
  }, [bookData, setBookData]);

  const handleDownloadPdf = useCallback(() => {
    if (!bookData?.dhm) return;
    downloadDHMPdf(bookData, bookData.dhm, editedTitles);
  }, [bookData, editedTitles]);

  const handleDownloadDocx = useCallback(async () => {
    if (!bookData?.dhm) return;
    await downloadDHMDocx(bookData, bookData.dhm, editedTitles);
  }, [bookData, editedTitles]);

  if (!bookData) return null;
  const outlineReady = Boolean(bookData.dhm && dhmMatchesCurrentEngine(bookData.dhm));
  if (!outlineReady) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[100dvh] flex items-center justify-center px-6"
      >
        <motion.div className="max-w-md text-center space-y-4">
          {refreshing ? (
            <>
              <p className="text-lg font-medium">Generating your Double Helix Map…</p>
              <p className="text-sm text-muted-foreground">
                Gemini runs on the API server and may take up to a minute.
              </p>
            </>
          ) : null}
          {refreshError ? (
            <>
              <p className="text-lg font-medium">Outline generation failed</p>
              <p className="text-sm text-destructive">{refreshError}</p>
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </>
          ) : null}
        </motion.div>
      </motion.div>
    );
  }

  const dhm = bookData.dhm!;
  const planKey = normalizePlan(bookData.plan);
  const revisionLabel =
    dhm.revisionAllowance === "custom"
      ? "Custom structure (Founders)"
      : `${dhm.revisionAllowance} revision${dhm.revisionAllowance === 1 ? "" : "s"} (plan allowance)`;

  return (
    <div className="min-h-[100dvh] bg-background py-10 px-4 md:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ x: -2 }} transition={{ type: "spring", stiffness: 400 }}>
              <Button
                variant="ghost"
                onClick={() => setLocation("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
                data-testid="button-start-over"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Start Over
              </Button>
            </motion.div>
            <Button variant="outline" onClick={handleRegenerate} data-testid="button-regenerate-dhm">
              <Sparkles className="mr-2 h-4 w-4" />
              Regenerate outline
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
              <Button
                size="lg"
                type="button"
                variant="outline"
                className="shadow-md shadow-primary/10 w-full sm:w-auto"
                data-testid="button-download-pdf"
                onClick={handleDownloadPdf}
              >
                <Download className="mr-2 h-5 w-5" />
                Download PDF
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }} className="flex-1 sm:flex-none">
              <Button
                size="lg"
                type="button"
                className="shadow-md shadow-primary/15 w-full sm:w-auto"
                data-testid="button-download-docx"
                onClick={() => void handleDownloadDocx()}
              >
                <FileType2 className="mr-2 h-5 w-5" />
                MS Word–ready (.docx)
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {planKey === "basic" && (
          <Alert className="mb-10 border-primary/25 bg-primary/5">
            <TrendingUp className="h-4 w-4 text-primary" />
            <AlertTitle>Upgrade to unlock more chapters</AlertTitle>
            <AlertDescription className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
              <span>
                Your Basic plan includes <strong>{dhm.chapterLimit} chapters</strong>. Standard includes 7 and Founders includes 9 — upgrade when you are ready for a deeper DHM map.
              </span>
              <Button variant="secondary" size="sm" className="shrink-0" asChild>
                <Link href="/#pricing">View pricing</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 mb-14 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="flex flex-wrap items-center gap-3 mb-6 relative">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <BookOpen className="h-7 w-7 text-primary" />
            </motion.div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground capitalize flex-1 min-w-[12rem]" data-testid="text-output-title">
              {bookData.title}
            </h1>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold uppercase tracking-wider">
              {planKey} · {dhm.chapterLimit} chapters
            </Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Target Audience</p>
              <p className="text-foreground font-medium">{bookData.audience}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Genre</p>
              <p className="text-foreground font-medium capitalize">{bookData.genre}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Chapter syntax template</p>
              <p className="text-foreground font-medium font-mono text-sm">{dhm.chapterSyntaxMatrix}</p>
              {bookData.syntaxVaryPerChapter !== false ? (
                <p className="text-xs text-muted-foreground mt-1.5 leading-snug">
                  Each chapter card shows its own matrix when “vary by chapter” is on.
                  {bookData.syntaxAlwaysLeadWithStory
                    ? " Story lock: each chapter opens with Story—only the first strand is S‑first."
                    : ""}
                </p>
              ) : null}
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Plan allowance</p>
              <p className="text-foreground font-medium">{revisionLabel}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-4 pt-5 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Main Goal / Message</p>
              <p className="text-foreground text-lg leading-relaxed font-serif italic">"{bookData.goal}"</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-wrap items-center justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold">Double Helix Map Structure</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              Strand thesis lines are woven verbatim into each chapter summary; those summaries are woven into the book‑level Story of Thesis. SAY themes stay in plain language and do not repeat your title or main goal.
            </p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold uppercase tracking-wider px-3 py-1 shrink-0">
            DHM Generated
          </Badge>
        </motion.div>

        <DHMOutput arc={dhm.arc} editedTitles={editedTitles} onTitleEdit={handleTitleEdit} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="mt-16"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-md">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Story of Thesis</CardTitle>
              <CardDescription>
                One paragraph built by joining every chapter’s Story of Thesis summary in order (discourse markers only between chapters). Strand thesis wording stays intact inside each chapter summary. Export to PDF or MS Word (.docx) for workshops or editors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {listBookStoryParagraphs(dhm).map((paragraph, index) => (
                <p
                  key={index}
                  className="text-foreground leading-relaxed font-serif text-lg md:text-xl tracking-tight text-justify"
                >
                  {paragraph}
                </p>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <div className="h-20 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/community/reviews" className="hover:text-foreground underline-offset-4 hover:underline">Leave a review</Link>
          <Link href="/community/founders" className="hover:text-foreground underline-offset-4 hover:underline">Founders lab</Link>
        </div>
      </div>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            key="scroll-top"
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 16 }}
            transition={{ type: "spring", stiffness: 350, damping: 22 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-foreground text-background shadow-xl flex items-center justify-center hover:bg-foreground/80 transition-colors"
            data-testid="button-scroll-top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
