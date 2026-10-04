// Deterministic keyword classifier. No network. Used when no API key or the LLM fails.
import type { Domain, Experience, Intent, QuestionClassification, UserType } from "@/types";

const DOMAIN_RULES: Record<Domain, RegExp> = {
  Technology: /\b(code|coding|software|developer|programming|dsa|algorithm|react|python|javascript|app|tech|engineer(ing)?|interview prep|leetcode|ai|backend|frontend)\b/,
  Psychology: /\b(anxi\w*|stress\w*|scared|afraid|fear|depress\w*|burn\s?out|confidence|overthink\w*|mental|lonely|sad|criticiz\w*|toxic|self.?esteem|cope|coping|worried|panic)\b/,
  Career: /\b(job|jobs|career|placement\w*|placed|intern\w*|resume|cv|hiring|interview\w*|promotion|salary|manager|boss|workplace|office|graduat\w*|offer|layoff|switch)\b/,
  Education: /\b(college|university|exam\w*|study|studying|degree|school|course|teacher|student|syllabus|scholarship|masters|gpa)\b/,
  Finance: /\b(money|invest\w*|salary|loan|tax|budget|saving\w*|stock\w*|mutual fund|debt|finance|retire\w*)\b/,
  Business: /\b(startup|business|founder|saas|customers?|revenue|funding|bootstrap\w*|entrepreneur\w*|product|company)\b/,
  Relationships: /\b(girlfriend|boyfriend|partner|marriage|dating|relationship|breakup|friend\w*|family|parents?|spouse)\b/,
  Health: /\b(health|sleep|diet|exercise|fitness|doctor|illness|weight|pain|medical)\b/,
  Science: /\b(research|physics|chemistry|biology|science|paper|phd|lab|experiment|thesis)\b/,
  Gaming: /\b(game|gaming|gamer|esports|fps|console|steam|playstation|xbox)\b/,
};

const EXP_RULES: [Experience, RegExp][] = [
  ["College Life", /\b(college|university|campus|final.?year|semester|hostel|placement\w*|placed)\b/],
  ["Job Search", /\b(job|jobs|placement\w*|placed|resume|cv|hiring|apply|applying|graduat\w*|unemploy\w*|offer)\b/],
  ["Interviews", /\b(interview\w*|leetcode|dsa|mock)\b/],
  ["Software Development", /\b(software|code|coding|developer|programming|backend|frontend|dsa)\b/],
  ["Starting a Business", /\b(startup|founder|bootstrap\w*|saas|entrepreneur\w*|my business)\b/],
  ["Managing People", /\b(manager|boss|team lead|my team|managing|supervisor|coworker|colleague)\b/],
  ["Mental Wellbeing", /\b(anxi\w*|stress\w*|scared|depress\w*|burn\s?out|mental|overthink\w*|worried|panic|confidence|lonely)\b/],
  ["Relationships", /\b(girlfriend|boyfriend|partner|marriage|dating|relationship|breakup)\b/],
  ["Teaching", /\b(teach\w*|tutor\w*|lecture\w*|classroom)\b/],
  ["Research", /\b(research|phd|thesis|paper|lab)\b/],
  ["Freelancing", /\b(freelanc\w*|client\w*|contract work|gig)\b/],
  ["Career Switching", /\b(switch\w*|transition\w*|change careers?|career change|pivot)\b/],
  ["Studying Abroad", /\b(abroad|visa|masters in|ms in|international student)\b/],
  ["Finance", /\b(invest\w*|loan|tax|budget|savings?|stock\w*|mutual fund)\b/],
  ["Leadership", /\b(lead|leader\w*|promotion|manager|managing)\b/],
];

const CONTEXT_RULES: [string, RegExp][] = [
  ["College", /\b(college|university|campus|student|final.?year|semester|hostel|placement\w*|placed)\b/],
  ["Workplace", /\b(manager|boss|office|workplace|coworker|colleague|team|company|promotion|at work)\b/],
  ["Job Search", /\b(interview\w*|resume|cv|apply|applying|hiring|job search|offer)\b/],
  ["Startup", /\b(startup|founder|bootstrap\w*|saas|funding)\b/],
  ["School", /\b(school|teacher|class\s?\d+|board exam)\b/],
  ["Home", /\b(parents?|family|home|marriage|spouse)\b/],
  ["Health", /\b(health|doctor|sleep|diet|medical)\b/],
];

function pick<T extends string>(rules: [T, RegExp][], t: string): T[] {
  return rules.filter(([, re]) => re.test(t)).map(([k]) => k);
}

function intentOf(t: string): Intent {
  if (/\b(recommend\w*|suggest\w*|best (way|book|course|tool)|which (one|should))\b/.test(t)) return "Recommendation";
  if (/\b(vent|rant|so tired of|fed up|can't take)\b/.test(t)) return "Venting";
  if (/\b(what is|what are|difference between|explain|how does|info)\b/.test(t)) return "Information";
  if (/\b(opinion|thoughts on|do you think|is it worth|debate|discuss)\b/.test(t)) return "Discussion";
  return "Advice";
}

function targetsOf(t: string, domain: Domain, context: string): UserType[] {
  const out = new Set<UserType>();
  if (context === "College" || /\b(student|final.?year|fresher|graduat\w*)\b/.test(t)) out.add("Student");
  if (context === "Workplace" || context === "Job Search" || domain === "Career") out.add("Working Professional");
  if (context === "Startup" || domain === "Business") out.add("Founder");
  if (domain === "Science") out.add("Researcher");
  if (domain === "Education" && /\b(teach\w*|classroom|students)\b/.test(t)) out.add("Educator");
  if (/\b(my (kid|child|son|daughter)|parenting)\b/.test(t)) out.add("Parent");
  if (!out.size) out.add("Working Professional");
  return [...out].slice(0, 3);
}

function tagsOf(t: string, domain: Domain, context: string, exps: Experience[]): string[] {
  const tags: string[] = [];
  const add = (tag: string, re: RegExp) => re.test(t) && tags.push(tag);
  add("career anxiety", /\b(scared|anxi\w*|worried|afraid)\b.*\b(job|career|placement\w*|placed|graduat\w*)\b|\b(job|career|placement\w*|placed|graduat\w*)\b.*\b(scared|anxi\w*|worried|afraid)\b/);
  add("placements", /\bplacement\w*|placed|final.?year|graduat\w*|get a job\b/);
  add("workplace conflict", /\b(manager|boss|coworker|colleague)\b.*\b(criticiz\w*|yell\w*|toxic|rude|blame\w*|micromanag\w*)\b|\b(criticiz\w*|toxic)\b.*\b(manager|boss)\b/);
  add("manager", /\b(manager|boss)\b/);
  add("interview prep", /\b(prepare|prep|preparing|crack)\b.*\binterview\w*\b|\binterview prep\b/);
  add("dsa", /\b(dsa|leetcode|algorithm\w*)\b/);
  add("bootstrapping", /\bbootstrap\w*/);
  add("burnout", /\bburn\s?out\b/);
  add("salary negotiation", /\bsalary\b.*\b(negotiat\w*|raise|hike)\b|\bnegotiat\w*\b/);
  if (tags.length < 2) tags.push(context.toLowerCase(), domain.toLowerCase());
  if (exps[0] && tags.length < 3) tags.push(exps[0].toLowerCase());
  return [...new Set(tags)].slice(0, 5);
}

export function fallbackClassify(text: string): QuestionClassification {
  const t = text.toLowerCase();

  const scores = (Object.entries(DOMAIN_RULES) as [Domain, RegExp][]).map(([d, re]) => {
    const m = t.match(new RegExp(re.source, "g"));
    return { d, n: m ? m.length : 0 };
  });
  scores.sort((a, b) => b.n - a.n);
  let domain: Domain = scores[0].n > 0 ? scores[0].d : "Career";
  let secondaryDomain: Domain | undefined = scores[1].n > 0 && scores[1].d !== domain ? scores[1].d : undefined;

  // Heuristic: emotional language about work/career => lead with the topic the user is asking about.
  const emotional = /\b(scared|anxi\w*|afraid|worried|stress\w*|criticiz\w*)\b/.test(t);
  const mentionsJob = /\b(job|career|placement\w*|placed|graduat\w*)\b/.test(t);
  const mentionsManager = /\b(manager|boss|coworker|colleague)\b/.test(t);
  if (emotional && mentionsJob) { domain = "Career"; secondaryDomain = "Psychology"; }
  else if (emotional && mentionsManager) { domain = "Psychology"; secondaryDomain = "Career"; }
  else if (/\binterview\w*\b/.test(t) && /\b(software|code|coding|developer|programming|dsa|engineer\w*)\b/.test(t)) {
    domain = "Technology"; secondaryDomain = "Career";
  }

  const ctxs = pick(CONTEXT_RULES, t);
  // Prefer job search for interview questions, else first match.
  const context = /\binterview\w*\b/.test(t) ? "Job Search" : ctxs[0] ?? "General";

  let requiredExperiences = pick(EXP_RULES, t);
  if (domain === "Psychology" || secondaryDomain === "Psychology") {
    if (!requiredExperiences.includes("Mental Wellbeing")) requiredExperiences.push("Mental Wellbeing");
  }
  if (!requiredExperiences.length) requiredExperiences = [domain === "Technology" ? "Software Development" : "Job Search"];
  requiredExperiences = [...new Set(requiredExperiences)].slice(0, 4);

  const intent = intentOf(t);
  const targetUserTypes = targetsOf(t, domain, context);
  const tags = tagsOf(t, domain, context, requiredExperiences);

  const signals = scores[0].n + requiredExperiences.length + (context !== "General" ? 1 : 0);
  const confidence = Math.min(0.82, 0.55 + signals * 0.04);

  return {
    domain,
    ...(secondaryDomain ? { secondaryDomain } : {}),
    context,
    intent,
    targetUserTypes,
    requiredExperiences,
    tags,
    confidence: +confidence.toFixed(2),
    source: "fallback",
  };
}
