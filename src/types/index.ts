// SHARED DATA CONTRACT — do not change shapes without telling the team.
// Additive optional fields are OK.

export const USER_TYPES = ["Student","Working Professional","Founder","Educator","Researcher","Parent","Other"] as const;
export type UserType = (typeof USER_TYPES)[number];

export const DOMAINS = ["Technology","Psychology","Career","Education","Finance","Business","Relationships","Health","Science","Gaming"] as const;
export type Domain = (typeof DOMAINS)[number];

export const EXPERIENCES = ["College Life","Job Search","Interviews","Software Development","Starting a Business","Managing People","Mental Wellbeing","Relationships","Teaching","Research","Freelancing","Career Switching","Studying Abroad","Finance","Leadership"] as const;
export type Experience = (typeof EXPERIENCES)[number];

export const INTENTS = ["Advice","Discussion","Information","Venting","Recommendation"] as const;
export type Intent = (typeof INTENTS)[number];

// Free-ish text but prefer one of these (used for the 20% context match).
export const CONTEXTS = ["College","Workplace","Job Search","Startup","School","Home","Online","Health","General"] as const;
export type Context = (typeof CONTEXTS)[number];

export interface UserProfile {
  id: string;
  anonymousId: string;        // "Anonymous Scholar #4821" — the ONLY thing shown publicly
  userType: UserType;
  domains: Domain[];
  experiences: Experience[];
  helpTopics: string[];       // Q4, optional free text / chips
  createdAt?: string;
}

export interface QuestionClassification {
  domain: Domain;             // primary domain
  secondaryDomain?: Domain;
  context: string;            // see CONTEXTS
  intent: Intent;
  targetUserTypes: UserType[];
  requiredExperiences: Experience[];
  tags: string[];
  confidence: number;         // 0..1
  source?: "llm" | "fallback";
}

export interface Post {
  id: string;
  anonymousId: string;
  content: string;
  domain: Domain;
  context: string;
  intent: Intent;
  targetUserTypes: UserType[];
  requiredExperiences: Experience[];
  tags: string[];
  createdAt: string;          // ISO
  answerCount?: number;
  // Trajectory routing (additive, optional): lets a resolved question be
  // surfaced to someone standing where its asker once stood.
  status?: "open" | "resolved";
  resolvedAt?: string;        // ISO — when the asker reported what happened
  outcome?: string;           // the asker's own "here's what happened" closure
}

export interface Answer {
  id: string;
  postId: string;
  anonymousId: string;
  content: string;
  createdAt: string;
}

export interface ExperienceMatch {
  profileId: string;
  anonymousId: string;
  score: number;              // 0..1 weighted: domain .4, experience .3, context .2, userType .1
  userType?: UserType;
  matchedExperiences?: Experience[];
}

// A resolved question whose asker has since reported what happened — routed
// forward across time rather than across people. "4 people stood exactly
// here. 3 of them are past it now."
export interface TrajectoryMatch {
  postId: string;
  anonymousId: string;
  content: string;            // the original question, as asked
  domain: Domain;
  matchedExperiences: Experience[];
  askedAt: string;            // ISO
  resolvedAt: string;         // ISO
  monthsAgo: number;          // how long ago it resolved
  outcome: string;            // "here's what I'd tell the version of me who wrote that"
  score: number;              // 0..1
}

// ---- API contracts (request -> response) ----
// POST /api/classify          {question}                          -> QuestionClassification
// POST /api/match             {classification, excludeProfileId?} -> {matches: ExperienceMatch[]}
// POST /api/profile           {userType,domains,experiences,helpTopics} -> UserProfile
// GET  /api/profile?id=       -> UserProfile | 404
// GET  /api/posts?domain=     -> {posts: Post[]}
// POST /api/posts             {content, anonymousId, classification} -> Post
// GET  /api/posts/:id         -> {post: Post, answers: Answer[]}
// POST /api/posts/:id/answers {anonymousId, content}              -> Answer
// GET  /api/search?q=         -> {classification, posts: Post[], people: ExperienceMatch[]}
// POST /api/trajectory        {classification, excludePostId?}    -> {matches: TrajectoryMatch[]}
// POST /api/posts/:id/resolve {outcome}                           -> Post (marks it resolved)
