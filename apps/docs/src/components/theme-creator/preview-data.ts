import { CalendarDate } from "@internationalized/date";

// Fixtures for the live preview's mock app. Everything here is static and deterministic — the docs
// site is prerendered (SSG), so a value derived from `Date.now()` would differ between build time
// and view time and the hydrated client would disagree with the server's markup.

export interface Project {
  id: string;
  name: string;
  team: string;
}

export const PROJECTS: Project[] = [
  { id: "web", name: "northwind-web", team: "Platform" },
  { id: "api", name: "northwind-api", team: "Platform" },
  { id: "checkout", name: "checkout-service", team: "Payments" },
  { id: "billing", name: "billing-worker", team: "Payments" },
  { id: "docs", name: "docs-site", team: "Growth" },
  { id: "analytics", name: "analytics-pipeline", team: "Data" },
];

export const ENVIRONMENTS = ["Production", "Staging", "Preview"];

export const REGIONS = [
  "us-east-1 · N. Virginia",
  "eu-west-3 · Paris",
  "ap-south-1 · Mumbai",
  "sa-east-1 · São Paulo",
];

/** A deployment's state, which is also the Badge color role it is painted with. */
export type DeployStatus = "success" | "warning" | "danger" | "info";

export interface Deployment {
  branch: string;
  commit: string;
  author: string;
  when: string;
  status: DeployStatus;
  label: string;
}

export const DEPLOYMENTS: Deployment[] = [
  {
    branch: "main",
    commit: "a41f0c9",
    author: "Ada",
    when: "4 min ago",
    status: "success",
    label: "Live",
  },
  {
    branch: "feat/checkout-v2",
    commit: "7d3be21",
    author: "Grace",
    when: "26 min ago",
    status: "info",
    label: "Building",
  },
  {
    branch: "fix/rate-limit",
    commit: "0b9a557",
    author: "Alan",
    when: "1 h ago",
    status: "warning",
    label: "Queued",
  },
  {
    branch: "chore/deps",
    commit: "c18e4f2",
    author: "Katherine",
    when: "3 h ago",
    status: "danger",
    label: "Failed",
  },
];

export interface Reviewer {
  id: number;
  name: string;
  role: string;
  away?: boolean;
}

export const REVIEWERS: Reviewer[] = [
  { id: 1, name: "Ada Lovelace", role: "Platform" },
  { id: 2, name: "Grace Hopper", role: "Payments" },
  { id: 3, name: "Alan Turing", role: "Security" },
  { id: 4, name: "Katherine Johnson", role: "Data", away: true },
];

export const INVITE_ROLES = ["Owner", "Maintainer", "Developer", "Billing", "Viewer"];

/**
 * The release window the schedule card opens on. Fixed rather than `today()` for the SSG reason
 * above — the calendar seeds its visible month from it, so a moving value would make the server and
 * the client render different grids.
 */
export const RELEASE_DATE = new CalendarDate(2026, 3, 12);
