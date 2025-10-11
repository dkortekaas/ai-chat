// components/home/Footer.tsx
import Link from "next/link";
import { Twitter, Linkedin, Instagram, Mail, MapPin } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Image
                  src="/declair-logo.svg"
                  alt="Declair"
                  width={40}
                  height={40}
                />
              </div>
              <span className="text-xl font-bold text-white">Declair</span>
            </div>
            <p className="text-sm">{t("description")}</p>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">{t("product")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#features" className="hover:text-white">
                  {t("features")}
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="hover:text-white">
                  {t("pricing")}
                </Link>
              </li>
              {/* <li>
                <Link href='/api' className='hover:text-white'>
                  {t("api")}
                </Link>
              </li>
              <li>
                <Link href='/integrations' className='hover:text-white'>
                  {t("integrations")}
                </Link>
              </li> */}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">{t("company")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register" className="hover:text-white">
                  {t("register")}
                </Link>
              </li>
              {/* <li>
                <Link href='/careers' className='hover:text-white'>
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link href='/press' className='hover:text-white'>
                  {t("press")}
                </Link>
              </li> */}
              <li>
                <Link
                  href="mailto:hello@declair.app"
                  className="hover:text-white"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-medium mb-4">{t("contact")}</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <Link href="mailto:info@declair.app">{t("email")}</Link>
              </li>
              <li className="flex items-center">
                <MapPin size={16} className="mr-2" />
                {t("address")}
              </li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://twitter.com/declair_app"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
                title="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://linkedin.com/company/declair-app"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
                title="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://instagram.com/declair.app"
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Declair. {t("rights")}
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {/* <Link
              href='/privacy'
              className='text-sm text-gray-400 hover:text-white'
            >
              {t("privacy")}
            </Link>
            <Link
              href='/terms'
              className='text-sm text-gray-400 hover:text-white'
            >
              {t("terms")}
            </Link> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
