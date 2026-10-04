// Trajectory routing: match a question not to people like the asker, but to
// people who stood where the asker stands now and have since moved past it.
// "Reddit routes your question to a topic. Sociora routes it six months
// into your own future."
import type { Post, QuestionClassification, TrajectoryMatch } from "@/types";

// Relevance peaks when the resolution happened a few months ago: recent
// enough that the advice is current, distant enough to prove it passed.
const SWEET_SPOT_MONTHS = 6;
const SPREAD_MONTHS = 5;
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30;

function monthsAgo(iso: string, now: number): number {
  return Math.max(0, (now - new Date(iso).getTime()) / MS_PER_MONTH);
}

export function matchTrajectory(
  c: QuestionClassification,
  posts: Post[],
  excludePostId?: string,
): TrajectoryMatch[] {
  const now = Date.now();
  return posts
    .filter((p) => p.status === "resolved" && p.outcome && p.resolvedAt && p.id !== excludePostId)
    .map((p) => {
      const domain = p.domain === c.domain ? 1 : c.secondaryDomain && p.domain === c.secondaryDomain ? 0.5 : 0;

      const shared = c.requiredExperiences.filter((e) => p.requiredExperiences.includes(e));
      const exp = c.requiredExperiences.length ? shared.length / c.requiredExperiences.length : 0;

      const ago = monthsAgo(p.resolvedAt!, now);
      const recency = Math.exp(-((ago - SWEET_SPOT_MONTHS) ** 2) / (2 * SPREAD_MONTHS ** 2));

      const score = +(domain * 0.45 + exp * 0.35 + recency * 0.2).toFixed(3);

      return {
        postId: p.id,
        anonymousId: p.anonymousId,
        content: p.content,
        domain: p.domain,
        matchedExperiences: shared.length ? shared : p.requiredExperiences,
        askedAt: p.createdAt,
        resolvedAt: p.resolvedAt!,
        monthsAgo: Math.round(ago),
        outcome: p.outcome!,
        score,
      };
    })
    .filter((m) => m.score >= 0.15)
    .sort((a, b) => b.score - a.score);
}
