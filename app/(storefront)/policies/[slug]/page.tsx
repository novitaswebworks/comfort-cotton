import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { POLICIES, POLICY_SLUGS, type PolicySlug } from "@/lib/policies";
import { SITE_NAME } from "@/lib/site";

export function generateStaticParams() {
  return POLICY_SLUGS.map((slug) => ({ slug }));
}

function getPolicy(slug: string) {
  return (POLICY_SLUGS as readonly string[]).includes(slug) ? POLICIES[slug as PolicySlug] : undefined;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Page not found" };
  return {
    title: policy.title,
    description: policy.description,
    alternates: { canonical: `/policies/${slug}` },
    openGraph: { title: `${policy.title} | ${SITE_NAME}`, description: policy.description, url: `/policies/${slug}` },
  };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <main className="relative min-h-screen w-full bg-background pt-32 pb-24 text-foreground">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium hover:opacity-70 transition-opacity mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Link>
        <h1 className="text-4xl md:text-6xl font-light mb-12 tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          {policy.title}
        </h1>
        <div className="space-y-10">
          {policy.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-sm font-medium tracking-widest uppercase mb-3">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="text-muted-foreground leading-relaxed mb-3">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
        <nav aria-label="Policies" className="mt-16 pt-8 border-t border-border flex flex-wrap gap-x-8 gap-y-3">
          {POLICY_SLUGS.filter((s) => s !== slug).map((s) => (
            <Link key={s} href={`/policies/${s}`} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              {POLICIES[s].title}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
}
