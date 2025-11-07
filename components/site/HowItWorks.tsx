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
    <section className="py-20 md:py-32 bg-hero" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold md:text-4xl lg:text-5xl mb-4">
            {t("howAinexoWorks")}
          </h3>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/30">
                    {step.number}
                  </div>

                  <h4 className="text-xl font-bold">{step.title}</h4>

                  <p className="text-muted-foreground">{step.description}</p>
                </div>

                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-accent/50" />
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
