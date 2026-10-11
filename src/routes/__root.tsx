import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Header, Footer } from "@/components/localmart/shared";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";
import { useAuth } from "@/lib/use-auth";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </Button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LOCALMART — Discover local" },
      { name: "description", content: "Discover local. Shop nearby. Support small." },
      
      { property: "og:title", content: "LOCALMART" },
      { property: "og:description", content: "Discover local. Shop nearby. Support small." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout min-h-screen w-full">
      {children}
    </div>
  );
}

function MarketplaceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function RootContent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { currentUser, role, loading } = useAuth();

  // Invalidate and clear React Query cache whenever user logs out
  useEffect(() => {
    const handleAuthChange = () => {
      const activeId = localStorage.getItem('localmart_active_user_id');
      if (!activeId) {
        queryClient.clear();
      }
    };
    window.addEventListener('localmart:auth-changed', handleAuthChange);
    return () => window.removeEventListener('localmart:auth-changed', handleAuthChange);
  }, [queryClient]);

  const isAuthRoute = pathname === '/login';

  // React Router route guard navigation handled after render
  useEffect(() => {
    if (loading) return;

    if (!currentUser && !isAuthRoute) {
      // Unauthenticated: redirect to /login and preserve destination
      const currentFull = window.location.pathname !== '/'
        ? `${window.location.pathname}${window.location.search}`
        : undefined;

      router.navigate({
        to: '/login',
        search: currentFull ? { redirect: currentFull } : undefined,
        replace: true,
      });
    } else if (currentUser && isAuthRoute) {
      // Authenticated user on /login: route to role landing page
      const target = role === 'ADMIN' ? '/admin' : role === 'SELLER' ? '/seller' : '/';
      router.navigate({ to: target, replace: true });
    }
  }, [loading, currentUser, isAuthRoute, role, router]);

  // While checking auth status initially, display a clean neutral brand splash (prevent marketplace flash)
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#faf7f2] text-foreground">
        <div className="flex items-center gap-2.5 mb-4">
          <Store className="w-8 h-8 text-[#d97d64]" strokeWidth={2} />
          <span className="text-2xl font-bold tracking-tight text-[#c86144]">LOCALMART</span>
        </div>
        <div className="w-6 h-6 border-2 border-[#d97d64] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs uppercase tracking-widest text-[#8c7e75]">Connecting to marketplace…</p>
      </div>
    );
  }

  // Unauthenticated user
  if (!currentUser) {
    if (!isAuthRoute) {
      // Suppress marketplace layout flash while router transitions to /login
      return null;
    }
    return (
      <AuthLayout>
        <Outlet />
      </AuthLayout>
    );
  }

  // Authenticated user visiting /login
  if (isAuthRoute) {
    // Suppress login form flash while router transitions to authenticated landing view
    return null;
  }

  // Authenticated user on standard marketplace routes
  return (
    <MarketplaceLayout>
      <Outlet />
    </MarketplaceLayout>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <RootContent />
    </QueryClientProvider>
  );
}
