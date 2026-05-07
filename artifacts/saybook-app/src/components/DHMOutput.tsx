import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookMarked, FileText, Layers } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { DHMArc, DHMChapter } from "@workspace/dhm-engine";

/** Narrow keyof DHMArc for stable React keys (TS keyof inference quirks). */
type ArcSectionKey = keyof DHMArc & ("awareness" | "resolution" | "callToAction");

const ARC_SECTIONS: {
  key: ArcSectionKey;
  label: string;
  color: string;
  lineColor: string;
  dotColor: string;
}[] = [
  {
    key: "awareness",
    label: "AWARENESS",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    lineColor: "border-amber-300",
    dotColor: "bg-amber-400",
  },
  {
    key: "resolution",
    label: "RESOLUTION",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    lineColor: "border-blue-300",
    dotColor: "bg-blue-400",
  },
  {
    key: "callToAction",
    label: "CALL TO ACTION",
    color: "text-primary bg-primary/5 border-primary/20",
    lineColor: "border-primary/40",
    dotColor: "bg-primary",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const arcVariants = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const chapterVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

export interface DHMOutputProps {
  arc: DHMArc;
  editedTitles: Record<number, string>;
  onTitleEdit: (chapterNum: number, value: string) => void;
}

export function DHMOutput({ arc, editedTitles, onTitleEdit }: DHMOutputProps) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-16">
      {ARC_SECTIONS.map((section) => {
        const chapters = arc[section.key] as DHMChapter[];
        if (chapters.length === 0) return null;

        return (
          <motion.div key={section.key} variants={arcVariants}>
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${section.color}`}
              >
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: "currentColor" }} />
                {section.label}
              </div>
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium">
                Ch {chapters[0].num}–{chapters[chapters.length - 1].num}
              </span>
            </div>

            <div className="relative pl-5 md:pl-8">
              <div className={`absolute left-0 top-3 bottom-3 w-px ${section.lineColor} border-l-2`} />

              <motion.div
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="space-y-5"
              >
                {chapters.map((chapter) => (
                  <motion.div key={chapter.num} variants={chapterVariants} className="relative">
                    <div
                      className={`absolute -left-8 md:-left-11 top-6 w-3 h-3 rounded-full ${section.dotColor} border-2 border-background shadow-sm`}
                    />

                    <motion.div
                      whileHover={{ x: 4, boxShadow: "0 8px 30px -6px rgba(0,0,0,0.12)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    >
                      <Card className="border-border/70 overflow-hidden group cursor-default" data-testid={`card-chapter-${chapter.num}`}>
                        <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-[12rem]">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-foreground text-background text-xs font-bold font-mono">
                                  {chapter.num}
                                </span>
                                <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-0.5 rounded ${section.color} border`}>
                                  {section.label.split(" ")[0]}
                                </span>
                              </div>
                              <Input
                                value={editedTitles[chapter.num] !== undefined ? editedTitles[chapter.num] : chapter.title}
                                onChange={(e) => onTitleEdit(chapter.num, e.target.value)}
                                className="font-serif text-xl font-bold bg-transparent border-transparent px-0 h-auto rounded-none focus-visible:ring-0 focus-visible:border-b focus-visible:border-foreground/30 transition-all placeholder:text-muted-foreground"
                                data-testid={`input-chapter-title-${chapter.num}`}
                              />
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className="shrink-0 flex flex-col items-end gap-1"
                              title="Full chapter syntax matrix (strands separated by /)"
                            >
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Syntax matrix</span>
                              <div className="flex items-center min-h-9 px-3 rounded-lg bg-background border border-border text-foreground font-mono text-xs font-bold shadow-sm max-w-[220px] text-right break-all">
                                {chapter.chapterSyntaxMatrix}
                              </div>
                            </motion.div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-5 space-y-6">
                          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
                            <div className="flex items-center gap-2 mb-2.5 text-sm font-semibold text-foreground">
                              <BookMarked className="h-4 w-4 text-primary" />
                              Chapter Theme
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-5 border-l-2 border-primary/20">{chapter.chapterTheme}</p>
                          </motion.div>

                          <div className="space-y-5">
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                              <Layers className="h-3.5 w-3.5" />
                              Strands & SAY points
                            </div>
                            {chapter.strands.map((strand) => (
                              <div
                                key={`${chapter.num}-${strand.index}`}
                                className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-4"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">Strand {strand.index}</span>
                                  <span className="font-mono text-sm font-bold px-2 py-0.5 rounded bg-background border border-border">{strand.pattern}</span>
                                  <span className="text-xs text-muted-foreground">· three SAY letters = one subheading block</span>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-3">
                                  {strand.points.map((pt, idx) => (
                                    <div
                                      key={`${chapter.num}-${strand.index}-${idx}`}
                                      className="rounded-lg border border-border/60 bg-background p-3 shadow-sm"
                                    >
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold">
                                          {pt.code}
                                        </span>
                                        <span className="text-xs font-semibold text-foreground leading-tight">{pt.label}</span>
                                      </div>
                                      <p className="text-xs font-medium text-foreground mb-1.5">Point theme</p>
                                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{pt.pointTheme}</p>
                                      <div className="flex items-start gap-1.5 text-muted-foreground">
                                        <FileText className="h-3 w-3 shrink-0 mt-0.5" />
                                        <p className="text-xs leading-relaxed">{pt.guidance}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
