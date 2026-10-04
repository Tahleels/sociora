// Stable export: matchProfiles(classification, profiles, excludeId?) -> ExperienceMatch[] (sorted desc).
// Weights: domain 40%, experience 30%, context 20%, userType 10%.
import type { Domain, Experience, ExperienceMatch, QuestionClassification, UserProfile } from "@/types";

// What kind of person/background a context implies.
const CONTEXT_MAP: Record<string, { experiences: Experience[]; domains: Domain[] }> = {
  College: { experiences: ["College Life", "Studying Abroad"], domains: ["Education"] },
  Workplace: { experiences: ["Managing People", "Leadership", "Career Switching"], domains: ["Career"] },
  "Job Search": { experiences: ["Job Search", "Interviews"], domains: ["Career"] },
  Startup: { experiences: ["Starting a Business", "Freelancing", "Leadership"], domains: ["Business"] },
  School: { experiences: ["Teaching"], domains: ["Education"] },
  Home: { experiences: ["Relationships"], domains: ["Relationships"] },
  Online: { experiences: ["Software Development", "Freelancing"], domains: ["Technology"] },
  Health: { experiences: ["Mental Wellbeing"], domains: ["Health", "Psychology"] },
};

export function matchProfiles(c: QuestionClassification, profiles: UserProfile[], excludeId?: string): ExperienceMatch[] {
  const ctx = CONTEXT_MAP[c.context];
  return profiles
    .filter((p) => p.id !== excludeId)
    .map((p) => {
      const domain = p.domains.includes(c.domain) ? 1 : c.secondaryDomain && p.domains.includes(c.secondaryDomain) ? 0.5 : 0;

      const shared = c.requiredExperiences.filter((e) => p.experiences.includes(e));
      const exp = c.requiredExperiences.length ? shared.length / c.requiredExperiences.length : 0;

      let context = 0;
      if (ctx) {
        const expHit = ctx.experiences.some((e) => p.experiences.includes(e));
        const domHit = ctx.domains.some((d) => p.domains.includes(d));
        context = (expHit ? 0.7 : 0) + (domHit ? 0.3 : 0);
      }

      const userType = c.targetUserTypes.includes(p.userType) ? 1 : 0;

      return {
        profileId: p.id,
        anonymousId: p.anonymousId,
        userType: p.userType,
        matchedExperiences: shared,
        score: +(domain * 0.4 + exp * 0.3 + context * 0.2 + userType * 0.1).toFixed(3),
      };
    })
    .sort((a, b) => b.score - a.score);
}
