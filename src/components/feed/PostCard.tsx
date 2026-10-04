import Link from "next/link";
import type { Post } from "@/types";

export function relativeTime(value: string): string {
  const elapsed = Math.max(0, Date.now() - new Date(value).getTime());
  if (!Number.isFinite(elapsed)) return "Recently";
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function avatarHue(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash) % 360;
}

export function AnonymousAvatar({ anonymousId, size = "normal" }: { anonymousId: string; size?: "normal" | "large" }) {
  const hue = avatarHue(anonymousId);
  const number = anonymousId.match(/#(\d+)/)?.[1]?.slice(-2) ?? "·";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-ink ${size === "large" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 88%), hsl(${(hue + 38) % 360} 65% 78%))` }}
    >
      {number}
    </span>
  );
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      href={`/post/${encodeURIComponent(post.id)}`}
      className="group block rounded-2xl border border-ink/10 bg-white/70 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:bg-white hover:shadow-[0_12px_35px_rgba(20,17,15,0.06)] sm:p-6"
    >
      <div className="flex items-start gap-3">
        <AnonymousAvatar anonymousId={post.anonymousId} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="truncate text-sm font-semibold text-ink">{post.anonymousId}</span>
            <span className="text-xs text-ink/45">· {relativeTime(post.createdAt)}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-[15px] leading-7 text-ink/85 group-hover:text-ink">{post.content}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">{post.domain}</span>
        <span className="rounded-full bg-ink/[0.045] px-3 py-1 text-xs text-ink/65">{post.context}</span>
        <span className="rounded-full bg-ink/[0.045] px-3 py-1 text-xs text-ink/65">{post.intent}</span>
      </div>

      {post.requiredExperiences.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.requiredExperiences.map((experience) => (
            <span key={experience} className="rounded-md border border-ink/10 px-2 py-1 text-[11px] text-ink/60">
              {experience}
            </span>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/[0.07] pt-4">
        <p className="text-xs text-ink/55">
          Routed to: <span className="font-medium text-ink/70">{post.targetUserTypes.join(" · ") || "Community"}</span>
        </p>
        <span className="text-xs font-medium text-ink/55">
          {post.answerCount ?? 0} {(post.answerCount ?? 0) === 1 ? "answer" : "answers"} <span className="ml-1 text-accent transition group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}
