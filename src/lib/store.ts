// Data layer. In-memory + seeded so the app ALWAYS runs without Supabase.
// OWNER: Workstream B. (Optional: swap internals for Supabase when env vars exist; keep these signatures.)
import type { Answer, Post, UserProfile } from "@/types";
import { uid } from "./identity";

interface DB { profiles: UserProfile[]; posts: Post[]; answers: Answer[] }

const g = globalThis as unknown as { __sociora?: DB };

function seed(): DB {
  const now = Date.now();
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString();
  const profiles: UserProfile[] = [
    { id: "p1", anonymousId: "Anonymous Scholar #4821", userType: "Student", domains: ["Career","Technology"], experiences: ["College Life","Job Search"], helpTopics: ["placements"] },
    { id: "p2", anonymousId: "Anonymous Professional #1927", userType: "Working Professional", domains: ["Career","Psychology"], experiences: ["Managing People","Career Switching","Mental Wellbeing"], helpTopics: [] },
    { id: "p3", anonymousId: "Anonymous Builder #7318", userType: "Founder", domains: ["Business","Technology","Finance"], experiences: ["Starting a Business","Leadership","Freelancing"], helpTopics: [] },
    { id: "p4", anonymousId: "Anonymous Mentor #2205", userType: "Educator", domains: ["Education","Psychology"], experiences: ["Teaching","Mental Wellbeing","College Life"], helpTopics: [] },
    { id: "p5", anonymousId: "Anonymous Professional #5530", userType: "Working Professional", domains: ["Technology","Career"], experiences: ["Software Development","Interviews","Job Search"], helpTopics: [] },
    { id: "p6", anonymousId: "Anonymous Researcher #3342", userType: "Researcher", domains: ["Science","Education"], experiences: ["Research","Studying Abroad"], helpTopics: [] },
    { id: "p7", anonymousId: "Anonymous Scholar #9012", userType: "Student", domains: ["Relationships","Psychology"], experiences: ["Relationships","Mental Wellbeing"], helpTopics: [] },
    { id: "p8", anonymousId: "Anonymous Professional #6674", userType: "Working Professional", domains: ["Career","Business"], experiences: ["Managing People","Leadership","Interviews"], helpTopics: [] },
  ];
  const posts: Post[] = [
    { id: "q1", anonymousId: "Anonymous Scholar #9012", content: "I'm a final-year engineering student and I'm scared I won't get a job after graduation. How should I deal with this?", domain: "Career", context: "College", intent: "Advice", targetUserTypes: ["Student","Working Professional"], requiredExperiences: ["Job Search","College Life"], tags: ["career anxiety","placements"], createdAt: ago(5) },
    { id: "q2", anonymousId: "Anonymous Professional #5530", content: "My manager constantly criticizes me in front of everyone. How should I handle it?", domain: "Psychology", context: "Workplace", intent: "Advice", targetUserTypes: ["Working Professional"], requiredExperiences: ["Managing People","Leadership"], tags: ["workplace conflict","manager"], createdAt: ago(9) },
    { id: "q3", anonymousId: "Anonymous Scholar #4821", content: "How do I prepare for a software engineering interview in 3 weeks?", domain: "Technology", context: "Job Search", intent: "Advice", targetUserTypes: ["Working Professional","Student"], requiredExperiences: ["Interviews","Software Development"], tags: ["interview prep","dsa"], createdAt: ago(20) },
    { id: "q4", anonymousId: "Anonymous Builder #7318", content: "Is it worth bootstrapping a SaaS while working full-time, or should I quit?", domain: "Business", context: "Startup", intent: "Discussion", targetUserTypes: ["Founder","Working Professional"], requiredExperiences: ["Starting a Business","Freelancing"], tags: ["bootstrapping","saas"], createdAt: ago(30) },
  ];
  const answers: Answer[] = [
    { id: "a1", postId: "q1", anonymousId: "Anonymous Professional #1927", content: "I felt exactly this in my final year. What helped: ship 2 small projects, apply in small batches weekly, and treat rejections as data. Your anxiety is normal, and the market is slower than it is hopeless.", createdAt: ago(4) },
    { id: "a2", postId: "q1", anonymousId: "Anonymous Mentor #2205", content: "Talk to seniors placed last year. Concrete next steps reduce fear far more than reassurance does.", createdAt: ago(3) },
    { id: "a3", postId: "q2", anonymousId: "Anonymous Professional #6674", content: "Ask for a 1:1 and describe the behavior, not the person. If it continues, document dates and loop in HR.", createdAt: ago(7) },
  ];
  return { profiles, posts, answers };
}

function db(): DB {
  if (!g.__sociora) g.__sociora = seed();
  return g.__sociora;
}

export async function listProfiles(): Promise<UserProfile[]> { return db().profiles; }
export async function getProfileById(id: string) { return db().profiles.find((p) => p.id === id) ?? null; }
export async function createProfile(p: Omit<UserProfile, "id" | "createdAt">): Promise<UserProfile> {
  const profile: UserProfile = { ...p, id: uid(), createdAt: new Date().toISOString() };
  db().profiles.push(profile);
  return profile;
}

export async function listPosts(domain?: string): Promise<Post[]> {
  const { posts, answers } = db();
  return posts
    .filter((p) => !domain || p.domain === domain)
    .map((p) => ({ ...p, answerCount: answers.filter((a) => a.postId === p.id).length }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
export async function getPost(id: string) {
  const post = db().posts.find((p) => p.id === id);
  if (!post) return null;
  const answers = db().answers.filter((a) => a.postId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return { post: { ...post, answerCount: answers.length }, answers };
}
export async function createPost(p: Omit<Post, "id" | "createdAt">): Promise<Post> {
  const post: Post = { ...p, id: uid(), createdAt: new Date().toISOString() };
  db().posts.push(post);
  return post;
}
export async function createAnswer(a: Omit<Answer, "id" | "createdAt">): Promise<Answer> {
  const answer: Answer = { ...a, id: uid(), createdAt: new Date().toISOString() };
  db().answers.push(answer);
  return answer;
}
