// Hard-coded for now — wire up real challenge-group check-in data later.
const CHECKED_IN_INITIALS = [
  'MK',
  'TR',
  'PS',
  'JB',
  'GH',
  'TR',
  'YU',
  'CV',
  'NM',
  'OP',
  'FV',
  'ED',
];

// Hard-coded for now — wire up real challenge-group membership later.
const TOTAL_MEMBERS = 18;

// Hard-coded for now — wire up the signed-in user's check-in state later.
const YOU_CHECKED_IN = false;

// Members who have not checked in and are not the signed-in user
// (shown as unfilled circles without initials).
const OTHER_NOT_CHECKED_IN = TOTAL_MEMBERS - CHECKED_IN_INITIALS.length - (YOU_CHECKED_IN ? 0 : 1);

// Hard-coded for now — when the admin panel goes live, this section will be wired to
// the group's active challenge. Various challenge types will be supported there
// (e.g. walking minutes, workouts, water intake); `unit` drives the label.
const GROUP_CHALLENGE = {
  unit: 'walking minutes',
  period: 'this week',
  goal: 2000,
  progress: 1435,
};

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };

const formatNumber = (value: number) => value.toLocaleString('en-US');

// Standard colors (see updated_requirements.md) plus the challenge-group greens.
const COLOR_GREEN_FILL = '#8dbf21';
const COLOR_INITIALS = '#2c353b';
const COLOR_GOLD = '#e3a64e';
const COLOR_TEXT = '#c5d7e2';

function Circle({
  children,
  label,
  fill,
  gold,
}: {
  children?: string;
  label: string;
  fill?: boolean;
  gold?: boolean;
}) {
  const base = 'flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold';
  const style = fill
    ? { ...fontSans3, backgroundColor: COLOR_GREEN_FILL, color: COLOR_INITIALS }
    : gold
      ? { ...fontSans3, border: `3px solid ${COLOR_GOLD}`, color: COLOR_GOLD }
      : { ...fontSans3, border: `1.5px solid ${COLOR_TEXT}`, color: COLOR_TEXT };

  return (
    <li role="listitem" aria-label={label} className={`${base} list-none`} style={style}>
      {children}
    </li>
  );
}

export function ChallengeGroupToday() {
  const checkedInCount = CHECKED_IN_INITIALS.length + (YOU_CHECKED_IN ? 1 : 0);
  const progressPercent = Math.max(
    0,
    Math.min(100, (GROUP_CHALLENGE.progress / GROUP_CHALLENGE.goal) * 100),
  );

  return (
    <div
      className="w-full rounded-lg bg-[#3a3c4e] px-8 py-8"
      aria-label="Your challenge group today"
    >
      <h2
        className="text-xl font-semibold uppercase tracking-[0.08em] text-[#c5d7e2]"
        style={fontSans3}
      >
        Your challenge group today
      </h2>

      <p className="mt-3 text-3xl font-bold text-[#c5d7e2]" style={fontSans3}>
        {checkedInCount} of {TOTAL_MEMBERS} checked in
      </p>

      <ul className="mt-8 flex flex-wrap gap-x-14 gap-y-10">
        {CHECKED_IN_INITIALS.map((initials, index) => (
          <Circle key={`${initials}-${index}`} label={`Warrior ${initials} checked in today`} fill>
            {initials}
          </Circle>
        ))}

        <Circle label={YOU_CHECKED_IN ? 'You checked in today' : "You haven't checked in yet"} gold>
          You
        </Circle>

        {Array.from({ length: OTHER_NOT_CHECKED_IN }, (_, index) => (
          <Circle key={`not-checked-in-${index}`} label="Warrior has not checked in today" />
        ))}
      </ul>

      <p className="mt-10 text-xl text-[#c5d7e2]" style={fontSans3}>
        Green = checked in today · Gold outline = You
      </p>

      {/* Group challenge progress */}
      <p className="mt-8 text-2xl font-bold text-[#c5d7e2]" style={fontSans3}>
        Group goal: {formatNumber(GROUP_CHALLENGE.goal)} {GROUP_CHALLENGE.unit}{' '}
        {GROUP_CHALLENGE.period}
      </p>

      <div className="mt-4 flex items-center gap-4">
        <div
          role="progressbar"
          aria-label="Group challenge progress"
          aria-valuemin={0}
          aria-valuemax={GROUP_CHALLENGE.goal}
          aria-valuenow={GROUP_CHALLENGE.progress}
          className="h-3.5 flex-1 overflow-hidden rounded-full bg-[#3f4d66]"
        >
          <div
            className="h-full rounded-full bg-[#8c8fd0]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <p className="shrink-0 text-2xl font-bold text-[#c5d7e2]" style={fontSans3}>
          {formatNumber(GROUP_CHALLENGE.progress)} minutes
        </p>
      </div>
    </div>
  );
}
