import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 px-4 text-center">
      <h1 className="mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-8xl font-bold text-transparent">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
        have been moved or no longer exists.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-primary-foreground shadow-md transition-opacity hover:opacity-90"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
