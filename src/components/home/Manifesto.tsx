type ManifestoProps = {
  quote?: string
  imageUrl?: string
}

export function Manifesto({
  quote = "Nothing feels as good as feeling good feels feels!",
  imageUrl,
}: ManifestoProps) {
  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-stone-50">
      {imageUrl && (
        <img
          src={imageUrl}
          alt=""
          className="absolute inset-y-0 right-0 z-0 h-full w-2/3 object-cover"
        />
      )}

      <div className="relative z-10 flex min-h-[280px] w-full items-center px-6 sm:px-12">
        <div className="w-1/2">
          <blockquote className="text-2xl font-medium italic leading-tight text-stone-900 sm:text-3xl">
            &ldquo;{quote}&rdquo;
          </blockquote>
        </div>
      </div>
    </section>
  )
}
