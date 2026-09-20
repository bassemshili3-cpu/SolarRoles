import type { Metadata } from "next";
import SolarHoursChecker from "./SolarHoursChecker";
import EmbedCode from "../EmbedCode";

const canonical = "https://www.solarroles.com/tools/solar-apprenticeship-hours-checker";

export const metadata: Metadata = {
  title: "Do Solar Work Hours Count Toward an Electrician License? | Solar Roles",
  description:
    "Check whether solar electrical work may fit electrician licensing, apprenticeship or contractor-experience rules across all 50 U.S. states.",
  alternates: { canonical },
  openGraph: {
    title: "Solar Apprenticeship Hours Checker",
    description:
      "Review common state rules that can affect whether solar work experience counts toward an electrician credential.",
    url: canonical,
    siteName: "Solar Roles",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Solar Apprenticeship Hours Checker",
  url: canonical,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  isAccessibleForFree: true,
  provider: {
    "@type": "Organization",
    name: "Solar Roles",
    url: "https://www.solarroles.com/",
  },
  description:
    "An informational screening tool that compares reported solar work experience with selected electrician licensing and apprenticeship rules published by state agencies.",
};

export default async function SolarApprenticeshipHoursCheckerPage({
  searchParams,
}: {
  searchParams: Promise<{
    state?: string | string[];
    state_only?: string | string[];
    accent?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const initialState = Array.isArray(params.state) ? params.state[0] : params.state;
  const stateOnlyParam = Array.isArray(params.state_only)
    ? params.state_only[0]
    : params.state_only;
  const stateOnly = stateOnlyParam === "1" || stateOnlyParam?.toLowerCase() === "true";
  const accent = Array.isArray(params.accent) ? params.accent[0] : params.accent;

  return (
    <main className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <a href="/" className="hover:text-slate-800">
            Home
          </a>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <a href="/tools" className="hover:text-slate-800">
            Tools
          </a>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-slate-700">Solar Apprenticeship Hours Checker</span>
        </nav>

        <header className="max-w-4xl pb-9 pt-8 sm:pb-11">
          <p className="text-sm font-semibold text-emerald-800">Licensing and apprenticeship</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Do your solar work hours count toward an electrician license?
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Solar work does not receive automatic credit simply because it involves a photovoltaic system. State rules may depend on the work performed, employer licensing, supervision, apprenticeship status, work categories and documentation.
          </p>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-slate-600">
            Use this checker to identify common requirements that may affect your hours before you rely on them for a license application. Results are based on published state guidance and are not an agency determination.
          </p>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span>All 50 states covered</span>
            <span>Official sources shown with every result</span>
            <span>No sign-up required</span>
          </div>
        </header>

        <SolarHoursChecker initialState={initialState} stateOnly={stateOnly} accent={accent} />

        <EmbedCode />

        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">What this checker reviews</h2>
              <p className="mt-3 text-[15px] leading-7 text-slate-600">
                The checker is designed to flag requirements that are easy to miss when solar workers move between employers, projects or states. It does not replace an apprenticeship record or a licensing-agency review.
              </p>
            </div>
            <dl className="space-y-5 text-sm leading-6">
              <div>
                <dt className="font-semibold text-slate-950">Type of work</dt>
                <dd className="mt-1 text-slate-600">Electrical installation and maintenance may be treated differently from racking, material handling, monitoring or other non-electrical duties.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Supervision and employer status</dt>
                <dd className="mt-1 text-slate-600">Some states require work under a specific licensed electrician or for a contractor holding a specific classification.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Registration and apprenticeship</dt>
                <dd className="mt-1 text-slate-600">A valid trainee registration or registered apprenticeship may be a condition of receiving experience credit.</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-950">Documentation and deadlines</dt>
                <dd className="mt-1 text-slate-600">Experience can depend on affidavits, employment records, supervisor verification or other documentation submitted under state rules.</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950">How 50-state coverage works</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Electrical licensing is not organized the same way in every state. The checker follows the structure published by the relevant state authority instead of forcing every worker into one 8,000-hour model.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-950">Statewide worker credentials</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Where a state publishes a journeyman or specialty-worker experience requirement, the checker compares reported experience with that pathway and flags supervision, registration, education or work-scope conditions.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Apprenticeship-based pathways</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Where completion of an approved or registered apprenticeship controls eligibility, the checker treats program status as a requirement rather than assuming that a raw hour total is sufficient.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Local licensing states</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Where cities or counties control electrician licensing, the checker asks for the jurisdiction and explains why a single statewide hours answer would be unreliable.</p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Contractor-based states</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Where the state primarily licenses electrical contractors or qualifying individuals, the result identifies that framework rather than presenting contractor experience as a statewide journeyman-worker requirement.</p>
            </div>
          </div>
        </section>

        <section className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Before you use the result</h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            Licensing rules change, and agencies may consider facts that a web checker cannot verify. Keep copies of employment records, apprenticeship records, licenses or certificates, supervisor information and documents showing the work you actually performed. When a result identifies an unresolved requirement, verify it with the issuing agency or your registered apprenticeship program before relying on the hours.
          </p>
        </section>
      </div>
    </main>
  );
}
