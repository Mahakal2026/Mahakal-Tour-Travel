interface SectionHeaderProps {
  subtitle: string;
  title: string;
  description?: string;
  light?: boolean;
}

export default function SectionHeader({
  subtitle,
  title,
  description,
  light = false,
}: SectionHeaderProps) {
  return (
    <div className="text-center max-w-3xl mx-auto mb-16">
      <span className={`section-subtitle ${light ? "text-saffron-400" : ""}`}>
        {subtitle}
      </span>
      <h2
        className={`text-3xl sm:text-4xl font-extrabold mt-2 font-cinzel ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-4 ${
            light ? "text-slate-300" : "text-slate-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
