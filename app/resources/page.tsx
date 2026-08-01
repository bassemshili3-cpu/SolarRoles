import type { Metadata } from "next";
import Link from "next/link";
import {
  GraduationCap, Route, Award, Shield, Briefcase, HelpCircle,
  ArrowRight, Play, BookOpen, Wrench, HardHat, Users, Zap, 
  FileCheck, Sun, ChevronRight,
} from "lucide-react";

// ----------------------------------------------------------------------------
// SEO metadata (keep your existing structure exactly)
// ----------------------------------------------------------------------------

const SITE_URL = "https://www.solarroles.com";
const PAGE_PATH = "/resources";
const PAGE_TITLE = "Solar Career Resources | Solar Roles";
const PAGE_DESCRIPTION =
  "Independent guides on certifications, licenses, safety training, and apprenticeship paths for US solar installers — organized so you know what applies to you and what to read next.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}${PAGE_PATH}`,
    siteName: "Solar Roles",
    type: "website",
  },
};

// ----------------------------------------------------------------------------
// Data: categories (top of page), featured (essential learning equivalents),
// career path (resources for your role equivalent), and the existing groups.
// ----------------------------------------------------------------------------

const CATEGORIES = [
  {
    label: "Courses",
    desc: "100% Online",
    icon: GraduationCap,
    href: "/resources#courses",
  },
  {
    label: "Career Paths",
    desc: "From tech to lead",
    icon: Route,
    href: "/resources/career-paths",
  },
  {
    label: "Certifications",
    desc: "NABCEP, OSHA, more",
    icon: Award,
    href: "/resources#certifications",
  },
  {
    label: "Safety",
    desc: "OSHA 10, 30, NFPA 70E",
    icon: Shield,
    href: "/resources/osha-safety-guide-solar-installers",
  },
  {
    label: "Apprenticeships",
    desc: "Registered programs",
    icon: Briefcase,
    href: "/resources/solar-installer-apprenticeship-programs",
  },
  {
    label: "Q&A",
    desc: "Ask the community",
    icon: HelpCircle,
    href: "/resources#qa",
  },
];

const FEATURED = [
  {
    title: "Solar Certifications by Job Role",
    description:
      "One table mapping each solar job to what's legally required, what's most valued, and what's optional.",
    href: "/resources/solar-certifications-by-job-role",
    icon: BookOpen,
    type: "guide" as const,
  },
  {
    title: "NABCEP Training Providers Compared",
    description:
      "HeatSpring, Everblue, SEI, and in-person options, side by side on price, hours, and exam fees.",
    href: "/resources/nabcep-training-providers-compared",
    icon: FileCheck,
    type: "guide" as const,
  },
  {
    title: "OSHA Safety Guide for Solar Installers",
    description:
      "OSHA 10 vs 30, fall protection thresholds on the roof, and the electrical hazards specific to PV.",
    href: "/resources/osha-safety-guide-solar-installers",
    icon: Shield,
    type: "video" as const,
  },
];

// Career path nodes - structured like a solar panel wiring diagram.
// 5 stops, each links to the most relevant resource on your site.
const CAREER_PATH = [
  {
    label: "Helper",
    salary: "$30-40K",
    time: "0-6 mo",
    icon: Wrench,
    href: "/resources/how-to-get-a-solar-apprenticeship",
  },
  {
    label: "Installer",
    salary: "$50-60K",
    time: "6-18 mo",
    icon: HardHat,
    href: "/resources/solar-certifications-by-job-role",
  },
  {
    label: "Lead / Foreman",
    salary: "$65-85K",
    time: "2-4 yr",
    icon: Users,
    href: "/resources/solar-installer-apprenticeship-programs",
  },
  {
    label: "Superintendent",
    salary: "$85-110K",
    time: "4-7 yr",
    icon: Briefcase,
    href: "/resources/nabcep-training-providers-compared",
  },
  {
    label: "Director / VP",
    salary: "$130K+",
    time: "7+ yr",
    icon: Zap,
    href: "/resources/nabcep-vs-eta-vs-state-licenses",
  },
];

interface ResourceItem {
  title: string;
  description: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: "guide" | "video" | "compare";
}

interface ResourceGroup {
  label: string;
  items: ResourceItem[];
}

const GROUP_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Start here": BookOpen,
  "Certifications & training": Award,
  "Safety": Shield,
  "Apprenticeships": Briefcase,
};

const GROUPS: ResourceGroup[] = [
  {
    label: "Start here",
    items: [
      {
        title: "Solar Certifications by Job Role",
        description:
          "One table mapping each solar job to what's legally required, what's most valued, and what's optional.",
        href: "/resources/solar-certifications-by-job-role",
        icon: BookOpen,
        type: "guide",
      },
    ],
  },
  {
    label: "Certifications & training",
    items: [
      {
        title: "NABCEP Training Providers Compared",
        description:
          "HeatSpring, Everblue, SEI, and in-person options, side by side on price, hours, and exam fees.",
        href: "/resources/nabcep-training-providers-compared",
        icon: FileCheck,
        type: "compare",
      },
      {
        title: "NABCEP vs ETA vs State Licenses",
        description:
          "Four different credential types explained: which are voluntary, which are legally required, and how they overlap.",
        href: "/resources/nabcep-vs-eta-vs-state-licenses",
        icon: Award,
        type: "guide",
      },
      {
        title: "Tesla, Enphase & SolarEdge Certifications",
        description:
          "Company-level partner programs vs. individual online certifications, and which is which.",
        href: "/resources/manufacturer-certifications-tesla-enphase-solaredge",
        icon: Award,
        type: "guide",
      },
    ],
  },
  {
    label: "Safety",
    items: [
      {
        title: "OSHA Safety Guide for Solar Installers",
        description:
          "OSHA 10 vs 30, fall protection thresholds on the roof, and the electrical hazards specific to PV.",
        href: "/resources/osha-safety-guide-solar-installers",
        icon: Shield,
        type: "guide",
      },
    ],
  },
  {
    label: "Apprenticeships",
    items: [
      {
        title: "Solar Installer Apprenticeship Programs",
        description:
          "How Registered Apprenticeship Programs work, who sponsors them, and why solar isn't officially apprenticeable yet.",
        href: "/resources/solar-installer-apprenticeship-programs",
        icon: Briefcase,
        type: "guide",
      },
      {
        title: "How to Land a Solar Apprenticeship",
        description:
          "The application, testing, and ranking process, and what actually moves you up the list.",
        href: "/resources/how-to-get-a-solar-apprenticeship",
        icon: Briefcase,
        type: "guide",
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// JSON-LD (unchanged from your original)
// ----------------------------------------------------------------------------

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  url: `${SITE_URL}${PAGE_PATH}`,
  hasPart: GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Article",
      name: item.title,
      url: `${SITE_URL}${item.href}`,
    })),
  ),
};

// ----------------------------------------------------------------------------
// Inline components
// ----------------------------------------------------------------------------

// Reusable solar-cell grid pattern via CSS (no extra asset).
// 24x24px grid with thin gold lines that mimic solar panel cell boundaries.
const SOLAR_GRID_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(to right, rgba(242, 169, 59, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(242, 169, 59, 0.18) 1px, transparent 1px)
  `,
  backgroundSize: "24px 24px",
};

// Category pill - round "solar cell" with icon
function CategoryPill({
  label,
  desc,
  icon: Icon,
  href,
}: {
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-3">
      <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-2 border-[#F2A93B]/20 flex items-center justify-center transition-all duration-300 group-hover:border-[#F2A93B] group-hover:scale-110 group-hover:shadow-[0_8px_28px_-6px_rgba(242,169,59,0.5)]">
        <div
          className="absolute inset-1 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500"
          style={SOLAR_GRID_STYLE}
        />
        <Icon className="relative h-7 w-7 md:h-8 md:w-8 text-[#1C2126] transition-colors group-hover:text-[#D88A1E]" />
      </div>
      <div className="text-center">
        <div className="text-xs md:text-sm font-bold uppercase tracking-[0.10em] text-[#1C2126] group-hover:text-[#D88A1E] transition-colors">
          {label}
        </div>
        <div className="text-[10px] md:text-xs text-[#1C2126]/50 mt-0.5 hidden md:block">
          {desc}
        </div>
      </div>
    </Link>
  );
}

// The flagship "solar panel" card.
// Top section = a stylized solar panel (graphite + gold grid pattern + central icon).
// On hover: the grid brightens, a gold light sweeps across, the card lifts.
// Bottom section = title, description, CTA.
function SolarCard({
  title,
  description,
  href,
  icon: Icon,
  type = "guide",
  small = false,
}: {
  title: string;
  description: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  type?: "guide" | "video" | "compare";
  small?: boolean;
}) {
  const TypeLabel =
    type === "video" ? "Video" : type === "compare" ? "Comparison" : "Guide";
  return (
    <Link
      href={href}
      className="group relative block bg-white rounded-2xl overflow-hidden border border-[#F2A93B]/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#F2A93B]/30 hover:shadow-[0_16px_48px_-12px_rgba(242,169,59,0.25)]"
    >
      {/* Top "panel" section */}
      <div
        className={`relative ${
          small ? "aspect-[16/8]" : "aspect-[16/9]"
        } bg-gradient-to-br from-[#1C2126] via-[#232A33] to-[#1C2126] overflow-hidden`}
      >
        {/* Solar cell grid - visible on hover */}
        <div
          className="absolute inset-0 opacity-[0.10] group-hover:opacity-[0.22] transition-opacity duration-500"
          style={SOLAR_GRID_STYLE}
        />

        {/* Central icon or play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          {type === "video" ? (
            <div className="w-14 h-14 rounded-full bg-[#F2A93B] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(242,169,59,0.7)]">
              <Play className="h-5 w-5 text-[#1C2126] ml-0.5 fill-[#1C2126]" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#F2A93B]/10 border-2 border-[#F2A93B] flex items-center justify-center transition-all duration-500 group-hover:bg-[#F2A93B] group-hover:scale-110">
              {Icon && (
                <Icon className="h-6 w-6 text-[#F2A93B] group-hover:text-[#1C2126] transition-colors duration-500" />
              )}
            </div>
          )}
        </div>

        {/* Energy sweep on hover - gold light crossing the panel */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#F2A93B]/25 to-transparent pointer-events-none" />

        {/* Gold corner accent on hover */}
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[44px] border-t-[#F2A93B] border-l-[44px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Content section */}
      <div className="p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#F2A93B] mb-2">
          {TypeLabel}
        </div>
        <h3
          className={`${
            small ? "text-base" : "text-lg"
          } font-bold text-[#1C2126] leading-snug mb-2`}
        >
          {title}
        </h3>
        <p className="text-sm text-[#1C2126]/65 leading-relaxed line-clamp-2">
          {description}
        </p>
        <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#F2A93B] transition-all group-hover:gap-2.5">
          <span>Read guide</span>
          <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

// Career path step - a "node" in the wiring diagram
function CareerPathStep({
  label,
  salary,
  time,
  icon: Icon,
  href,
  isLast,
}: {
  label: string;
  salary: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isLast: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative flex-1 flex flex-col items-center text-center min-w-0"
    >
      <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full bg-white border-2 border-[#F2A93B]/25 flex items-center justify-center transition-all duration-300 group-hover:border-[#F2A93B] group-hover:scale-110 group-hover:shadow-[0_8px_24px_-4px_rgba(242,169,59,0.4)] z-10">
        <div
          className="absolute inset-1 rounded-full opacity-0 group-hover:opacity-50 transition-opacity duration-500"
          style={SOLAR_GRID_STYLE}
        />
        <Icon className="relative h-6 w-6 md:h-8 md:w-8 text-[#1C2126] group-hover:text-[#D88A1E] transition-colors" />
      </div>
      <div className="mt-3 text-[11px] md:text-sm font-bold text-[#1C2126] uppercase tracking-wide group-hover:text-[#D88A1E] transition-colors">
        {label}
      </div>
      <div className="mt-1 text-[10px] md:text-xs text-[#F2A93B] font-mono font-semibold">
        {salary}
      </div>
      <div className="text-[10px] text-[#1C2126]/40 mt-0.5">{time}</div>
    </Link>
  );
}

// ----------------------------------------------------------------------------
// Page
// ----------------------------------------------------------------------------

export default function ResourcesHub() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO + CATEGORY PILLS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1C2126]/50 mb-4">
          <Sun className="h-3.5 w-3.5 text-[#F2A93B]" />
          <span>Solar Roles / Resources</span>
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1C2126] leading-[1.05] tracking-tight">
          Get certified.
          <br />
          <span className="text-[#F2A93B]">Get hired.</span>
        </h1>
        <p className="mt-5 text-lg text-[#1C2126]/70 max-w-2xl leading-relaxed">
          Independent guides on the credentials that actually apply to solar
          installer jobs in the US.
        </p>

        {/* Category pills */}
        <div className="mt-12 grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6 max-w-4xl">
          {CATEGORIES.map((cat) => (
            <CategoryPill key={cat.label} {...cat} />
          ))}
        </div>
      </section>

      {/* FEATURED RESOURCES (Essential Learnings equivalent) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F2A93B] mb-2">
              Start here
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C2126] tracking-tight">
              Essential resources
            </h2>
          </div>
          <Link
            href="/resources#all"
            className="hidden md:inline-flex items-center text-sm font-semibold text-[#1C2126]/70 hover:text-[#F2A93B] transition-colors group"
          >
            See all
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((item) => (
            <SolarCard key={item.href} {...item} />
          ))}
        </div>
      </section>

      {/* CAREER PATH FLOW (Resources for your role equivalent) */}
      <section className="bg-gradient-to-b from-[#FEF7EB] to-[#FAFAFA] py-16 md:py-20 my-8 border-y border-[#F2A93B]/10">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F2A93B] mb-2">
              Resources for your stage
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C2126] tracking-tight mb-3">
              Your solar career path
            </h2>
            <p className="text-[#1C2126]/70">
              From your first day on a crew to running your own operations.
              Click any stage to see the credentials and resources that get you there.
            </p>
          </div>

          <div className="relative">
            {/* Connecting "wiring" line behind the nodes */}
            <div className="absolute top-7 md:top-10 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#F2A93B]/20 via-[#F2A93B] to-[#F2A93B]/20 -z-0" />
            <div className="relative flex items-start justify-between gap-2 md:gap-4 max-w-5xl mx-auto">
              {CAREER_PATH.map((step, i) => (
                <CareerPathStep
                  key={step.label}
                  {...step}
                  isLast={i === CAREER_PATH.length - 1}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/resources/career-paths"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#F2A93B] text-[#1C2126] rounded-full font-semibold hover:bg-[#E0A030] hover:shadow-[0_8px_24px_-4px_rgba(242,169,59,0.4)] transition-all"
            >
              See the full career path
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ALL RESOURCES BY GROUP */}
      <section id="all" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F2A93B] mb-2">
            The full library
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1C2126] tracking-tight">
            All resources
          </h2>
        </div>

        <div className="space-y-12">
          {GROUPS.map((group) => {
            const GroupIcon = GROUP_ICONS[group.label] || BookOpen;
            return (
              <div key={group.label}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#FEF7EB] border border-[#F2A93B]/20 flex items-center justify-center">
                    <GroupIcon className="h-4 w-4 text-[#F2A93B]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1C2126]">
                    {group.label}
                  </h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {group.items.map((item) => (
                    <SolarCard
                      key={item.href}
                      title={item.title}
                      description={item.description}
                      href={item.href}
                      icon={item.icon}
                      type={item.type}
                      small
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="relative bg-gradient-to-br from-[#1C2126] to-[#2A323B] rounded-3xl p-8 md:p-12 overflow-hidden border border-[#F2A93B]/20">
          {/* Solar grid background */}
          <div
            className="absolute inset-0 opacity-[0.10]"
            style={SOLAR_GRID_STYLE}
          />
          {/* Gold energy sweep on hover */}
          <div className="absolute -inset-1 -translate-x-full hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#F2A93B]/15 to-transparent pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            <div className="flex-1">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#F2A93B] mb-2">
                Still searching?
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                Got a question we haven't covered?
              </h2>
              <p className="text-white/70 text-sm md:text-base max-w-xl">
                Ask us anything about solar careers, NABCEP certifications,
                training costs, or how to break into the industry. We read every
                message.
              </p>
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#F2A93B] text-[#1C2126] rounded-full font-semibold hover:bg-[#E0A030] hover:shadow-[0_8px_32px_-4px_rgba(242,169,59,0.5)] active:scale-[0.97] transition-all whitespace-nowrap"
            >
              Ask a question
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}