const SectionHeading = ({
  title,
  subtitle,
  className = "",
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) => (
  <div className={`text-center mb-16 ${className}`}>
    <h2 className="font-heading text-3xl md:text-5xl font-semibold text-foreground mb-4">
      {title}
    </h2>
    <div className="gold-divider mb-6" />
    {subtitle && (
      <p className="text-muted-foreground font-body text-lg max-w-2xl mx-auto leading-relaxed">
        {subtitle}
      </p>
    )}
  </div>
);

export default SectionHeading;
