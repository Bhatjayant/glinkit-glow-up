/**
 * Feature entitlements. Plans are stored on the user profile (`profiles.plan`).
 * Components ask `can(plan, "feature")` — never hard-code prices or plan names in UI.
 */
export const FEATURES = [
  "ai",
  "multiple_profiles",
  "analytics",
  "lead_crm",
  "booking",
  "custom_branding",
  "campaign_tracking",
  "team_accounts",
  "custom_domain",
] as const;

export type Feature = (typeof FEATURES)[number];
export type Plan = "free" | "pro" | "business";

const MATRIX: Record<Plan, Feature[]> = {
  free: ["ai", "analytics", "lead_crm", "booking"],
  pro: [
    "ai",
    "analytics",
    "lead_crm",
    "booking",
    "multiple_profiles",
    "custom_branding",
    "campaign_tracking",
  ],
  business: [...FEATURES],
};

export const asPlan = (value: string | null | undefined): Plan =>
  value === "pro" || value === "business" ? value : "free";

export const can = (plan: string | null | undefined, feature: Feature) =>
  MATRIX[asPlan(plan)].includes(feature);