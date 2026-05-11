import type { BookContext } from "./bookContext";
import type { SAYCode } from "./syntax";

export interface SayPour {
  theme: string;
  guidance: string;
}

export interface StrandPlan {
  thesis: string;
  S: SayPour[];
  Y: SayPour[];
  A: SayPour[];
}

export interface ChapterPlan {
  title: string;
  strands: StrandPlan[];
}

function pour(theme: string, guidance: string): SayPour {
  return { theme, guidance };
}

function padStrands(strands: StrandPlan[], count: number): StrandPlan[] {
  if (strands.length === 0) return strands;
  const out = [...strands];
  while (out.length < count) {
    const src = out[out.length % strands.length]!;
    out.push({
      thesis: src.thesis,
      S: [...src.S],
      Y: [...src.Y],
      A: [...src.A],
    });
  }
  return out;
}

function entrepreneurAiChapter(globalIdx: number, ctx: BookContext): ChapterPlan {
  const aud = ctx.audienceLabel;
  const partner = ctx.partnerLabel;
  const promise = ctx.promise;

  const chapters: ChapterPlan[] = [
    {
      title: "The Silicon Handshake",
      strands: [
        {
          thesis: `For ${aud}, the first real partnership with a ${partner} starts when routine digital work leaves the founder’s hands.`,
          S: [
            pour(
              `Open on a founder buried in inbox triage, scheduling, and shallow research who nearly misses a funding conversation because “busy” work crowded out leadership time.`,
              `Keep one clock, one inbox, and one external deadline in frame; end on the moment they delegate triage to a ${partner}.`,
            ),
          ],
          Y: [
            pour(
              `Cite research on task-switching cost and time lost to coordination work; show how delegated triage can return a double-digit share of weekly focus hours.`,
              `Name the study type, sample, and what the number does not prove before you claim bandwidth gains.`,
            ),
          ],
          A: [
            pour(
              `Stop treating the ${partner} as a search box; write three SOPs you would hand a chief of staff and translate each into a reusable system prompt.`,
              `List trigger, tool, and output format for each SOP so ${aud} can test the workflow in one afternoon.`,
            ),
          ],
        },
        {
          thesis: `A ${partner} earns trust when founders define handoffs the way they would for a human assistant.`,
          S: [
            pour(
              `Show a calendar collision where the founder explains the same weekly review three times because nothing was documented for the ${partner}.`,
              `Contrast the chaotic week with the next week after a one-page handoff sheet exists.`,
            ),
          ],
          Y: [
            pour(
              `Compare teams that document assistant workflows versus teams that improvise prompts; highlight error rate and rework time.`,
              `Pair one qualitative quote from an operator with one operational metric.`,
            ),
          ],
          A: [
            pour(
              `Draft a “digital chief of staff” charter: scope, forbidden actions, escalation path, and weekly review ritual.`,
              `Cap the charter at one page; include one example of a request the ${partner} should refuse.`,
            ),
          ],
        },
        {
          thesis: `Offloading cognitive load on routine operations is the practical first step toward ${promise}.`,
          S: [
            pour(
              `Follow a founder who keeps answering the same customer FAQs until a ${partner}-drafted response library frees an afternoon for product calls.`,
              `Land on a visible before/after calendar, not a morale speech.`,
            ),
          ],
          Y: [
            pour(
              `Report how much repetitive Q&A volume typical small teams handle weekly and what portion can be templated safely.`,
              `Note limits: when human judgment must stay in the loop.`,
            ),
          ],
          A: [
            pour(
              `Pick one repetitive workflow to automate this week; define success as time returned, not tools adopted.`,
              `Schedule a Friday audit: what got faster, what still needs a human owner.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Logic Factory",
      strands: [
        {
          thesis: `Scalable companies treat the ${partner} as connective tissue that turns scattered ideas into usable intellectual property.`,
          S: [
            pour(
              `Tell the story of a visionary with dozens of half-finished concepts until structured prompts help reunite notes into one product story.`,
              `Show messy inputs (voice memos, slides, chats) becoming one outline the founder can defend.`,
            ),
          ],
          Y: [
            pour(
              `Profile lean teams that ship more documented IP per headcount than labor-heavy peers.`,
              `Define “IP output” in plain terms: playbooks, frameworks, customer assets.`,
            ),
          ],
          A: [
            pour(
              `Add an inquiry phase: ask the ${partner} to stress-test logic, name gaps, and argue the counter-case before you publish.`,
              `Use a red-team prompt that must surface at least three weaknesses.`,
            ),
          ],
        },
        {
          thesis: `A logic factory only works when founders feed it structured questions instead of vague inspiration.`,
          S: [
            pour(
              `Scene: a strategy offsite where every brainstorm dies in a doc graveyard until a ${partner} turns raw bullets into decision trees.`,
              `End when the team picks one branch to execute.`,
            ),
          ],
          Y: [
            pour(
              `Summarize evidence that system-strong startups keep lower coordination overhead as they scale.`,
              `Contrast “more hires” versus “clearer systems” as the growth lever.`,
            ),
          ],
          A: [
            pour(
              `Build a three-step capture habit: dump, classify, reunite—each step with a named owner and file location.`,
              `Ban new tools until the reunite step works twice in a row.`,
            ),
          ],
        },
        {
          thesis: `When frameworks survive machine challenge, ${aud} can scale judgment without scaling headcount.`,
          S: [
            pour(
              `Show a founder presenting a framework to investors after the ${partner} exposed a hidden assumption they fixed pre-meeting.`,
              `Let the fix be specific, not a generic “AI helped.”`,
            ),
          ],
          Y: [
            pour(
              `Offer before/after metrics on rework cycles when drafts pass a structured review pass first.`,
              `State what was measured and for how long.`,
            ),
          ],
          A: [
            pour(
              `Create a friction partner checklist: assumption, counterexample, missing stakeholder, failure mode.`,
              `Run it on the next memo before it leaves your desk.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Infinite Researcher",
      strands: [
        {
          thesis: `Modern advantage comes from synthesizing global signals into local moves faster than quarterly reporting cycles.`,
          S: [
            pour(
              `A manufacturer spots a demand shift months early because a ${partner} synthesizes global chatter while rivals wait for industry PDFs.`,
              `Show the pivot decision meeting, not the scraping mechanics.`,
            ),
          ],
          Y: [
            pour(
              `Compare cycle time for manual market scans versus assisted synthesis on comparable decisions.`,
              `Report speed and error trade-offs honestly.`,
            ),
          ],
          A: [
            pour(
              `Task the ${partner} with deep synthesis: find contradictions in market narratives and list two “blue ocean” hypotheses to test.`,
              `Require citations or source labels for every claim used in a decision.`,
            ),
          ],
        },
        {
          thesis: `Speed without synthesis is noise; the ${partner} must compress evidence into decisions ${aud} can act on.`,
          S: [
            pour(
              `Follow a product lead drowning in articles until a weekly synthesis memo highlights only three actionable tensions.`,
              `Show them declining a trendy move because the memo flagged weak demand proof.`,
            ),
          ],
          Y: [
            pour(
              `Explain information decay: how fast category assumptions go stale in volatile markets.`,
              `Tie decay rate to review cadence recommendations.`,
            ),
          ],
          A: [
            pour(
              `Stand up a “signal desk” ritual: sources, confidence tags, and one recommended experiment per week.`,
              `Archive rejected signals so you do not re-litigate them.`,
            ),
          ],
        },
        {
          thesis: `Localized strategy emerges when global patterns are translated into offers your customers will pay for now.`,
          S: [
            pour(
              `Retail founder tests a micro-offer built from overseas trends the ${partner} mapped to local buyer language.`,
              `Include a small win and one failed translation.`,
            ),
          ],
          Y: [
            pour(
              `Cite cases where faster research cycles correlated with earlier product pivots and revenue recovery.`,
              `Separate correlation from guaranteed outcomes.`,
            ),
          ],
          A: [
            pour(
              `Define a 48-hour research sprint template: question, sources, synthesis, customer test, kill criteria.`,
              `Run it before the next pricing or positioning change.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Frictionless Operator",
      strands: [
        {
          thesis: `Freedom arrives when operations keep running without the founder in every thread.`,
          S: [
            pour(
              `Founder takes a two-week unplugged break while ${partner}-assisted systems qualify leads, answer tier-one requests, and ship weekly summaries.`,
              `Show one surprise handled well and one escalated correctly.`,
            ),
          ],
          Y: [
            pour(
              `Compare burnout and retention data for founder-dependent shops versus shops with documented operational backbones.`,
              `Use ranges if exact figures vary by sector.`,
            ),
          ],
          A: [
            pour(
              `Design a system-dependent plan: triggers the ${partner} may run, hard stops, and human approval gates.`,
              `Optimize for system flex over heroics in the founder’s inbox.`,
            ),
          ],
        },
        {
          thesis: `Automation should remove repetitive triggers, not remove accountability from ${aud}.`,
          S: [
            pour(
              `Night-and-weekend ping crisis resolves when alerts route through a ${partner} triage script instead of the founder’s phone.`,
              `Make the escalation path visible in the scene.`,
            ),
          ],
          Y: [
            pour(
              `Summarize ticket volume patterns that usually justify automated first responses versus human-first handling.`,
              `Note customer satisfaction risks of over-automation.`,
            ),
          ],
          A: [
            pour(
              `Map one customer journey end to end; mark steps the ${partner} may own, steps that stay human, and weekly QA checks.`,
              `Assign an owner for monitoring misroutes.`,
            ),
          ],
        },
        {
          thesis: `Founder independence is a design outcome, not a vacation fantasy.`,
          S: [
            pour(
              `Team runs a mock “founder absent” week; gaps surface in reporting, pricing exceptions, and partner comms.`,
              `Close on the single gap they fix first.`,
            ),
          ],
          Y: [
            pour(
              `Report how many small businesses stall when knowledge lives only in the founder’s head.`,
              `Pair with examples of lightweight documentation that fixed handoffs.`,
            ),
          ],
          A: [
            pour(
              `Publish a one-page business heartbeat dashboard the ${partner} updates and humans audit every Monday.`,
              `Limit to five metrics that predict drift early.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Creative Catalyst",
      strands: [
        {
          thesis: `The ${partner} should scaffold creativity so founders build higher without surrendering voice.`,
          S: [
            pour(
              `Writer facing a blank page uses structured prompts so the ${partner} unravels ideas they reunite in their own tone.`,
              `Show rejected machine lines and the keeper lines in the founder’s voice.`,
            ),
          ],
          Y: [
            pour(
              `Summarize studies on augmented brainstorming: teams with disciplined AI partners versus solo ideation.`,
              `Clarify what “higher-rated concepts” measured.`,
            ),
          ],
          A: [
            pour(
              `Run collaborative ideation: generate many weak options on purpose, then select one thread to develop with human editing rules.`,
              `Write a “never publish raw” rule and a voice checklist.`,
            ),
          ],
        },
        {
          thesis: `Creativity scales when machines expand schema while humans keep taste and final authorship.`,
          S: [
            pour(
              `Product team stuck in one niche uses cross-domain prompts to see a bundle offer hiding in adjacent customer jobs.`,
              `Keep the human “no” that prevented a off-brand launch.`,
            ),
          ],
          Y: [
            pour(
              `Offer examples where cross-field analogies sparked offers, with revenue or retention follow-up where available.`,
              `Flag survivorship bias if examples are cherry-picked.`,
            ),
          ],
          A: [
            pour(
              `Hold a structured divergence session: two unrelated fields, ten forced connections, one experiment worth funding.`,
              `Time-box synthesis so the team ships a test brief same day.`,
            ),
          ],
        },
        {
          thesis: `For ${aud}, the win is faster iteration on ideas customers can feel—not machine-generated filler.`,
          S: [
            pour(
              `Founder tests three positioning lines drafted with ${partner} help; customer interviews eliminate two in 48 hours.`,
              `End on the line customers repeated back unprompted.`,
            ),
          ],
          Y: [
            pour(
              `Compare cycle time from concept to tested message with and without assisted drafting.`,
              `Include qualitative buyer language, not only speed.`,
            ),
          ],
          A: [
            pour(
              `Adopt a “draft fast, judge slow” rule: machine drafts, humans score against a rubric tied to buyer anxiety and proof.`,
              `Publish the rubric beside your prompt library.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Ethical Auditor",
      strands: [
        {
          thesis: `Partnering with a ${partner} demands an authority audit so speed never trades away integrity.`,
          S: [
            pour(
              `Founder publishes a stat the ${partner} invented; reputation damage leads to a verification loop before anything ships externally.`,
              `Show the correction message, not only the embarrassment.`,
            ),
          ],
          Y: [
            pour(
              `Overview transparency risks in generative tools and how retrieval-grounding reduces hallucinated claims.`,
              `Define terms like grounding in plain language.`,
            ),
          ],
          A: [
            pour(
              `Institute a SAY audit on outbound work: story intent, advice scope, and evidence sources each get a human sign-off.`,
              `Never ship external numbers without a second check.`,
            ),
          ],
        },
        {
          thesis: `Supervision is part of the partnership; the ${partner} proposes, the founder qualifies.`,
          S: [
            pour(
              `Sales deck almost includes a fabricated logo slide caught by a junior reviewer using a simple evidence checklist.`,
              `Highlight the cultural norm, not hero vigilance.`,
            ),
          ],
          Y: [
            pour(
              `Collect examples of public AI mistakes in business contexts and classify failure type: data, reasoning, or policy.`,
              `Use them as guardrail training, not gossip.`,
            ),
          ],
          A: [
            pour(
              `Create a verification loop: claim, source, date, owner, and customer-facing wording review.`,
              `Store approved claims in a living source library.`,
            ),
          ],
        },
        {
          thesis: `Trust compounds when ${aud} treat machine output as draft intelligence, not finished authority.`,
          S: [
            pour(
              `Compliance-sensitive founder slows one launch to ground answers in vetted documents; short-term delay prevents long-term distrust.`,
              `Quantify the delay in days, not drama.`,
            ),
          ],
          Y: [
            pour(
              `Note sectors where mis-citation carries legal or partnership risk; map which workflows need stricter gates.`,
              `Separate legal advice from operational policy.`,
            ),
          ],
          A: [
            pour(
              `Define red, yellow, and green publish tiers for ${partner} output based on audience and evidence strength.`,
              `Assign approvers by tier before the next campaign.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Future-Proof Founder",
      strands: [
        {
          thesis: `The endgame is evolving from doer to designer of intelligence across the business.`,
          S: [
            pour(
              `Portrait of a founder whose agent stack runs multiple brands while they focus on mission-level bets and community.`,
              `Show one decision only they could make.`,
            ),
          ],
          Y: [
            pour(
              `Share projections on agent-assisted work and where systemic design skill likely outpaces raw task throughput.`,
              `Label forecasts as directional, not fate.`,
            ),
          ],
          A: [
            pour(
              `Shift from managing people-only to curating systems: map information flows, decision rights, and agent boundaries.`,
              `Pick one workflow to redesign as an architecture diagram this month.`,
            ),
          ],
        },
        {
          thesis: `Architectural thinking—how value and information move—becomes the core skill for ${aud}.`,
          S: [
            pour(
              `Team workshop turns a tangle of tools into a simple flowchart with human and ${partner} nodes labeled clearly.`,
              `End with one removed tool and why.`,
            ),
          ],
          Y: [
            pour(
              `Compare companies that document decision architecture versus those that accumulate ad hoc automations.`,
              `Highlight maintenance cost and failure modes.`,
            ),
          ],
          A: [
            pour(
              `Write a one-page “intelligence architecture” for your company: inputs, transforms, outputs, and review points.`,
              `Review it quarterly like a cap table.`,
            ),
          ],
        },
        {
          thesis: `Sustained partnership with a ${partner} should leave the business more resilient, not more fragile.`,
          S: [
            pour(
              `Founder recovers quickly from a vendor outage because runbooks and human fallbacks were designed alongside automation.`,
              `Show the fallback in action for one day.`,
            ),
          ],
          Y: [
            pour(
              `Cite resilience patterns: diversity of tools, human override paths, and observability on automated steps.`,
              `Connect resilience to customer trust metrics where possible.`,
            ),
          ],
          A: [
            pour(
              `Commit to a 90-day systemic intelligence goal: one agent workflow in production, one audit, one documented fallback.`,
              `Schedule the retrospective before you scale the next workflow.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Agent Orchestra",
      strands: [
        {
          thesis: `Multiple specialized agents only help when ${aud} conduct them toward one customer outcome.`,
          S: [
            pour(
              `Operations lead replaces five conflicting chatbots with one orchestrated queue routing tasks to research, draft, and review agents.`,
              `Show a customer-visible improvement within one sprint.`,
            ),
          ],
          Y: [
            pour(
              `Compare error rates when agents share context versus when each prompt starts cold.`,
              `Define “context” operationally: CRM fields, tone guide, offer rules.`,
            ),
          ],
          A: [
            pour(
              `Name three agent roles, their inputs, outputs, and handoff checks; forbid overlapping responsibilities.`,
              `Pilot on one revenue-critical workflow first.`,
            ),
          ],
        },
        {
          thesis: `Orchestration beats accumulation: fewer agents with clear charters outperform tool sprawl.`,
          S: [
            pour(
              `Founder deletes redundant plugins after a ${partner} audit maps duplicate work across the stack.`,
              `Quantify cost and confusion removed.`,
            ),
          ],
          Y: [
            pour(
              `Summarize spend and time lost to overlapping SaaS and agent tools in small teams.`,
              `Use conservative estimates if hard data is thin.`,
            ),
          ],
          A: [
            pour(
              `Run a quarterly agent stack review: keep, merge, or kill each automation with a named owner.`,
              `Publish decisions to the team in plain language.`,
            ),
          ],
        },
        {
          thesis: `Customer experience should feel seamless even when several machine steps run backstage.`,
          S: [
            pour(
              `Buyer receives a coherent onboarding sequence though three agents drafted pieces; human editor unified voice.`,
              `Include one seam that still needs polish.`,
            ),
          ],
          Y: [
            pour(
              `Track completion and satisfaction for blended human-machine onboarding versus fully manual baselines.`,
              `Note sample size and segment.`,
            ),
          ],
          A: [
            pour(
              `Add a final human or style pass before any multi-agent output reaches customers.`,
              `Define brand voice non-negotiables in five bullets.`,
            ),
          ],
        },
      ],
    },
    {
      title: "The Legacy Stack",
      strands: [
        {
          thesis: `Long-term value is a documented ${partner} stack others can run without the founder’s memory.`,
          S: [
            pour(
              `Successor operator takes over a business because playbooks, prompts, and review rituals live in a shared system—not private notes.`,
              `Show one mistake avoided on day ten.`,
            ),
          ],
          Y: [
            pour(
              `Reference succession and key-person risk data for small companies reliant on founder-only workflows.`,
              `Tie risk to valuation and buyer diligence themes at a high level.`,
            ),
          ],
          A: [
            pour(
              `Package your top five workflows as teachable modules: purpose, prompt, proof standard, and failure drill.`,
              `Record a ten-minute walkthrough for each.`,
            ),
          ],
        },
        {
          thesis: `Institutional memory turns ${promise} from a personal trick into a company capability.`,
          S: [
            pour(
              `Team ships consistent proposals after the founder moves to advisory work because evidence libraries stay curated.`,
              `Highlight one standard they refused to compromise.`,
            ),
          ],
          Y: [
            pour(
              `Compare rework rates before and after centralizing approved claims, stories, and pricing logic.`,
              `Keep the measurement window explicit.`,
            ),
          ],
          A: [
            pour(
              `Assign curators for stories, evidence, and offers; set monthly freshness reviews.`,
              `Retire outdated claims instead of hoarding them.`,
            ),
          ],
        },
        {
          thesis: `The founder’s last mile is teaching others to design intelligence, not depend on one wizard.`,
          S: [
            pour(
              `Graduation scene: founder facilitates a workshop where operators design their own agent workflow with guardrails.`,
              `End on a peer teaching peer.`,
            ),
          ],
          Y: [
            pour(
              `Note training outcomes when teams adopt shared prompt standards versus ad hoc experimentation alone.`,
              `Separate skill gain from tool hype.`,
            ),
          ],
          A: [
            pour(
              `Launch an internal certification: design, test, document, and hand off one ${partner} workflow end to end.`,
              `Make graduation a visible company ritual.`,
            ),
          ],
        },
      ],
    },
  ];

  return chapters[globalIdx % chapters.length]!;
}

function genericBusinessChapter(globalIdx: number, ctx: BookContext): ChapterPlan {
  const aud = ctx.audienceLabel;
  const promise = ctx.promise;
  const n = globalIdx + 1;

  const titles = [
    "The Cost of Staying Manual",
    "The First Reliable Win",
    "Proof Your Market Will Believe",
    "Designing the Weekly Rhythm",
    "Scaling Without Chaos",
    "The Accountability Loop",
    "The Commitment That Sticks",
    "The Second Chapter Test",
    "Keeping the Promise Alive",
  ];

  const angles = [
    "hidden drag on focus",
    "one workflow worth standardizing",
    "evidence buyers trust",
    "cadence that survives busy weeks",
    "handoffs that prevent rework",
    "metrics that expose drift early",
    "a public pledge with teeth",
    "stress-testing the method under pressure",
    "teaching the system to the next owner",
  ];

  const angle = angles[globalIdx % angles.length]!;
  const title = titles[globalIdx % titles.length]!;

  const mkStrand = (strandIdx: number): StrandPlan => {
    const focus = ["stakes and urgency", "method and sequence", "proof and guardrails"][strandIdx % 3]!;
    return {
      thesis: `Chapter ${n}, strand ${strandIdx + 1}: ${aud} advance ${promise} by addressing ${angle} through ${focus}.`,
      S: [
        pour(
          `Scene ${n}.${strandIdx + 1}: a specific week where ${angle} threatens a revenue or reputation outcome until the team changes one habit.`,
          `Use names, dates, and a single turning decision; avoid repeating earlier chapter scenes.`,
        ),
      ],
      Y: [
        pour(
          `Evidence ${n}.${strandIdx + 1}: one dataset or case that clarifies ${angle} for ${aud}, with limits stated.`,
          `Cite source type and what would weaken the claim.`,
        ),
      ],
      A: [
        pour(
          `Advice ${n}.${strandIdx + 1}: three numbered moves that apply ${promise} to ${angle} within seven days.`,
          `Each move needs an owner, deadline, and done signal.`,
        ),
      ],
    };
  };

  return { title, strands: [mkStrand(0), mkStrand(1), mkStrand(2)] };
}

export function chapterPlanFor(globalIdx: number, ctx: BookContext, strandCount: number): ChapterPlan {
  const base = ctx.useAiPartnerArc
    ? entrepreneurAiChapter(globalIdx, ctx)
    : genericBusinessChapter(globalIdx, ctx);
  return { title: base.title, strands: padStrands(base.strands, Math.max(1, strandCount)) };
}

export function pickSayPour(strand: StrandPlan, code: SAYCode, pointIdx: number): SayPour {
  const bucket = code === "S" ? strand.S : code === "Y" ? strand.Y : strand.A;
  if (bucket.length === 0) {
    return pour(
      `Develop this ${code} point in plain language, tied to the strand thesis.`,
      `Keep sentences short; do not paste the book title or main goal verbatim.`,
    );
  }
  const base = bucket[pointIdx % bucket.length]!;
  if (pointIdx === 0 || bucket.length > 1) return base;
  const deepen =
    code === "S"
      ? "Add a second beat in the same scene: consequence, cost, or decision that raises stakes."
      : code === "Y"
        ? "Add a second source or counter-statistic; reconcile them in one plain sentence."
        : "Add a second move: who owns it, when it runs, and how you know it worked.";
  return pour(`${base.theme} ${deepen}`, base.guidance);
}
