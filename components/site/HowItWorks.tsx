import { useTranslations } from "next-intl";

const HowItWorks = () => {
  const t = useTranslations("howItWorks");

  const steps = [
    {
      number: "1",
      title: t("step1Title"),
      description: t("step1Description"),
    },
    {
      number: "2",
      title: t("step2Title"),
      description: t("step2Description"),
    },
    {
      number: "3",
      title: t("step3Title"),
      description: t("step3Description"),
    },
    {
      number: "4",
      title: t("step4Title"),
      description: t("step4Description"),
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-32 bg-hero" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl mb-3 sm:mb-4">
            {t("howAinexoWorks")}
          </h3>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 p-4 sm:p-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xl sm:text-2xl font-bold shadow-lg shadow-primary/30">
                    {step.number}
                  </div>

                  <h4 className="text-lg sm:text-xl font-bold">{step.title}</h4>

                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
