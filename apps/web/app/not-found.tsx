import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-5xl text-ink">Not found</h1>
      <p className="mt-3 text-ink/60">
        This listing, city, or page doesn&apos;t exist — or it may have been removed.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/predict" className="btn-secondary">
          Price Prediction
        </Link>
      </div>
    </div>
  );
}
