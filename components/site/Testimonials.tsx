// components/home/Testimonials.tsx
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import lisa from "@/public/people/lisa.jpg";

export default function Testimonials() {
  const t = useTranslations("testimonials");

  const testimonials = [
    {
      name: "Lisa van der Berg",
      role: t("role_1"),
      content: t("content_1"),
      avatar: lisa,
      rating: 5,
    },
    // {
    //   name: "Mark Jansen",
    //   role: t("role_2"),
    //   content: t("content_2"),
    //   avatar: "/api/placeholder/64/64",
    //   rating: 5,
    // },
    // {
    //   name: "Sophie de Vries",
    //   role: t("role_3"),
    //   content: t("content_3"),
    //   avatar: "/api/placeholder/64/64",
    //   rating: 5,
    // },
  ];

  return (
    <section id='testimonials' className='py-20 px-4 bg-gray-50'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            {t("title")}
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            {t("description")}
          </p>
        </div>

        <div
          className={`grid gap-8 ${
            testimonials.length === 1
              ? "md:grid-cols-1 max-w-2xl mx-auto"
              : "md:grid-cols-3"
          }`}
        >
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className='bg-white p-6 rounded-lg border border-gray-200'
            >
              <div className='flex mb-4'>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className='w-5 h-5 text-yellow-400 fill-current'
                  />
                ))}
              </div>
              <p className='text-gray-600 mb-6 italic'>
                &ldquo;{testimonial.content}&rdquo;
              </p>
              <div className='flex items-center'>
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className='rounded-full mr-4'
                />
                <div>
                  <h4 className='font-medium text-gray-900'>
                    {testimonial.name}
                  </h4>
                  <p className='text-sm text-gray-600'>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
