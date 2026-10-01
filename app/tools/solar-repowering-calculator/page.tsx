import type { Metadata } from 'next';
import Link from 'next/link';
import RepoweringCalculator from '@/components/repowering/RepoweringCalculator';
import RepoweringAtlasMap from '@/components/repowering/RepoweringAtlas';
import atlasData from '@/public/data/repowering/atlas-reference.json';
import expansionData from '@/public/data/repowering/eia-expansion-by-state.json';
import type { EiaExpansionData, RepoweringAtlas } from '@/lib/repowering/atlasTypes';

const canonical = 'https://www.solarroles.com/tools/solar-repowering-calculator';

export const metadata: Metadata = {
  title: 'Solar Repowering Density & Timing Calculator | Solar Roles',
  description: 'Separate technical same-footprint solar density headroom from the older-fleet capacity approaching plausible repowering and PPA review windows.',
  alternates: { canonical },
  openGraph: {
    title: 'Solar Repowering Density & Timing Calculator',
    description: 'Separate physical solar density headroom from the capacity approaching plausible repowering and PPA review windows.',
    url: canonical,
    siteName: 'Solar Roles',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Solar Repowering Density & Timing Calculator',
    description: 'Separate physical solar density headroom from the capacity approaching plausible repowering and PPA review windows.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Solar Repowering Density & Timing Calculator',
  url: canonical,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  isAccessibleForFree: true,
  provider: {
    '@type': 'Organization',
    name: 'Solar Roles',
    url: 'https://www.solarroles.com/',
  },
  description:
    'A screening calculator that separates modern same-footprint DC density headroom from age- and PPA-based repowering timing.',
};

export default function SolarRepoweringCalculatorPage() {
  const atlas = atlasData as unknown as RepoweringAtlas;
  const expansion = expansionData as EiaExpansionData;

  return (
    <main className="bg-white text-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-800">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span>Tools</span>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-slate-700">Solar Repowering Density Calculator</span>
        </nav>

        <header className="max-w-4xl pb-8 pt-8 sm:pb-10">
          <p className="text-sm font-semibold text-teal-700">Physical headroom, separated from market timing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Solar Repowering Density &amp; Timing Calculator
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Measure how much modern DC nameplate could physically fit inside an existing solar footprint, then separate that density headroom from the older assets approaching plausible equipment and PPA review windows.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span>No sign-up required</span>
            <span>Area and polygon methods</span>
            <span>Berkeley Lab PPA timing screen</span>
          </div>
          <p className="mt-6 inline-flex rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
            Density and timing screen · not a forecast of economic or executable repowering
          </p>
        </header>

        <RepoweringAtlasMap atlas={atlas} expansion={expansion} />

        <section id="calculator" className="mt-14 scroll-mt-24 border-t border-slate-200 pt-10">
          <p className="text-sm font-semibold text-teal-700">Site-level model</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Test one footprint with your own assumptions
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Enter acreage and layout assumptions for a quick screen, or load a WGS84 polygon to pack complete rows inside the actual footprint.
          </p>
          <RepoweringCalculator />
        </section>

        <section className="mt-14 border-t border-slate-200 pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold text-teal-700">Two calculation paths</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                Start with acreage or test the actual boundary
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="font-semibold text-slate-950">Area and effective GCR</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The faster method converts module power density, usable acreage and effective ground coverage ratio into an estimated MWdc capacity.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-950">GeoJSON polygon packing</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  The boundary method rotates the footprint into the modeled row axis, applies clearances and counts complete modules that fit inside the polygon.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950">What the result does—and does not—measure</h2>
          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-950">Included in the estimate</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The model estimates technical same-footprint DC nameplate using the dimensions, layout, spacing, GCR and boundary assumptions entered above. The sensitivity table shows how capacity changes across alternative GCR values.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-950">Outside the estimate</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                The result does not establish interconnection headroom, inverter compatibility, energy yield, constructability, permitting, economics, financeability or an actual contract expiration. Those questions require project-specific engineering, PPA documents and commercial review.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-12 max-w-4xl">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Inputs worth checking before using the estimate</h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-600">
            Confirm whether the reported acreage represents the direct-array footprint or a larger project parcel. Check module dimensions, row direction, mounting type and the current DC rating against source documents. For polygon runs, use a WGS84 Polygon or MultiPolygon that follows the usable array boundary rather than the property boundary.
          </p>
        </section>
      </div>
    </main>
  );
}
