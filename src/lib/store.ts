// Data layer. In-memory + seeded so the app ALWAYS runs without Supabase.
// OWNER: Workstream B. (Optional: swap internals for Supabase when env vars exist; keep these signatures.)
import type { Answer, Post, UserProfile } from "@/types";
import { uid } from "./identity";

interface DB { profiles: UserProfile[]; posts: Post[]; answers: Answer[] }

const g = globalThis as unknown as { __sociora?: DB };

function seed(): DB {
  const now = Date.now();
  const ago = (h: number) => new Date(now - h * 3600_000).toISOString();
  const monthsAgo = (m: number) => new Date(now - m * 30 * 24 * 3600_000).toISOString();
  const profiles: UserProfile[] = [
    { id: "p1", anonymousId: "Anonymous Scholar #4821", userType: "Student", domains: ["Career","Technology"], experiences: ["College Life","Job Search"], helpTopics: ["placements"] },
    { id: "p2", anonymousId: "Anonymous Professional #1927", userType: "Working Professional", domains: ["Career","Psychology"], experiences: ["Managing People","Career Switching","Mental Wellbeing"], helpTopics: [] },
    { id: "p3", anonymousId: "Anonymous Builder #7318", userType: "Founder", domains: ["Business","Technology","Finance"], experiences: ["Starting a Business","Leadership","Freelancing"], helpTopics: [] },
    { id: "p4", anonymousId: "Anonymous Mentor #2205", userType: "Educator", domains: ["Education","Psychology"], experiences: ["Teaching","Mental Wellbeing","College Life"], helpTopics: [] },
    { id: "p5", anonymousId: "Anonymous Professional #5530", userType: "Working Professional", domains: ["Technology","Career"], experiences: ["Software Development","Interviews","Job Search"], helpTopics: [] },
    { id: "p6", anonymousId: "Anonymous Researcher #3342", userType: "Researcher", domains: ["Science","Education"], experiences: ["Research","Studying Abroad"], helpTopics: [] },
    { id: "p7", anonymousId: "Anonymous Scholar #9012", userType: "Student", domains: ["Relationships","Psychology"], experiences: ["Relationships","Mental Wellbeing"], helpTopics: [] },
    { id: "p8", anonymousId: "Anonymous Professional #6674", userType: "Working Professional", domains: ["Career","Business"], experiences: ["Managing People","Leadership","Interviews"], helpTopics: [] },
    { id: "p9", anonymousId: "Anonymous Guardian #4186", userType: "Parent", domains: ["Education","Psychology"], experiences: ["Teaching","Mental Wellbeing"], helpTopics: ["supporting teenagers"] },
    { id: "p10", anonymousId: "Anonymous Explorer #8053", userType: "Other", domains: ["Finance","Business"], experiences: ["Finance","Starting a Business"], helpTopics: ["personal budgeting"] },
    { id: "p11", anonymousId: "Anonymous Scholar #1764", userType: "Student", domains: ["Science","Education"], experiences: ["Research","Studying Abroad"], helpTopics: [] },
    { id: "p12", anonymousId: "Anonymous Professional #3091", userType: "Working Professional", domains: ["Technology","Career"], experiences: ["Software Development","Career Switching","Freelancing"], helpTopics: [] },
  ];
  const posts: Post[] = [
    { id: "q1", anonymousId: "Anonymous Scholar #9012", content: "I'm a final-year engineering student and I'm scared I won't get a job after graduation. How should I deal with this?", domain: "Career", context: "College", intent: "Advice", targetUserTypes: ["Student","Working Professional"], requiredExperiences: ["Job Search","College Life"], tags: ["career anxiety","placements"], createdAt: ago(5) },
    { id: "q2", anonymousId: "Anonymous Professional #5530", content: "My manager constantly criticizes me in front of everyone. How should I handle it?", domain: "Psychology", context: "Workplace", intent: "Advice", targetUserTypes: ["Working Professional"], requiredExperiences: ["Managing People","Leadership"], tags: ["workplace conflict","manager"], createdAt: ago(9) },
    { id: "q3", anonymousId: "Anonymous Scholar #4821", content: "How do I prepare for a software engineering interview in 3 weeks?", domain: "Technology", context: "Job Search", intent: "Advice", targetUserTypes: ["Working Professional","Student"], requiredExperiences: ["Interviews","Software Development"], tags: ["interview prep","dsa"], createdAt: ago(20) },
    { id: "q4", anonymousId: "Anonymous Builder #7318", content: "Is it worth bootstrapping a SaaS while working full-time, or should I quit?", domain: "Business", context: "Startup", intent: "Discussion", targetUserTypes: ["Founder","Working Professional"], requiredExperiences: ["Starting a Business","Freelancing"], tags: ["bootstrapping","saas"], createdAt: ago(30) },
    { id: "q5", anonymousId: "Anonymous Mentor #2205", content: "What are some ways to make a large college lecture more welcoming for first-generation students?", domain: "Education", context: "College", intent: "Recommendation", targetUserTypes: ["Educator","Student"], requiredExperiences: ["Teaching","College Life"], tags: ["inclusive teaching","first-generation"], createdAt: ago(42) },
    { id: "q6", anonymousId: "Anonymous Researcher #3342", content: "How do you stay motivated when a research project keeps producing inconclusive results?", domain: "Science", context: "Workplace", intent: "Discussion", targetUserTypes: ["Researcher","Student"], requiredExperiences: ["Research"], tags: ["research","motivation"], createdAt: ago(54) },
    { id: "q7", anonymousId: "Anonymous Guardian #4186", content: "How can I talk with my teenager about anxiety without making them feel judged?", domain: "Psychology", context: "Home", intent: "Advice", targetUserTypes: ["Parent","Educator"], requiredExperiences: ["Mental Wellbeing","Relationships"], tags: ["parenting","mental wellbeing"], createdAt: ago(67) },
    { id: "q8", anonymousId: "Anonymous Explorer #8053", content: "What simple budgeting system actually works when your income changes month to month?", domain: "Finance", context: "General", intent: "Recommendation", targetUserTypes: ["Working Professional","Founder"], requiredExperiences: ["Finance","Freelancing"], tags: ["budgeting","variable income"], createdAt: ago(78) },
    { id: "q9", anonymousId: "Anonymous Professional #3091", content: "I'm considering moving from a stable engineering job into freelance development. What should I prepare first?", domain: "Career", context: "Career", intent: "Advice", targetUserTypes: ["Working Professional"], requiredExperiences: ["Freelancing","Career Switching","Software Development"], tags: ["freelancing","career switch"], createdAt: ago(91) },
    { id: "q10", anonymousId: "Anonymous Scholar #1764", content: "For students applying to graduate school abroad, how early should we start looking for funding?", domain: "Education", context: "Online", intent: "Information", targetUserTypes: ["Student","Researcher"], requiredExperiences: ["Studying Abroad","Research"], tags: ["graduate school","funding"], createdAt: ago(105) },
    { id: "q11", anonymousId: "Anonymous Professional #6674", content: "I was promoted to lead a small team. What helped you build trust with former peers?", domain: "Business", context: "Workplace", intent: "Advice", targetUserTypes: ["Working Professional","Founder"], requiredExperiences: ["Leadership","Managing People"], tags: ["new manager","leadership"], createdAt: ago(119) },
    { id: "q12", anonymousId: "Anonymous Scholar #9012", content: "How do you make new friends after moving to a different city for your first job?", domain: "Relationships", context: "Workplace", intent: "Discussion", targetUserTypes: ["Working Professional","Student"], requiredExperiences: ["Relationships","Career Switching"], tags: ["moving","friendship"], createdAt: ago(132) },
    // Resolved questions: routable forward in time to whoever stands where their askers once stood.
    { id: "tr1", anonymousId: "Anonymous Scholar #4821", content: "I'm a final-year student and terrified I won't get placed before graduation.", domain: "Career", context: "College", intent: "Advice", targetUserTypes: ["Student"], requiredExperiences: ["Job Search","College Life"], tags: ["placements","career anxiety"], createdAt: monthsAgo(11), status: "resolved", resolvedAt: monthsAgo(3), outcome: "I got placed in month 5 of searching. Here's what I'd tell the version of me who wrote that question: the silence after each rejection isn't a verdict, it's just silence. Keep applying in small weekly batches and stop checking your email every hour." },
    { id: "tr2", anonymousId: "Anonymous Professional #6674", content: "My manager humiliates me in front of the team and I don't know how much more I can take.", domain: "Psychology", context: "Workplace", intent: "Advice", targetUserTypes: ["Working Professional"], requiredExperiences: ["Managing People","Leadership"], tags: ["workplace conflict","manager"], createdAt: monthsAgo(9), status: "resolved", resolvedAt: monthsAgo(2), outcome: "I transferred teams after documenting six months of incidents and showing HR a pattern, not a single complaint. It felt impossible right up until the week it suddenly wasn't." },
    { id: "tr3", anonymousId: "Anonymous Builder #7318", content: "Trying to decide if I should quit my job to go all-in on my side project. The fear of regret either way is paralyzing.", domain: "Business", context: "Startup", intent: "Discussion", targetUserTypes: ["Founder","Working Professional"], requiredExperiences: ["Starting a Business","Freelancing"], tags: ["bootstrapping","quitting"], createdAt: monthsAgo(14), status: "resolved", resolvedAt: monthsAgo(5), outcome: "I gave myself a six-month runway and one metric to hit before quitting. Hit it in month four, quit in month five. The deadline mattered more than the decision ever did." },
    { id: "tr4", anonymousId: "Anonymous Scholar #1764", content: "Applying for grad school abroad and completely overwhelmed by funding deadlines that don't match the application deadlines.", domain: "Education", context: "Online", intent: "Information", targetUserTypes: ["Student","Researcher"], requiredExperiences: ["Studying Abroad","Research"], tags: ["graduate school","funding"], createdAt: monthsAgo(16), status: "resolved", resolvedAt: monthsAgo(7), outcome: "I built a spreadsheet tracking every funding deadline separately from admissions deadlines, starting fourteen months out. Got two partial scholarships I would have missed completely." },
  ];
  const answers: Answer[] = [
    { id: "a1", postId: "q1", anonymousId: "Anonymous Professional #1927", content: "I felt exactly this in my final year. What helped: ship 2 small projects, apply in small batches weekly, and treat rejections as data. Your anxiety is normal, and the market is slower than it is hopeless.", createdAt: ago(4) },
    { id: "a2", postId: "q1", anonymousId: "Anonymous Mentor #2205", content: "Talk to seniors placed last year. Concrete next steps reduce fear far more than reassurance does.", createdAt: ago(3) },
    { id: "a3", postId: "q2", anonymousId: "Anonymous Professional #6674", content: "Ask for a 1:1 and describe the behavior, not the person. If it continues, document dates and loop in HR.", createdAt: ago(7) },
    { id: "a4", postId: "q3", anonymousId: "Anonymous Professional #5530", content: "Split the three weeks into fundamentals, timed practice, and mock interviews. Keep a short log of the problems you miss and revisit those patterns rather than cramming new topics.", createdAt: ago(18) },
    { id: "a5", postId: "q3", anonymousId: "Anonymous Professional #3091", content: "Ask a friend to run two realistic mock interviews. Practicing how you explain your thinking is as important as solving the problem.", createdAt: ago(16) },
    { id: "a6", postId: "q4", anonymousId: "Anonymous Professional #6674", content: "Before quitting, try to validate demand with a few paying customers and set a runway number that protects your essentials. A small experiment can answer a lot.", createdAt: ago(27) },
    { id: "a7", postId: "q5", anonymousId: "Anonymous Guardian #4186", content: "Share expectations and examples before the first assignment, and offer a low-pressure way to ask questions privately. Small signals of belonging add up.", createdAt: ago(40) },
    { id: "a8", postId: "q6", anonymousId: "Anonymous Scholar #1764", content: "I keep a parallel record of what the result rules out and what method I improved. It helps make progress visible when the main hypothesis doesn't land.", createdAt: ago(51) },
    { id: "a9", postId: "q7", anonymousId: "Anonymous Mentor #2205", content: "Start with curiosity and listen without rushing to fix it. Asking what kind of support they want can make the conversation feel safer.", createdAt: ago(64) },
    { id: "a10", postId: "q8", anonymousId: "Anonymous Builder #7318", content: "Budget from your lowest predictable monthly income, then divide extra income between taxes, savings, and flexible spending as it arrives.", createdAt: ago(75) },
    { id: "a11", postId: "q9", anonymousId: "Anonymous Professional #5530", content: "Build a few months of runway, check your local tax and insurance obligations, and line up one or two clients before making the switch if you can.", createdAt: ago(87) },
    { id: "a12", postId: "q10", anonymousId: "Anonymous Researcher #3342", content: "Start at least a year ahead for many programs. Track each school's funding deadlines separately because they can differ from the application deadline.", createdAt: ago(102) },
    { id: "a13", postId: "q11", anonymousId: "Anonymous Professional #1927", content: "Be explicit that the relationship has changed, but that you still value candid feedback. Consistency and fair decisions tend to earn trust over time.", createdAt: ago(115) },
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

// Closes the loop: the asker reports what happened, and the question becomes
// routable to whoever stands where they once stood. Returns null if not found.
export async function resolvePost(id: string, outcome: string): Promise<Post | null> {
  const post = db().posts.find((p) => p.id === id);
  if (!post) return null;
  post.status = "resolved";
  post.resolvedAt = new Date().toISOString();
  post.outcome = outcome;
  return post;
}
