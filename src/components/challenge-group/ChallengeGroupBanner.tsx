const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

// Dummy group data — these values will come from the member's challenge-group
// record (group name, active challenge title, day number) once that is wired to
// the backend. The mock challenge is "30 Day Winter Reset Challenge".
const GROUP_LABEL = 'Group 2';
const CHALLENGE_TITLE = 'Winter Reset';
const DAY_NUMBER = 16;
const CHALLENGE_DAYS = 30;

type Props = {
  /** e.g. "Group 2" — rendered after "Walt's Warriors ·". */
  groupLabel?: string;
  challengeTitle?: string;
  dayNumber?: number;
  challengeDays?: number;
};

/**
 * Full-width challenge-group banner that sits directly under the site header:
 * group name on the left, challenge day on the right, the challenge title and a
 * day-progress bar. Palette only (secondary card background, text-on-dark,
 * progress track and dark card tokens).
 */
export function ChallengeGroupBanner({
  groupLabel = GROUP_LABEL,
  challengeTitle = CHALLENGE_TITLE,
  dayNumber = DAY_NUMBER,
  challengeDays = CHALLENGE_DAYS,
}: Props) {
  const progress = Math.max(
    0,
    Math.min(100, challengeDays > 0 ? (dayNumber / challengeDays) * 100 : 0),
  );

  return (
    <section
      aria-label={`${challengeTitle} challenge group banner`}
      className="w-full bg-[#4a4560]"
      style={{
        paddingTop: 'clamp(12px, 1.6667vw, 24px)',
        paddingBottom: 'clamp(12px, 1.6667vw, 24px)',
      }}
    >
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 lg:px-10">
        {/* Top row — group name left, challenge day right. */}
        <div
          className="flex items-baseline justify-between"
          style={{ gap: 'clamp(12px, 1.6667vw, 24px)' }}
        >
          <p
            className="font-semibold tracking-[0.16em] text-[#dbe7ee] uppercase"
            style={{ ...fontSans3, fontSize: 'clamp(10px, 1.1806vw, 17px)' }}
          >
            Walt&apos;s Warriors · {groupLabel}
          </p>
          <p
            className="shrink-0 text-[#dbe7ee]"
            style={{ ...fontSans3, fontSize: 'clamp(10px, 1.1806vw, 17px)' }}
          >
            Day {dayNumber} of {challengeDays}
          </p>
        </div>

        {/* Title + progress — stacked on phones, side-by-side from sm up. */}
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
          style={{
            gap: 'clamp(8px, 1.1111vw, 16px)',
            marginTop: 'clamp(2px, 0.5556vw, 8px)',
          }}
        >
          <h2
            className="text-[#c5d7e2]"
            style={{
              ...fontSans3,
              fontSize: 'clamp(26px, 3.4722vw, 50px)',
              fontWeight: 400,
              lineHeight: 1.05,
            }}
          >
            {challengeTitle}
          </h2>

          <div
            role="progressbar"
            aria-label="Challenge progress"
            aria-valuemin={0}
            aria-valuemax={challengeDays}
            aria-valuenow={dayNumber}
            className="w-full sm:w-[34%] sm:max-w-[490px] sm:min-w-[180px]"
          >
            <div
              className="w-full overflow-hidden rounded-full bg-[#3f4d66]"
              style={{ height: 'clamp(8px, 1.0417vw, 15px)' }}
            >
              <div className="h-full rounded-full bg-[#13233a]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
