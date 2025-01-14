import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import NextAuth from 'next-auth';
import authConfig from './auth.config';

// Pages accessibles sans authentification
const publicPages = [
  '/',
  '/search',
  '/sign-in',
  '/sign-up',
  '/cart',
  '/cart/(.*)',
  '/product/(.*)',
  '/page/(.*)',
];

// Middleware pour next-intl
const intlMiddleware = createMiddleware(routing);

// Middleware pour NextAuth
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  // Vérifie si la page est publique
  const publicPathnameRegex = RegExp(
    `^(/(${routing.locales.join('|')}))?(${publicPages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(req.nextUrl.pathname);

  if (isPublicPage) {
    // Applique le middleware next-intl pour les pages publiques
    return intlMiddleware(req);
  } else {
    // Vérifie si l'utilisateur est authentifié
    if (!req.auth) {
      // Redirige vers la page de connexion avec un callbackUrl
      const newUrl = new URL(
        `/sign-in?callbackUrl=${
          encodeURIComponent(req.nextUrl.pathname) || '/'
        }`,
        req.nextUrl.origin
      );
      return Response.redirect(newUrl);
    } else {
      // Applique le middleware next-intl pour les pages privées
      return intlMiddleware(req);
    }
  }
});

export const config = {
  // Exclut les routes API, les fichiers statiques, et les fichiers Next.js
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};