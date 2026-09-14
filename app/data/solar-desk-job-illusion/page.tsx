import type { Metadata } from "next";

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/data/solar-desk-job-illusion";
const TITLE =
  "Solar Project Management Jobs Mention Travel 2.3× More Often Than Installer Jobs";
const DESCRIPTION =
  "Solar Roles reviewed 404 deduplicated US solar employer-role combinations. 58.6% of project-management ads disclosed travel requirements, versus 25.8% of installer and electrical ads.";

export const metadata: Metadata = {
  title: `${TITLE} | Solar Roles`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    type: "article",
    publishedTime: "2026-09-13T00:00:00.000Z",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const primary = {
  projectManagement: {
    reviewed: 140,
    travel: 82,
    rate: 58.6,
    companies: 83,
  },
  installerElectrical: {
    reviewed: 264,
    travel: 68,
    rate: 25.8,
    companies: 123,
  },
};

const sourceChecks = [
  {
    source: "Adzuna",
    project: "59.3%",
    projectN: "70 of 118",
    installer: "25.1%",
    installerN: "58 of 231",
  },
  {
    source: "Direct ATS feeds",
    project: "68.8%",
    projectN: "22 of 32",
    installer: "27.3%",
    installerN: "12 of 44",
  },
];

const examples = [
  {
    company: "Mortenson",
    role: "Construction Electrical Project Manager I - Solar",
    disclosure: "100% travel",
    excerpt: "This is a 100% travel position",
    href: "https://www.adzuna.com/details/5822579475?utm_medium=api&utm_source=1c651ba2",
  },
  {
    company: "SOLV Energy",
    role: "EPC Project Manager, Utility Scale Solar",
    disclosure: "Minimum 50%",
    excerpt: "travel extensively (minimum 50%)",
    href: "https://solvenergy.wd1.myworkdayjobs.com/SOLV_External_Career/job/Tonopah-AZ/EPC-Project-Manager--Utility-Scale-Solar--Tonopah--AZ-_J13361",
  },
  {
    company: "Origis Energy",
    role: "Solar EPC Project Manager or Senior Project Manager",
    disclosure: "Up to 40%",
    excerpt: "Up to 40% travel as needed",
    href: "https://www.adzuna.com/details/5787830500?utm_medium=api&utm_source=1c651ba2",
  },
  {
    company: "Melink Solar",
    role: "Solar Project Manager",
    disclosure: "Up to 25%",
    excerpt: "Up to 25% travel required",
    href: "https://www.adzuna.com/details/5594417087?utm_medium=api&utm_source=1c651ba2",
  },
];

function StatCard({
  value,
  label,
  note,
}: {
  value: string;
  label: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium text-slate-800">{label}</div>
      {note ? <div className="mt-1 text-xs leading-5 text-slate-500">{note}</div> : null}
    </div>
  );
}

function Bar({
  label,
  value,
  count,
  max = 100,
}: {
  label: string;
  value: number;
  count: string;
  max?: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="mt-0.5 text-xs text-slate-500">{count}</div>
        </div>
        <div className="text-2xl font-semibold tabular-nums text-slate-950">
          {value.toFixed(1)}%
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-amber-500"
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function SolarDeskJobIllusionReport() {
  return (
    <main className="bg-white text-slate-900">
      <article className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <a
          href="/data"
          className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          ← All solar market data
        </a>

        <header className="mt-8 max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
            Solar Roles Research · Project management
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-slate-950 sm:text-5xl sm:leading-[1.05]">
           Solar project-management ads are 2.3× more likely to disclose travel
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Solar Roles reviewed 404 deduplicated US solar employer-role
            combinations. Travel requirements appeared in 58.6% of
            project-management postings, compared with 25.8% of installer and
            electrical postings.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">By Solar Roles Research</span>
            <span aria-hidden="true">·</span>
            <time dateTime="2026-09-13">September 13, 2026</time>
            <span aria-hidden="true">·</span>
            <span>Frozen US job-description snapshot</span>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#comparison"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
            >
              See the comparison
            </a>
            <a
              href="#evidence"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
            >
              Read listing examples
            </a>
            <a
              href="#utility-scale-check"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
            >
              Utility-scale check
            </a>
            <a
              href="#methodology"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-500"
            >
              How we reviewed the data
            </a>
          </div>
        </header>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <StatCard
            value="58.6%"
            label="Project-management roles mentioning travel"
            note="82 of 140 deduplicated employer-role combinations"
          />
          <StatCard
            value="25.8%"
            label="Installer / electrical roles mentioning travel"
            note="68 of 264 deduplicated employer-role combinations"
          />
          <StatCard
            value="2.27×"
            label="Higher disclosure rate"
            note="A 32.8 percentage-point gap"
          />
        </section>

        <section id="comparison" className="mt-14 scroll-mt-24">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Travel requirements were more common in project-management postings
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Of the 140 project-management employer-role combinations in the
              primary sample, 82 disclosed a travel requirement. Among 264
              installer and electrical combinations, 68 did so. That works out
              to 58.6% and 25.8%, respectively.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The measure is limited to language published in the job ad. It
              captures whether travel was disclosed as part of the role; it does
              not measure miles traveled, nights away from home, or the schedule
              employees ultimately worked after hire.
            </p>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Share of reviewed roles with an explicit travel requirement
            </div>

            <div className="mt-7 space-y-7">
              <Bar
                label="Solar project management"
                value={58.6}
                count="82 of 140 employer-role combinations"
              />
              <Bar
                label="Solar install / electrical"
                value={25.8}
                count="68 of 264 employer-role combinations"
              />
            </div>

            <p className="mt-6 text-xs leading-5 text-slate-500">
              Primary sample: roles with an explicit solar, PV, BESS, battery or
              renewable-energy signal in the title and a qualifying
              project-management or installer/electrical title. Duplicate
              employer-role descriptions were grouped before calculating the
              shares.
            </p>
          </div>
        </section>

        <section id="evidence" className="mt-14 scroll-mt-24">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Examples of travel requirements in project-management postings
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The reviewed postings included roles listing 25% travel, 40%
              travel, minimum 50% travel, and 100% travel. The examples below
              show the range of language employers used. All headline rates are
              calculated from the full primary sample.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {examples.map((item) => (
              <a
                key={`${item.company}-${item.role}`}
                href={item.href}
                target="_blank"
                rel="nofollow noreferrer"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-950">
                      {item.company}
                    </div>
                    <div className="mt-1 text-sm leading-6 text-slate-600">
                      {item.role}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                    {item.disclosure}
                  </div>
                </div>

                <blockquote className="mt-5 border-l-2 border-amber-400 pl-4 text-sm italic leading-6 text-slate-700">
                  “{item.excerpt}”
                </blockquote>

                <div className="mt-4 text-xs font-semibold text-slate-500 group-hover:text-slate-800">
                  Open source listing ↗
                </div>
              </a>
            ))}
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-500">
            Travel was also disclosed in 68 installer and electrical
            combinations. The comparison concerns the frequency of disclosure
            in each cohort, rather than the presence or absence of travel in
            either occupation.
          </p>
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Results by collection source
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Project-management postings had the higher travel-disclosure rate
              in both collection streams. Adzuna produced a 59.3% rate for
              project management and 25.1% for install/electrical. Direct ATS
              feeds produced rates of 68.8% and 27.3%.
            </p>
          </div>

          <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.2fr_1fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:px-5">
              <div>Collection source</div>
              <div>Project management</div>
              <div>Install / electrical</div>
            </div>
            {sourceChecks.map((row) => (
              <div
                key={row.source}
                className="grid grid-cols-[1.2fr_1fr_1fr] border-t border-slate-200 px-4 py-4 text-sm sm:px-5"
              >
                <div className="font-semibold text-slate-900">{row.source}</div>
                <div>
                  <div className="font-semibold tabular-nums text-slate-950">
                    {row.project}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{row.projectN}</div>
                </div>
                <div>
                  <div className="font-semibold tabular-nums text-slate-950">
                    {row.installer}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{row.installerN}</div>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-500">
            These source-specific rates are reported separately and are not
            added together. Cross-source duplicates were merged for the primary
            404-role calculation. The direct-ATS project-management sample is
            smaller than the Adzuna sample.
          </p>
        </section>

        <section id="utility-scale-check" className="mt-14 scroll-mt-24">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Project-scale robustness check
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Utility-scale postings show a smaller gap
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Project scale is a potential source of bias in the main
              comparison because project-management roles may be more heavily
              represented in utility-scale construction. We repeated the
              analysis using only primary-cohort postings that explicitly
              referenced utility-scale solar, a solar farm, ground-mount solar,
              or solar EPC work.
            </p>
          </div>

          <div className="mt-7 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Utility-scale-tagged roles with an explicit travel disclosure
            </div>

            <div className="mt-7 space-y-7">
              <Bar
                label="Utility-scale solar project management"
                value={70.5}
                count="62 of 88 deduplicated employer-role combinations"
              />
              <Bar
                label="Utility-scale solar install / electrical"
                value={56.8}
                count="25 of 44 deduplicated employer-role combinations"
              />
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-2xl font-semibold tabular-nums text-slate-950">
                  70.5%
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-500">
                  Project-management travel disclosure
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-2xl font-semibold tabular-nums text-slate-950">
                  56.8%
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-500">
                  Installer / electrical travel disclosure
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-2xl font-semibold tabular-nums text-slate-950">
                  +13.7 pts
                </div>
                <div className="mt-1 text-xs leading-5 text-slate-500">
                  Remaining gap after controlling for project scale
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm leading-6 text-slate-600">
              Travel was disclosed in 62 of 88 utility-scale
              project-management combinations (70.5%) and 25 of 44
              utility-scale installer/electrical combinations (56.8%). The gap
              falls from 32.8 percentage points in the primary comparison to
              13.7 points in this restricted sample.
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              The utility-scale installer/electrical group contains 44
              deduplicated employer-role combinations. This result is included
              as a project-mix check and should be interpreted with the smaller
              denominator in mind.
            </p>
          </div>
        </section>

        <section className="mt-14 rounded-3xl bg-slate-950 p-7 text-white sm:p-9">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">
            Sensitivity check
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
            Results using a broader title definition
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300">
            The primary sample requires an energy term in the job title. A
            second specification also includes generic titles such as “Project
            Manager” or “Installer” when the description clearly identifies the
            work as solar.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl font-semibold tabular-nums">52.8%</div>
              <div className="mt-2 text-sm font-medium text-slate-200">
                Broader project-management cohort
              </div>
              <div className="mt-1 text-xs text-slate-400">131 of 248</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-3xl font-semibold tabular-nums">28.5%</div>
              <div className="mt-2 text-sm font-medium text-slate-200">
                Broader install / electrical cohort
              </div>
              <div className="mt-1 text-xs text-slate-400">107 of 375</div>
            </div>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-6 text-slate-400">
            Under the broader specification, 131 of 248 project-management
            combinations (52.8%) disclosed travel, compared with 107 of 375
            installer/electrical combinations (28.5%). The corresponding ratio
            is 1.85×.
          </p>
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Worker accounts also describe travel as a job constraint
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Two discussions in construction-focused Reddit communities
              describe the same issue from the worker side: project-management
              and supervisory roles can involve extended periods away from
              home, with schedules varying substantially by employer and market
              segment.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <a
              href="https://www.reddit.com/r/ConstructionManagers/comments/1gt6xmn/"
              target="_blank"
              rel="nofollow noreferrer"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-400"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reddit · ConstructionManagers
              </div>
              <div className="mt-3 text-base font-semibold leading-6 text-slate-950">
                A utility PM considering solar roles said recruiters were
                describing schedules with roughly three weeks away each month.
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The poster asked whether a lower salary could be exchanged for
                a schedule with less time away from home.
              </p>
            </a>

            <a
              href="https://www.reddit.com/r/ConstructionManagers/comments/190gmtx/"
              target="_blank"
              rel="nofollow noreferrer"
              className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-400"
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Reddit · ConstructionManagers
              </div>
              <div className="mt-3 text-base font-semibold leading-6 text-slate-950">
                Solar professionals describe sharply different schedules by
                employer and segment.
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                One superintendent described spending weeks away each month. A
                C&I solar project manager in the same discussion reported a
                lighter travel schedule.
              </p>
            </a>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-500">
            Reddit posts are used here as qualitative context only. They were
            not included in the job-ad counts.
          </p>
        </section>

        <section className="mt-14">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              Questions to ask about travel before accepting a solar PM role
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Solar project-management postings can include site visits,
              contractor coordination, commissioning work and assignments at
              active project locations. A remote designation by itself does not
              establish how much time the employee will spend at home.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Candidates can ask employers for the typical number of nights
              away each month, the geographic range of project assignments,
              whether rotations are fixed, and how the travel percentage in the
              posting compares with the schedule employees actually work.
            </p>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Compare the wording in current{' '}
              <a href="/solar-pv-installer-jobs" className="font-semibold text-amber-800 underline underline-offset-4">
                solar PV installer jobs
              </a>,{' '}
              <a href="/solar-electrician-jobs" className="font-semibold text-amber-800 underline underline-offset-4">
                solar electrician jobs
              </a>{' '}
              and{' '}
              <a href="/solar-engineer-jobs" className="font-semibold text-amber-800 underline underline-offset-4">
                solar engineering jobs
              </a>{' '}
              before treating the title alone as a guide to field time.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              [
                "How many nights away?",
                "Ask for the typical number of nights away in a month, in addition to the annual travel estimate.",
              ],
              [
                "Where are the projects?",
                "Clarify whether assignments involve regional site visits, national travel, or relocation from one project to the next.",
              ],
              [
                "What happens between projects?",
                "Ask where the employee is normally based between site assignments and how long those periods typically last.",
              ],
              [
                "What is reimbursed?",
                "Confirm the policy for flights, mileage, lodging, per diem, rental cars and paid travel time.",
              ],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="methodology" className="mt-14 scroll-mt-24 border-t border-slate-200 pt-10">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Methodology
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              How Solar Roles reviewed the postings
            </h2>
          </div>

          <div className="mt-7 max-w-3xl space-y-6 text-sm leading-7 text-slate-600">
            <p>
              <strong className="text-slate-900">Snapshot.</strong> The source
              file contained 3,246 active job records collected by Solar Roles
              as of September 13, 2026: 2,206 from Adzuna and 1,040 from direct
              employer ATS feeds.
            </p>

            <p>
              <strong className="text-slate-900">Primary cohorts.</strong> The
              headline comparison uses project-manager, project-coordinator and
              construction-manager titles on one side, and installer,
              electrician, electrical-technician, electrical-foreman, wireman
              and journeyman-electrician titles on the other. The title also
              had to carry an explicit solar, PV, BESS, battery or
              renewable-energy signal, with the description supporting the
              energy context. Obvious non-solar trades were excluded.
            </p>

            <p>
              <strong className="text-slate-900">Deduplication.</strong> We
              grouped multi-location copies and duplicate postings before
              calculating the rates. Employer names, titles and descriptions
              were normalized for case, punctuation and spacing. Records were
              merged when the same employer carried the same normalized
              description, or when the normalized title matched and the
              descriptions were at least 98.5% similar with comparable length.
              This also catches small formatting changes introduced during
              syndication.
            </p>

            <p>
              <strong className="text-slate-900">ATS–Adzuna overlap.</strong>{" "}
              Duplicate postings appearing in both collection paths were merged
              before the headline calculation. In the final primary cohorts, 21
              employer-role combinations appeared in both Adzuna and a direct
              ATS feed: 10 in project management and 11 in
              installer/electrical. They count once, not once per feed.
            </p>

            <p>
              <strong className="text-slate-900">Unit of analysis.</strong> The
              final primary sample contains 404 deduplicated employer-role
              combinations representing 193 distinct employers across the two
              cohorts. The two employer counts are not additive because 13
              employers appear in both cohorts.
            </p>

            <p>
              <strong className="text-slate-900">Travel disclosure.</strong> A
              role was counted when the title or description explicitly
              described travel as required, expected, percentage-based,
              frequent, regular, occasional, overnight, out-of-town, or tied to
              required site visits. We did not infer a travel requirement merely
              because a job was field-based, mentioned travel reimbursement, or
              involved construction work.
            </p>

            <p>
              <strong className="text-slate-900">Project-scale check.</strong>{" "}
              To test whether the headline gap was mainly a consequence of
              comparing utility-scale project managers with residential or
              commercial installers, we reran the comparison inside the primary
              cohorts using only postings that explicitly referenced
              utility-scale solar, a solar farm, ground-mount solar, or solar
              EPC work. After the same cross-source deduplication, 62 of 88
              project-management combinations (70.5%) disclosed travel versus
              25 of 44 installer/electrical combinations (56.8%).
            </p>

            <p>
              <strong className="text-slate-900">Title-definition sensitivity check.</strong>{" "}
              We repeated the analysis with generic titles accepted when the
              description clearly established solar work. Travel was disclosed
              in 131 of 248 project-management combinations (52.8%) and 107 of
              375 installer/electrical combinations (28.5%).
            </p>

            <p>
              <strong className="text-slate-900">Limits.</strong> The analysis
              measures requirements disclosed in job ads. It does not estimate
              miles traveled, nights away, actual schedules, or whether the
              published requirements matched working conditions after hire.
              Jobs without a travel disclosure may still involve travel. The
              snapshot is a Solar Roles sample rather than a probability sample
              of every solar job in the United States.
            </p>
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-8">
          <p className="max-w-3xl text-xs leading-5 text-slate-500">
            Solar Roles Research analyzes job-posting language to make hiring
            requirements easier to compare. Source listings can change or close
            after the frozen snapshot date. Percentages are rounded to one
            decimal place.
          </p>

          <a
            href="/data"
            className="mt-6 inline-flex text-sm font-semibold text-slate-800 transition hover:text-slate-950"
          >
            Explore more Solar Roles data →
          </a>
        </footer>
      </article>
    </main>
  );
}
