type CatalogHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

/** Shared ink hero band for catalog / listing pages */
export function CatalogHero({ eyebrow, title, description }: CatalogHeroProps) {
  return (
    <div className="bg-[#1A1611] text-[#F6F3EC] w-full overflow-x-clip">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-16">
        {eyebrow ? <p className="eyebrow text-[#C49A5C]">{eyebrow}</p> : null}
        <h1 className="mt-3 font-display text-[1.75rem] leading-tight sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight max-w-full sm:max-w-[18ch] break-words">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 sm:mt-4 max-w-xl text-sm sm:text-base text-[#F6F3EC]/65 leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

type EmptyCatalogProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function EmptyCatalog({ title, description, children }: EmptyCatalogProps) {
  return (
    <div className="rounded-md border border-line bg-paper p-6 sm:p-10 md:p-12">
      <p className="font-display text-lg sm:text-xl font-semibold text-ink">{title}</p>
      <p className="mt-2 text-sm text-ink-500 max-w-md leading-relaxed">{description}</p>
      {children ? <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">{children}</div> : null}
    </div>
  );
}
