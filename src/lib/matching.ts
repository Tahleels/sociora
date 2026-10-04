// OWNER: Workstream A. Stable export: matchProfiles(classification, profiles, excludeId?) -> ExperienceMatch[] (sorted desc).
// Weights: domain 40%, experience 30%, context 20%, userType 10%.
import type { ExperienceMatch, QuestionClassification, UserProfile } from "@/types";

export function matchProfiles(c: QuestionClassification, profiles: UserProfile[], excludeId?: string): ExperienceMatch[] {
  return profiles
    .filter((p) => p.id !== excludeId)
    .map((p) => {
      const domain = p.domains.includes(c.domain) ? 1 : 0;
      const shared = c.requiredExperiences.filter((e) => p.experiences.includes(e));
      const exp = c.requiredExperiences.length ? shared.length / c.requiredExperiences.length : 0;
      const ctx = 0; // TODO(A): context match
      const ut = c.targetUserTypes.includes(p.userType) ? 1 : 0;
      return {
        profileId: p.id,
        anonymousId: p.anonymousId,
        userType: p.userType,
        matchedExperiences: shared,
        score: +(domain * 0.4 + exp * 0.3 + ctx * 0.2 + ut * 0.1).toFixed(3),
      };
    })
    .sort((a, b) => b.score - a.score);
}
