import type {
  Question,
  AnswerRegion,
  MappedQuestion,
  MatchStatus,
} from "@/types";

/** Map every AnswerRegion to the Question it answers, using Gemini's normalizedId
 *  first and falling back to fuzzy Dice-coefficient matching. */
export function matchRegionsToQuestions(
  questions: Question[],
  regions: AnswerRegion[]
): MappedQuestion[] {
  const qMap = new Map<string, Question>(
    questions.map((q) => [normalizeId(q.questionId), q])
  );

  const assigned = new Set<string>();
  const regionsByQuestion = new Map<string, AnswerRegion[]>(
    questions.map((q) => [q.questionId, []])
  );

  // Pass 1 — trust Gemini's normalizedId when it matches a known question
  for (const region of regions) {
    if (!region.normalizedId) continue;
    const key = normalizeId(region.normalizedId);
    const q = qMap.get(key);
    if (q) {
      regionsByQuestion.get(q.questionId)!.push(region);
      assigned.add(region.regionId);
    }
  }

  // Pass 2 — fuzzy-match anything still unassigned
  for (const region of regions) {
    if (assigned.has(region.regionId)) continue;
    const match = fuzzyFind(region.questionLabel, questions);
    if (match) {
      regionsByQuestion.get(match.questionId)!.push(region);
      assigned.add(region.regionId);
    }
  }

  const mapped: MappedQuestion[] = questions.map((q) => {
    const r = regionsByQuestion.get(q.questionId) ?? [];
    const status: MatchStatus = r.length > 0 ? "matched" : "unanswered";
    return { question: q, status, regions: r };
  });

  // Orphan regions — answered something not on the question paper
  for (const region of regions) {
    if (assigned.has(region.regionId)) continue;
    mapped.push({
      question: {
        questionId: `unmatched-${region.regionId}`,
        displayNumber: region.questionLabel || "?",
        text: "(No matching question found on question paper)",
        marks: null,
        page: region.page,
      },
      status: "unmatched-answer",
      regions: [region],
    });
  }

  return mapped;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Lower-case, strip punctuation, map roman numerals to digits. */
function normalizeId(raw: string): string {
  let s = raw.toLowerCase().replace(/\s+/g, "");
  s = s.replace(/^question/, "").replace(/^q(?=\d)/, "");
  s = s.replace(/[.()\[\]#]/g, "");
  s = s
    .replace(/viii/g, "8")
    .replace(/vii/g, "7")
    .replace(/vi/g, "6")
    .replace(/iv/g, "4")
    .replace(/iii/g, "3")
    .replace(/ii/g, "2")
    .replace(/(?<![a-z])i(?![a-z])/g, "1");
  return s;
}

function fuzzyFind(label: string, questions: Question[]): Question | null {
  if (!label) return null;
  const target = normalizeId(label);
  if (!target) return null;

  let best: Question | null = null;
  let bestScore = 0;

  for (const q of questions) {
    const score = dice(target, normalizeId(q.questionId));
    if (score > bestScore) {
      bestScore = score;
      best = q;
    }
  }

  return bestScore >= 0.6 ? best : null;
}

/** Sørensen-Dice coefficient on character bigrams (0–1). */
function dice(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2)
    return b.startsWith(a) || a.startsWith(b) ? 0.8 : 0;

  const bigrams = (s: string): Map<string, number> => {
    const m = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      m.set(bg, (m.get(bg) ?? 0) + 1);
    }
    return m;
  };

  const ab = bigrams(a);
  const bb = bigrams(b);
  let intersection = 0;
  for (const [bg, count] of ab)
    intersection += Math.min(count, bb.get(bg) ?? 0);

  const total = a.length - 1 + (b.length - 1);
  return total === 0 ? 1 : (2 * intersection) / total;
}
