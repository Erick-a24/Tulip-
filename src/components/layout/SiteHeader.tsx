import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold text-slate-900">
          Tulip Events
        </Link>
        <Link href="/admin-login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
          Organizer sign in
        </Link>
      </div>
    </header>
  );
}
