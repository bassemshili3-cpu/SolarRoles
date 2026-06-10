"use client";
import { useState, useEffect } from "react";

const ARTICLE_DATA = {
  title: "You Don't Need a Personal Brand. You Need a Personal Practice.",
  subtitle: "LinkedIn is full of people performing expertise they do not have. The professionals who actually advance their careers are doing something quieter and far more durable.",
  author: "Tomás Rivera",
  authorRole: "Career Strategy Columnist",
  date: "March 5, 2026",
  readTime: "5 min read",
  category: "Career Advice",
  canonicalUrl: "https://www.oh-my-job.com/blog/personal-practice-not-brand",
};

const styles = `
*{margin:0;padding:0;box-sizing:border-box}
::selection{background:#1A1A1A;color:#FFFFFF}
.pbar{position:fixed;top:0;left:0;height:3px;background:#2B4ACB;z-index:1000;transition:width .1s linear}
.ac{max-width:740px;margin:0 auto;padding:0 24px}
.aw{max-width:1000px;margin:0 auto;padding:0 24px}
.ahdr{padding:48px 0 40px;text-align:center}
.acat{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#2B4ACB;margin-bottom:20px}
.atitle{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:42px;font-weight:800;line-height:1.12;letter-spacing:-.5px;margin-bottom:24px;max-width:800px;margin-left:auto;margin-right:auto}
.asub{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:20px;line-height:1.6;color:#555;max-width:660px;margin:0 auto 28px}
.ameta{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;color:#888;display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap}
.ameta strong{color:#1A1A1A;font-weight:600}
.adiv{width:60px;height:1px;background:#1A1A1A;margin:0 auto}
.abody{padding-bottom:64px}
.abody p{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:19px;line-height:1.78;color:#2A2A2A;margin-bottom:24px}
.abody h2{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:30px;font-weight:700;line-height:1.25;margin:48px 0 20px;padding-top:12px;border-top:1px solid #E0DDD5}
.abody a{color:#2B4ACB;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:3px}
.dcap::first-letter{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;float:left;font-size:72px;font-weight:700;line-height:.8;margin:4px 12px 0 0;color:#1A1A1A}
.cbox{background:#EEF2FF;border-left:4px solid #2B4ACB;padding:28px 32px;margin:36px 0}
.cbox-t{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2B4ACB;margin-bottom:10px}
.cbox p{font-size:17px;color:#333;margin-bottom:0}
.pq{border-top:2px solid #1A1A1A;border-bottom:2px solid #1A1A1A;padding:28px 0;margin:40px 0;text-align:center}
.pq p{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:24px;font-style:italic;font-weight:500;line-height:1.4;color:#1A1A1A}
.trow{display:flex;gap:8px;flex-wrap:wrap;margin:40px 0 32px}
.ttag{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:500;letter-spacing:.5px;text-transform:uppercase;padding:6px 14px;border:1px solid #D5D1C9;color:#666}
.abox{border-top:2px solid #1A1A1A;padding:32px 0;display:flex;gap:20px;align-items:center;margin-bottom:48px}
.aav{width:64px;height:64px;border-radius:50%;background:#EEF2FF;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#2B4ACB}
.ain{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:18px;font-weight:700}
.air{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:12px;color:#888;margin-top:2px}
.aib{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;line-height:1.5;color:#666;margin-top:6px}
.rsec{border-top:1px solid #D5D1C9;padding:48px 0}
.rgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.rcard{cursor:pointer;text-decoration:none;color:inherit;display:block}
.rcard-c{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#2B4ACB;margin-bottom:8px}
.rcard-t{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:18px;font-weight:700;line-height:1.3;transition:color .2s}
.rcard:hover .rcard-t{color:#2B4ACB}
.rcard-m{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;color:#999;margin-top:8px}
.shdr{font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#1A1A1A;padding-bottom:12px;border-bottom:2px solid #1A1A1A;margin-bottom:28px}
.fi{opacity:0;transform:translateY(20px);transition:opacity .8s ease,transform .8s ease}
.fi.v{opacity:1;transform:translateY(0)}
.fi.d2{transition-delay:.3s}
@media(max-width:768px){.atitle{font-size:28px}.asub{font-size:17px}.abody p{font-size:17px}.abody h2{font-size:24px}.rgrid{grid-template-columns:1fr}}
`;

const TAGS = ["Career Advice", "Personal Brand", "Professional Development", "Networking", "Career Strategy 2026"];

const RELATED = [
  { cat: "Career Advice", title: "How to Quit a Job in 2026: The Complete Guide to Resigning the Right Way", meta: "Eleanor M. Bishop · 14 min read", url: "/blog/how-to-quit-a-job" },
  { cat: "Interview Tips", title: "The 30-Second Rule: How First Impressions Still Decide Who Gets the Offer", meta: "Priya Nair · 6 min read", url: "/blog/the-30-second-rule" },
  { cat: "Interview Tips", title: "When the Interviewer Asks 'Why Should We Hire You?' — The Only Answer That Works", meta: "Rachel Simmons · 4 min read", url: "/blog/why-should-we-hire-you" },
];

export default function PersonalPracticeNotBrand() {
  const [sp, setSp] = useState(0);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    setVis(true);
    const fn = () => {
      const t = document.documentElement.scrollHeight - window.innerHeight;
      if (t > 0) setSp((window.scrollY / t) * 100);
    };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const v = vis ? " v" : "";

  return (
    <div style={{ fontFamily: "Inter,-apple-system,BlinkMacSystemFont,sans-serif", background: "#FFFFFF", color: "#1A1A1A", minHeight: "100vh" }}>
      <style suppressHydrationWarning>{styles}</style>
      <div className="pbar" style={{ width: sp + "%" }} />

      <header className="ahdr">
        <div className={"ac fi" + v}>
          <div className="acat">{ARTICLE_DATA.category}</div>
          <h1 className="atitle">{ARTICLE_DATA.title}</h1>
          <p className="asub">{ARTICLE_DATA.subtitle}</p>
          <div className="ameta">
            <strong>{ARTICLE_DATA.author}</strong><span>·</span>
            <span>{ARTICLE_DATA.authorRole}</span><span>·</span>
            <span>{ARTICLE_DATA.date}</span><span>·</span>
            <span>{ARTICLE_DATA.readTime}</span>
          </div>
        </div>
      </header>

      <div className="adiv" />

      <article className={"ac abody fi d2" + v} style={{ marginTop: "48px" }}>

        <p className="dcap">Somewhere in the last decade, career advice took a wrong turn. The directive to "build your personal brand" — originally a useful shorthand for taking ownership of how you present yourself professionally — mutated into something entirely different. It became a mandate to perform. To curate. To post content about your industry three times a week, whether you had something worth saying or not.</p>

        <p>The professionals who fell for it, and there were millions of them, ended up with something that looked like a career asset and functioned like a distraction. A LinkedIn profile optimized to project thought leadership. A newsletter with four hundred subscribers who mostly forget to open it. A professional identity built on broadcasting rather than doing.</p>

        <p>The professionals who advanced their careers quietly, steadily, and without ever once describing themselves as a "brand," were doing something else entirely. They were building a practice.</p>

        <h2>What a Practice Actually Is</h2>

        <p>A practice, in the career sense, is a set of habits and commitments around the work itself. It is the data scientist who spends two hours every Sunday reading papers outside their current project, not because their employer asked them to, but because staying sharp requires staying curious. It is the product manager who writes a brief post-mortem after every product decision, win or loss, and keeps those notes private. It is the designer who takes on one freelance project per quarter that stretches them into skills they do not yet have.</p>

        <p>None of these activities are visible on social media. None of them produce content that signals expertise to a broader audience. All of them compound over time in ways that are invisible to outsiders and unmistakable to anyone who works closely with that person.</p>

        <div className="pq">
          <p>A brand is what you tell people you are. A practice is what you actually are. The difference shows up in every room you walk into.</p>
        </div>

        <p>The confusion between the two is understandable because branding and practice can produce similar short-term results. Someone who posts consistently on LinkedIn about their industry will get more connection requests, more speaking invitations, more inbound messages from recruiters. That visibility is real and not worthless. But visibility built on performance without substance underneath it has a ceiling, and most professionals who have tried it hard enough eventually hit it.</p>

        <h2>Why the Brand Obsession Backfires</h2>

        <p>The core problem with treating your career as a branding exercise is that it optimizes for the wrong variable. Branding optimizes for perception. A practice optimizes for capability. In the short run, perception can outrun capability — there are plenty of self-described thought leaders whose actual work is mediocre. In the long run, capability always wins.</p>

        <div className="cbox">
          <div className="cbox-t">The Signal Problem</div>
          <p>When everyone in a profession is broadcasting expertise, the signal value of broadcasting collapses. The professionals who stand out to hiring managers and senior leaders in 2026 are not the ones with the most followers. They are the ones who can point to specific, concrete things they have built, solved, or changed.</p>
        </div>

        <p>There is also a quieter cost that rarely gets discussed: the cognitive drain of performing expertise. Every hour spent crafting a LinkedIn post about a trend in your industry is an hour not spent actually engaging with that trend. Every minute spent optimizing your professional image is a minute not spent improving your professional capabilities. The opportunity cost is real, and over years it accumulates into a gap between your presentation and your substance that eventually becomes impossible to paper over.</p>

        <h2>What to Do Instead</h2>

        <p>The shift from brand-building to practice-building is less dramatic than it sounds. It does not require deleting your LinkedIn profile or refusing to network. It requires reorienting your effort around a simple question: what habits, if I maintained them consistently for the next five years, would make me genuinely better at the work I care about?</p>

        <p>For some people that means dedicated weekly time for deep reading in their field. For others it means building side projects that apply skills at the edges of their current job description. For many it means seeking out feedback more aggressively — not the performative feedback of public comments, but the honest feedback of colleagues who will tell you what you are actually getting wrong.</p>

        <p>Networking, done right, is part of a practice. The version that is not: attending industry events to hand out cards and talk about your personal brand. The version that is: building genuine relationships with peers whose work you respect, staying curious about what they are solving, and being useful to them without tracking whether they have been useful to you in return. The people who do the second version consistently are the ones whose phones ring when opportunities that were never posted publicly become available.</p>

        <p>Ready to find your next role? Browse open positions matched to your experience at <a href="https://www.oh-my-job.com/jobs" target="_blank" rel="noopener noreferrer">Oh My Job</a>.</p>

        <div className="trow">
          {TAGS.map((t) => <span key={t} className="ttag">{t}</span>)}
        </div>

        <div className="abox">
          <div className="aav">TR</div>
          <div>
            <div className="ain">{ARTICLE_DATA.author}</div>
            <div className="air">{ARTICLE_DATA.authorRole}, Oh My Job</div>
            <div className="aib">Tomás writes about career strategy, professional development, and the habits that separate long-term success from short-term visibility. He has coached over 300 professionals through major career transitions.</div>
          </div>
        </div>
      </article>

      <section className="rsec">
        <div className="aw">
          <div className="shdr">Continue Reading</div>
          <div className="rgrid">
            {RELATED.map((r, i) => (
              <a key={i} className="rcard" href={r.url}>
                <div className="rcard-c">{r.cat}</div>
                <div className="rcard-t">{r.title}</div>
                <div className="rcard-m">{r.meta}</div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
