// components/home/HowItWorks.tsx
import { Camera, Edit, Check, Euro } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HowItWorks() {
  const t = useTranslations("how_it_works");

  const steps = [
    {
      icon: Camera,
      title: t("step_1"),
      description: t("step_1_description"),
    },
    {
      icon: Edit,
      title: t("step_2"),
      description: t("step_2_description"),
    },
    {
      icon: Check,
      title: t("step_3"),
      description: t("step_3_description"),
    },
    {
      icon: Euro,
      title: t("step_4"),
      description: t("step_4_description"),
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t("title")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white mb-4 relative">
                    <Icon size={24} />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-indigo-400 rounded-full flex items-center justify-center text-sm font-bold border-2 border-indigo-400">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full">
                    <div className="w-full h-0.5 bg-gray-300 relative">
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-0 h-0 border-l-8 border-l-gray-300 border-y-4 border-y-transparent"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
