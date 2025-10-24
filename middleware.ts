// middleware.ts
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

// List of supported locales
const locales = ["nl", "en", "de", "fr", "es"];
const defaultLocale = "nl";

// Paths that don't require authentication and should not have locale prefix
const noLocalePaths = [
  "/login",
  "/register",
  "/2fa-verify",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/beta-registration",
];

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invitation",
  "/beta-registration",
];

// Paths related to 2FA that are accessible during partial authentication
const twoFactorPaths = ["/2fa-verify"];

// Get the preferred locale from headers
function getLocale(request: NextRequest) {
  // First, check for locale in URL path (e.g., /nl/, /en/)
  const pathSegments = request.nextUrl.pathname.split("/");
  const firstSegment = pathSegments[1];

  if (firstSegment && locales.includes(firstSegment)) {
    return firstSegment;
  }

  // Check for NEXT_LOCALE cookie
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale)) {
    return cookieLocale;
  }

  // Use Accept-Language header as fallback
  const headers = Object.fromEntries(request.headers);
  const languages = new Negotiator({ headers }).languages();

  try {
    // Match the best available locale
    return match(languages, locales, defaultLocale);
  } catch (error) {
    return defaultLocale;
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Skip processing for API routes, static files, etc.
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api/") ||
    path.includes("/images/") ||
    path.includes(".") || // For static files
    path.includes("/api/auth/signout") // Skip middleware for signout
  ) {
    return NextResponse.next();
  }

  // Get the preferred locale
  const locale = getLocale(req);

  // Extract the path without locale if present
  const pathWithoutLocale =
    path.replace(new RegExp(`^/(${locales.join("|")})`), "") || "/";

  // Check if the current path has a locale prefix
  const hasLocalePrefix = path.match(new RegExp(`^/(${locales.join("|")})`));

  // Create a response object that we can modify
  let response: NextResponse;

  // Check if path should not have locale prefix
  const isNoLocalePath = noLocalePaths.some(
    (noLocalePath) =>
      pathWithoutLocale === noLocalePath ||
      pathWithoutLocale.startsWith(`${noLocalePath}/`)
  );

  // Check if path is a public path (without locale)
  const isPublicPath = publicPaths.some(
    (publicPath) =>
      pathWithoutLocale === publicPath ||
      pathWithoutLocale.startsWith(`${publicPath}/`)
  );

  // Check if path is a 2FA-related path (without locale)
  const is2FAPath = twoFactorPaths.some(
    (twoFactorPath) =>
      pathWithoutLocale === twoFactorPath ||
      pathWithoutLocale.startsWith(`${twoFactorPath}/`)
  );

  // If this is a path that should not have locale prefix and it has one, remove it
  if (isNoLocalePath && hasLocalePrefix) {
    const url = new URL(pathWithoutLocale, req.url);
    url.search = req.nextUrl.search;
    return NextResponse.redirect(url);
  }

  // Check if this is the root path that needs locale redirection
  if (pathWithoutLocale === "/" && !hasLocalePrefix) {
    // Redirect to the default route with locale prefix
    const url = new URL(`/${locale}`, req.url);
    response = NextResponse.redirect(url);
  }
  // Check if this is a public path that needs locale prefix (excluding no-locale paths)
  else if (isPublicPath && !isNoLocalePath && !hasLocalePrefix) {
    // Redirect to public path with locale prefix
    const url = new URL(`/${locale}${pathWithoutLocale}`, req.url);
    response = NextResponse.redirect(url);
  } else if (isPublicPath) {
    // Allow access to public paths with locale
    response = NextResponse.next();
  } else {
    // Get user token for protected routes
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Not authenticated, redirect to login without locale
    if (!token) {
      const url = new URL(`/login`, req.url);
      // Only set callbackUrl if we're not on the root path
      if (pathWithoutLocale !== "/") {
        url.searchParams.set("callbackUrl", req.url);
      }
      return NextResponse.redirect(url);
    }

    // If the user requires 2FA but hasn't completed it yet
    if (token.requires2FA === true && token.twoFactorAuthenticated !== true) {
      // If already on a 2FA path, allow access
      if (is2FAPath) {
        response = NextResponse.next();
      } else {
        // Redirect to 2FA verification without locale
        const url = new URL(`/2fa-verify`, req.url);
        if (token.email) {
          url.searchParams.set("email", token.email as string);
        }
        url.searchParams.set("callbackUrl", req.url);
        return NextResponse.redirect(url);
      }
    } else {
      // Fully authenticated, allow access to all paths
      response = NextResponse.next();
    }
  }

  // Store the detected locale in a cookie for future requests
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 31536000, // 1 year
  });

  // Add comprehensive security headers
  addSecurityHeaders(response);

  return response;
}

/**
 * Add comprehensive security headers to protect against common web vulnerabilities
 */
function addSecurityHeaders(response: NextResponse): void {
  const headers = response.headers;

  // Content-Security-Policy (CSP)
  // Prevents XSS attacks by controlling which resources can be loaded
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.openai.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
  headers.set("Content-Security-Policy", cspDirectives);

  // X-Frame-Options
  // Prevents clickjacking attacks by preventing the site from being embedded in iframes
  headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options
  // Prevents MIME sniffing attacks by forcing browsers to respect Content-Type headers
  headers.set("X-Content-Type-Options", "nosniff");

  // Strict-Transport-Security (HSTS)
  // Forces browsers to use HTTPS for all future connections (1 year)
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // X-XSS-Protection
  // Enables browser's built-in XSS filter (legacy but still useful)
  headers.set("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  // Controls how much referrer information is sent with requests
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy (formerly Feature-Policy)
  // Controls which browser features and APIs can be used
  const permissionsPolicy = [
    "camera=()",
    "microphone=()",
    "geolocation=()",
    "interest-cohort=()",
    "payment=()",
    "usb=()",
  ].join(", ");
  headers.set("Permissions-Policy", permissionsPolicy);

  // X-Permitted-Cross-Domain-Policies
  // Prevents Adobe Flash and PDF files from accessing content
  headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // X-DNS-Prefetch-Control
  // Controls DNS prefetching to prevent privacy leaks
  headers.set("X-DNS-Prefetch-Control", "off");
}

// Specify paths that should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Including locale paths like /nl/, /en/, etc.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
