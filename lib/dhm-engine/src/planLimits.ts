export type PlanId = "basic" | "standard" | "founders";

export interface PlanLimits {
  chapters: number;
  /** Display-only allowance until billing ships */
  revisions: number | "custom";
}

const LIMITS: Record<PlanId, PlanLimits> = {
  basic: { chapters: 5, revisions: 1 },
  standard: { chapters: 7, revisions: 2 },
  founders: { chapters: 9, revisions: "custom" },
};

export function normalizePlan(plan: string): PlanId {
  const p = plan.toLowerCase().trim();
  if (p === "basic" || p === "standard" || p === "founders") return p;
  return "standard";
}

export function getPlanLimits(plan: string): PlanLimits {
  return LIMITS[normalizePlan(plan)];
}
