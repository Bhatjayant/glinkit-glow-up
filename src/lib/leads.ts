export const LEAD_INTERESTS = [
  { value: "partnership", label: "Partnership" },
  { value: "investment", label: "Investment" },
  { value: "purchase", label: "Purchase" },
  { value: "distribution", label: "Distribution" },
  { value: "services", label: "Services" },
  { value: "employment", label: "Employment" },
  { value: "general", label: "General enquiry" },
] as const;

export type LeadInterest = (typeof LEAD_INTERESTS)[number]["value"];

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export const STATUS_CLASSES: Record<LeadStatus, string> = {
  new: "border-primary/50 bg-primary/12 text-primary",
  contacted: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  qualified: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  won: "border-emerald-400/50 bg-emerald-400/12 text-emerald-300",
  lost: "border-border bg-muted/30 text-muted-foreground",
};

export const interestLabel = (value: string) =>
  LEAD_INTERESTS.find((i) => i.value === value)?.label ?? "General enquiry";

export type Lead = {
  id: string;
  card_id: string;
  name: string;
  company: string;
  designation: string;
  phone: string;
  email: string;
  message: string;
  interest: string;
  source: string;
  status: string;
  notes: string;
  follow_up_date: string | null;
  archived: boolean;
  created_at: string;
};