import { useAppContext } from "@/lib/store";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, RefreshCw, FileText, ArrowRight, Lightbulb, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

const ARC_DATA = [
  {
    id: "arc-1",
    title: "ARC Part 1 — AWARENESS",
    description: "Establishing the premise and the reader's journey.",
    chapters: [
      { num: 1, title: "The Hidden Problem", sot: "Most people write books without a structure", syntax: "SYA", advice: "Start with a compelling story" },
      { num: 2, title: "The Double Helix Method", sot: "DHM solves structure through narrative tension", syntax: "ASA", advice: "Define your reader's transformation" },
      { num: 3, title: "Your Reader's Journey", sot: "Knowing your audience shapes every chapter", syntax: "YAA", advice: "Build empathy before solutions" },
    ]
  },
  {
    id: "arc-2",
    title: "ARC Part 2 — RESOLUTION",
    description: "Providing the framework and overcoming friction.",
    chapters: [
      { num: 4, title: "Framework in Action", sot: "Apply DHM to real chapter planning", syntax: "SYA", advice: "Map each chapter to a reader emotion" },
      { num: 5, title: "Overcoming Resistance", sot: "Writers face internal blocks before breakthroughs", syntax: "ASA", advice: "Address objections in chapter narrative" },
      { num: 6, title: "Momentum & Flow", sot: "Consistent narrative momentum keeps readers engaged", syntax: "YAA", advice: "End each chapter with a hook" },
    ]
  },
  {
    id: "arc-3",
    title: "ARC Part 3 — CALL TO ACTION",
    description: "Empowering the reader to execute.",
    chapters: [
      { num: 7, title: "Commit to Your Voice", sot: "Authenticity is the author's greatest asset", syntax: "SYA", advice: "Use your personal story as the thread" },
      { num: 8, title: "Launch Your Book", sot: "Publishing is the beginning, not the end", syntax: "ASA", advice: "Prepare a launch sequence alongside writing" },
    ]
  }
];

export default function Output() {
  const [, setLocation] = useLocation();
  const { bookData } = useAppContext();
  
  // Local state for inline editing of chapter titles
  const [editedTitles, setEditedTitles] = useState<Record<number, string>>({});

  useEffect(() => {
    // If someone visits /output directly without filling the form, send them back
    if (!bookData) {
      setLocation("/dashboard");
    }
  }, [bookData, setLocation]);

  if (!bookData) return null;

  const handleTitleEdit = (num: number, newTitle: string) => {
    setEditedTitles(prev => ({ ...prev, [num]: newTitle }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-[100dvh] bg-background py-12 px-4 md:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="text-muted-foreground hover:text-foreground" data-testid="button-start-over">
            <RefreshCw className="mr-2 h-4 w-4" />
            Start Over
          </Button>
          <Button size="lg" className="shadow-md" data-testid="button-download-pdf">
            <Download className="mr-2 h-5 w-5" />
            Download Editable PDF
          </Button>
        </div>

        {/* Book Details Summary */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border shadow-sm rounded-2xl p-6 md:p-8 mb-12"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-foreground capitalize" data-testid="text-output-title">
              {bookData.title}
            </h1>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Target Audience</p>
              <p className="text-foreground font-medium">{bookData.audience}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">Genre</p>
              <p className="text-foreground font-medium capitalize">{bookData.genre}</p>
            </div>
            <div className="md:col-span-3 pt-4 border-t border-border/50">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Main Goal / Message</p>
              <p className="text-foreground text-lg leading-relaxed font-serif italic">"{bookData.goal}"</p>
            </div>
          </div>
        </motion.div>

        {/* DHM Outline Structure */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-serif text-2xl font-bold">Double Helix Map Structure</h2>
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">DHM Generated</Badge>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-12"
          >
            {ARC_DATA.map((arc) => (
              <motion.div key={arc.id} variants={itemVariants} className="relative">
                {/* ARC Section Header */}
                <div className="sticky top-16 z-10 bg-background/95 backdrop-blur py-4 mb-4 border-b border-border">
                  <h3 className="font-serif text-xl font-bold text-foreground">{arc.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{arc.description}</p>
                </div>

                <div className="grid gap-6 pl-4 md:pl-8 border-l-2 border-primary/20 ml-2 md:ml-4">
                  {arc.chapters.map((chapter) => (
                    <Card key={chapter.num} className="relative shadow-sm border-border overflow-hidden hover:border-primary/40 transition-colors group" data-testid={`card-chapter-${chapter.num}`}>
                      {/* Decorative connecting line */}
                      <div className="absolute top-8 -left-5 w-5 h-px bg-primary/20" />
                      
                      <CardHeader className="pb-3 bg-muted/30">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge className="bg-foreground text-background hover:bg-foreground/90 rounded-sm px-2">CH {chapter.num}</Badge>
                              <Badge variant="outline" className="border-border text-muted-foreground text-xs uppercase tracking-widest">{arc.title.split('—')[0].trim()}</Badge>
                            </div>
                            <Input 
                              value={editedTitles[chapter.num] !== undefined ? editedTitles[chapter.num] : chapter.title}
                              onChange={(e) => handleTitleEdit(chapter.num, e.target.value)}
                              className="font-serif text-xl font-bold bg-transparent border-transparent px-0 h-auto rounded-none focus-visible:ring-0 focus-visible:border-primary focus-visible:border-b transition-all"
                              data-testid={`input-chapter-title-${chapter.num}`}
                            />
                          </div>
                          <div className="shrink-0 flex items-center h-8 px-2.5 rounded-md bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20" title="Narrative Syntax">
                            {chapter.syntax}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 grid sm:grid-cols-2 gap-6">
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                            <FileText className="h-4 w-4 text-primary" />
                            Statement of Theme (SOT)
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed pl-6 border-l border-border">{chapter.sot}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-foreground">
                            <Lightbulb className="h-4 w-4 text-primary" />
                            Editorial Advice
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed pl-6 border-l border-border">{chapter.advice}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Bottom CTA */}
        <div className="flex justify-center pb-20">
          <Button variant="outline" size="lg" className="h-14 px-8 text-base border-primary/30 hover:bg-primary/5" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            Back to Top
          </Button>
        </div>
      </div>
    </div>
  );
}
