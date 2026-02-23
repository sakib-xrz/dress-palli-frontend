import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-pink-50/50 to-purple-50/50 px-4 text-center">
      <h1 className="mb-2 text-8xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
        404
      </h1>
      <h2 className="mb-4 text-2xl font-semibold text-gray-900">
        Page Not Found
      </h2>
      <p className="mb-8 max-w-md text-gray-600">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
        have been moved or no longer exists.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 px-6 py-3 text-sm font-medium text-white shadow-md transition-all hover:from-pink-700 hover:to-purple-700 hover:shadow-lg"
      >
        ← Back to Home
      </Link>
    </div>
  );
}
