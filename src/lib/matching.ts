import type {
  Question,
  AnswerRegion,
  MappedQuestion,
  MatchStatus,
} from "@/types";

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

  // Trusting Gemini's normalizedId when it matches a known question
  for (const region of regions) {
    if (!region.normalizedId) continue;
    const key = normalizeId(region.normalizedId);
    if (qMap.has(key)) {
      const q = qMap.get(key)!;
      regionsByQuestion.get(q.questionId)!.push(region);
      assigned.add(region.regionId);
    }
  }

  // fallback: fuzzy-match anything still unassigned by the student's label text
  for (const region of regions) {
    if (assigned.has(region.regionId)) continue;
    const match = fuzzyFindQuestion(region.questionLabel, questions);
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

  // Answered something not on the question paper
  const orphans = regions.filter((r) => !assigned.has(r.regionId));
  for (const region of orphans) {
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

/**
 * Normalises a question id for comparison:
 * lowercased, stripped of spaces/punctuation/brackets/"q" prefix,
 * and roman numeral suffixes mapped to digits (i→1, ii→2 … viii→8).
 */
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

function fuzzyFindQuestion(
  label: string,
  questions: Question[]
): Question | null {
  if (!label) return null;
  const target = normalizeId(label);
  if (!target) return null;

  let best: Question | null = null;
  let bestScore = 0;

  for (const q of questions) {
    const score = diceCoefficient(target, normalizeId(q.questionId));
    if (score > bestScore) {
      bestScore = score;
      best = q;
    }
  }

  return bestScore >= 0.6 ? best : null;
}

/** Sørensen-Dice coefficient on character bigrams. Returns 0–1. */
function diceCoefficient(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) {
    return b.startsWith(a) || a.startsWith(b) ? 0.8 : 0;
  }

  const bigrams = (s: string) => {
    const map = new Map<string, number>();
    for (let i = 0; i < s.length - 1; i++) {
      const bg = s.slice(i, i + 2);
      map.set(bg, (map.get(bg) ?? 0) + 1);
    }
    return map;
  };

  const aBigrams = bigrams(a);
  const bBigrams = bigrams(b);

  let intersection = 0;
  for (const [bg, count] of aBigrams) {
    intersection += Math.min(count, bBigrams.get(bg) ?? 0);
  }

  const total = a.length - 1 + (b.length - 1);
  return total === 0 ? 1 : (2 * intersection) / total;
}
