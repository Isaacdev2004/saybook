import { useAppContext } from "@/lib/store";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, FileText, Lightbulb, BookOpen, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const ARC_DATA = [
  {
    id: "arc-1",
    label: "AWARENESS",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    lineColor: "border-amber-300",
    dotColor: "bg-amber-400",
    chapters: [
      { num: 1, title: "The Hidden Problem", sot: "Most people write books without a structure", syntax: "SYA", advice: "Start with a compelling story" },
      { num: 2, title: "The Double Helix Method", sot: "DHM solves structure through narrative tension", syntax: "ASA", advice: "Define your reader's transformation" },
      { num: 3, title: "Your Reader's Journey", sot: "Knowing your audience shapes every chapter", syntax: "YAA", advice: "Build empathy before solutions" },
    ],
  },
  {
    id: "arc-2",
    label: "RESOLUTION",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    lineColor: "border-blue-300",
    dotColor: "bg-blue-400",
    chapters: [
      { num: 4, title: "Framework in Action", sot: "Apply DHM to real chapter planning", syntax: "SYA", advice: "Map each chapter to a reader emotion" },
      { num: 5, title: "Overcoming Resistance", sot: "Writers face internal blocks before breakthroughs", syntax: "ASA", advice: "Address objections in chapter narrative" },
      { num: 6, title: "Momentum & Flow", sot: "Consistent narrative momentum keeps readers engaged", syntax: "YAA", advice: "End each chapter with a hook" },
    ],
  },
  {
    id: "arc-3",
    label: "CALL TO ACTION",
    color: "text-primary bg-primary/5 border-primary/20",
    lineColor: "border-primary/40",
    dotColor: "bg-primary",
    chapters: [
      { num: 7, title: "Commit to Your Voice", sot: "Authenticity is the author's greatest asset", syntax: "SYA", advice: "Use your personal story as the thread" },
      { num: 8, title: "Launch Your Book", sot: "Publishing is the beginning, not the end", syntax: "ASA", advice: "Prepare a launch sequence alongside writing" },
    ],
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const arcVariants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const chapterVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function Output() {
  const [, setLocation] = useLocation();
  const { bookData } = useAppContext();
  const [editedTitles, setEditedTitles] = useState<Record<number, string>>({});
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!bookData) setLocation("/dashboard");
  }, [bookData, setLocation]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!bookData) return null;

  const handleTitleEdit = (num: number, val: string) => {
    setEditedTitles((prev) => ({ ...prev, [num]: val }));
  };

  return (
    <div className="min-h-[100dvh] bg-background py-10 px-4 md:px-6 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10"
        >
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
          <motion.div whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" className="shadow-md shadow-primary/15" data-testid="button-download-pdf">
              <Download className="mr-2 h-5 w-5" />
              Download Editable PDF
            </Button>
          </motion.div>
        </motion.div>

        {/* Book summary card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 mb-14 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
            >
              <BookOpen className="h-7 w-7 text-primary" />
            </motion.div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground capitalize" data-testid="text-output-title">
              {bookData.title}
            </h1>
          </div>
          <div className="grid md:grid-cols-3 gap-6 relative">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Target Audience</p>
              <p className="text-foreground font-medium">{bookData.audience}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Genre</p>
              <p className="text-foreground font-medium capitalize">{bookData.genre}</p>
            </div>
            <div className="md:col-span-3 pt-5 border-t border-border/50">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">Main Goal / Message</p>
              <p className="text-foreground text-lg leading-relaxed font-serif italic">"{bookData.goal}"</p>
            </div>
          </div>
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-between mb-10"
        >
          <h2 className="font-serif text-2xl md:text-3xl font-bold">Double Helix Map Structure</h2>
          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 text-xs font-semibold uppercase tracking-wider px-3 py-1">
            DHM Generated
          </Badge>
        </motion.div>

        {/* ARC Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16"
        >
          {ARC_DATA.map((arc, arcIndex) => (
            <motion.div key={arc.id} variants={arcVariants}>
              {/* ARC Header */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${arc.color}`}>
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: "currentColor" }} />
                  {arc.label}
                </div>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">
                  Ch {arc.chapters[0].num}–{arc.chapters[arc.chapters.length - 1].num}
                </span>
              </div>

              {/* Chapter cards with connecting line */}
              <div className="relative pl-5 md:pl-8">
                <div className={`absolute left-0 top-3 bottom-3 w-px ${arc.lineColor} border-l-2`} />

                <motion.div
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="space-y-5"
                >
                  {arc.chapters.map((chapter) => (
                    <motion.div key={chapter.num} variants={chapterVariants} className="relative">
                      {/* Connector dot */}
                      <div className={`absolute -left-8 md:-left-11 top-6 w-3 h-3 rounded-full ${arc.dotColor} border-2 border-background shadow-sm`} />

                      <motion.div
                        whileHover={{ x: 4, boxShadow: "0 8px 30px -6px rgba(0,0,0,0.12)" }}
                        transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      >
                        <Card
                          className="border-border/70 overflow-hidden group cursor-default"
                          data-testid={`card-chapter-${chapter.num}`}
                        >
                          <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background text-xs font-bold font-mono">
                                    {chapter.num}
                                  </span>
                                  <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${arc.color} border`}>
                                    {arc.label.split(" ")[0]}
                                  </span>
                                </div>
                                <Input
                                  value={editedTitles[chapter.num] !== undefined ? editedTitles[chapter.num] : chapter.title}
                                  onChange={(e) => handleTitleEdit(chapter.num, e.target.value)}
                                  className="font-serif text-xl font-bold bg-transparent border-transparent px-0 h-auto rounded-none focus-visible:ring-0 focus-visible:border-b focus-visible:border-foreground/30 transition-all placeholder:text-muted-foreground"
                                  data-testid={`input-chapter-title-${chapter.num}`}
                                />
                              </div>
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="shrink-0 flex items-center h-9 px-3 rounded-lg bg-background border border-border text-foreground font-mono text-xs font-bold shadow-sm"
                                title="Narrative Syntax"
                              >
                                {chapter.syntax}
                              </motion.div>
                            </div>
                          </CardHeader>

                          <CardContent className="pt-5 grid sm:grid-cols-2 gap-6">
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.15 }}
                            >
                              <div className="flex items-center gap-2 mb-2.5 text-sm font-semibold text-foreground">
                                <FileText className="h-4 w-4 text-primary" />
                                Statement of Theme
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed pl-5 border-l-2 border-primary/20">
                                {chapter.sot}
                              </p>
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.22 }}
                            >
                              <div className="flex items-center gap-2 mb-2.5 text-sm font-semibold text-foreground">
                                <Lightbulb className="h-4 w-4 text-primary" />
                                Editorial Advice
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed pl-5 border-l-2 border-border">
                                {chapter.advice}
                              </p>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="h-20" />
      </div>

      {/* Scroll to top FAB */}
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
