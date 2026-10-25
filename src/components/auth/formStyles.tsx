// Shared field/button styling for the public auth forms.
export const inputClass =
  'w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-stone-900 placeholder-stone-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600';

export const buttonClass =
  'w-full rounded-[999px] bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60';

export const fieldLabelClass = 'mb-1 block text-sm font-semibold text-stone-700';

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ${
        error ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-800'
      }`}
    >
      {error || success}
    </p>
  );
}
