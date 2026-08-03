"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Play,
  BookOpen, HardHat, FileCheck, Award, Shield, Briefcase,
} from "lucide-react";

const ICON_MAP = {
  BookOpen, HardHat, FileCheck, Award, Shield, Briefcase,
} as const;

export type IconName = keyof typeof ICON_MAP;

const SOLAR_GRID_STYLE: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(to right, rgba(242, 169, 59, 0.18) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(242, 169, 59, 0.18) 1px, transparent 1px)
  `,
  backgroundSize: "24px 24px",
};

export interface ResourceItem {
  title: string;
  description: string;
  href: string;
  icon?: IconName;          // <-- string, plus une fonction
  type?: "guide" | "video" | "compare";
  category: string;
}

function SolarCard({ title, description, href, icon, type = "guide" }: ResourceItem) {
  const Icon = icon ? ICON_MAP[icon] : undefined;   // résolu ici, côté client
  const TypeLabel = type === "video" ? "Video" : type === "compare" ? "Comparison" : "Guide";
  return (
    <Link
      href={href}
      className="group relative block bg-white rounded-2xl overflow-hidden border border-[#F2A93B]/10 transition-all duration-500 hover:-translate-y-1.5 hover:border-[#F2A93B]/30 hover:shadow-[0_16px_48px_-12px_rgba(242,169,59,0.25)]"
    >
      <div className="relative aspect-[16/9] bg-gradient-to-br from-[#1C2126] via-[#232A33] to-[#1C2126] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.10] group-hover:opacity-[0.22] transition-opacity duration-500"
          style={SOLAR_GRID_STYLE}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {type === "video" ? (
            <div className="w-14 h-14 rounded-full bg-[#F2A93B] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(242,169,59,0.7)]">
              <Play className="h-5 w-5 text-[#1C2126] ml-0.5 fill-[#1C2126]" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#F2A93B]/10 border-2 border-[#F2A93B] flex items-center justify-center transition-all duration-500 group-hover:bg-[#F2A93B] group-hover:scale-110">
              {Icon && <Icon className="h-6 w-6 text-[#F2A93B] group-hover:text-[#1C2126] transition-colors duration-500" />}
            </div>
          )}
        </div>
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-[#F2A93B]/25 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[44px] border-t-[#F2A93B] border-l-[44px] border-l-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#F2A93B] mb-2">{TypeLabel}</div>
        <h3 className="text-lg font-bold text-[#1C2126] leading-snug mb-2">{title}</h3>
        <p className="text-sm text-[#1C2126]/65 leading-relaxed line-clamp-2">{description}</p>
        <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#F2A93B] transition-all group-hover:gap-2.5">
          <span>Read guide</span>
          <ArrowRight className="h-4 w-4 ml-1 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}

export function ResourceLibrary({ items }: { items: ResourceItem[] }) {
  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category)))];
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              active === cat
                ? "bg-[#F2A93B] text-[#1C2126]"
                : "bg-white border border-[#F2A93B]/20 text-[#1C2126]/70 hover:border-[#F2A93B]/50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <SolarCard key={item.href} {...item} />
        ))}
      </div>
    </div>
  );
}