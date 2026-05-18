import type { Metadata } from "next";
import Link from "next/link";

const PAGE_URL = "https://www.oh-my-job.com/could-you-collect-unemployment-if-you-quit-your-job";

export const metadata: Metadata = {
  title: "Can You Collect Unemployment If You Quit Your Job? | Oh My Job",
  description:
    "A clear, honest guide to whether you can collect unemployment benefits in the US after quitting voluntarily, the good cause exceptions that may qualify you, and how to file when the answer is not obvious.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Can You Collect Unemployment If You Quit Your Job?",
    description: "The general rule, the good cause exceptions, and what actually matters when you file.",
    url: PAGE_URL,
    type: "article",
  },
  robots: { index: true, follow: true },
};

const faq = [
  {
    q: "If I quit my job can I collect unemployment in any state",
    a: "Generally no, but every state allows exceptions when you quit for good cause. The definition of good cause varies by state, but it usually includes unsafe conditions, harassment, significant changes to your job, medical reasons, and certain family emergencies. The burden of proof is on you to show good cause applied.",
  },
  {
    q: "What counts as good cause for quitting",
    a: "Common good cause reasons include a hostile work environment, sexual harassment, unsafe working conditions, significant unilateral changes to pay or duties, a serious medical condition that the employer would not accommodate, and in some states a spouse's job relocation. Personal preference or general dissatisfaction does not qualify.",
  },
  {
    q: "Do I need to document my reasons for quitting",
    a: "Yes, and the documentation matters enormously. Save emails, texts, performance reviews, HR complaints, medical records, and any communications relating to the reason you left. The state agency will weigh your evidence against the employer's, and undocumented claims rarely succeed.",
  },
  {
    q: "How long do I wait to apply after quitting",
    a: "Apply as soon as you have quit. Most states allow you to file the same week. Waiting can cost you weeks of benefits if you eventually qualify, and there is no advantage to delaying. The processing can take several weeks, so starting early matters.",
  },
  {
    q: "What happens if my claim is denied",
    a: "You can appeal, and many initial denials are overturned on appeal. The appeals process typically involves a hearing where you present evidence and witnesses. Bringing documentation, written statements, and ideally a lawyer or unemployment advocate increases your chances significantly.",
  },
];

export default function Page() {
  const updated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  return (
    <div className="container" style={{ padding: "40px 0 64px", maxWidth: 900, margin: "0 auto" }}>
      <header style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <span className="badge">Unemployment</span>
          <span className="badge">Worker Rights</span>
          <span className="badge">US Guide</span>
        </div>

        <h1 style={{ margin: "20px 0 14px", fontSize: "clamp(30px, 4vw, 48px)", lineHeight: 1.15, fontWeight: 600 }}>
          Can You Collect Unemployment If You Quit Your Job?
        </h1>

        <p className="muted" style={{ margin: "0 auto", maxWidth: "65ch", fontSize: 18, lineHeight: 1.6 }}>
          A clear, honest guide to whether you can collect unemployment benefits in the US after quitting voluntarily, the good cause exceptions that may qualify you, and how to file when the answer is not obvious.
        </p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 18 }}>
          <span className="badge">7 min read</span>
          <span className="badge">Updated: {updated}</span>
        </div>
      </header>

      <hr className="hr" style={{ margin: "30px 0" }} />

      <article className="articleBody" style={{ maxWidth: 760, margin: "0 auto", lineHeight: 1.7, fontSize: 17 }}>

        <h2 style={{ marginTop: 30, marginBottom: 12, fontSize: 24 }}>The short answer most people get wrong</h2>
        <p style={{ marginBottom: 20 }}>
          The conventional answer to this question is a blunt no. The conventional answer is also wrong in a meaningful way. The accurate version is that in every US state, the default rule disqualifies workers who voluntarily quit, but every state also recognizes a set of good cause exceptions that can preserve eligibility. The question of whether you can collect after quitting is not a yes or no question. It is a question about whether the specific reasons for your departure fall within your state's good cause definition.
        </p>
        <p style={{ marginBottom: 20 }}>
          Understanding this distinction matters because thousands of workers each year disqualify themselves from benefits they would actually have received simply because they assumed quitting automatically meant no unemployment. The state systems are designed to evaluate the circumstances of each quit, not to automatically reject everyone who left voluntarily.
        </p>

        <h2 style={{ marginTop: 30, marginBottom: 12, fontSize: 24 }}>What good cause actually means</h2>
        <p style={{ marginBottom: 14 }}>
          Each state defines good cause slightly differently, but the underlying concept is consistent. Good cause exists when the conditions of your employment became so significantly worse that a reasonable person in your position would have felt compelled to leave. Across most states, the recognized good cause categories include:
        </p>
        <ul style={{ margin: "0 0 20px 20px" }}>
          <li style={{ marginBottom: 8 }}>A hostile work environment, including harassment, discrimination, or persistent abusive treatment</li>
          <li style={{ marginBottom: 8 }}>Sexual harassment that the employer failed to address after a complaint</li>
          <li style={{ marginBottom: 8 }}>Unsafe working conditions that posed a genuine health or safety risk</li>
          <li style={{ marginBottom: 8 }}>Significant unilateral changes to pay, hours, duties, or location that materially changed the job</li>
          <li style={{ marginBottom: 8 }}>A serious medical condition the employer would not reasonably accommodate</li>
          <li style={{ marginBottom: 8 }}>Domestic violence or stalking situations that made continued work unsafe</li>
          <li>Spousal job relocation, in certain states with specific qualifying rules</li>
        </ul>
        <p style={{ marginBottom: 20 }}>
          What does not typically qualify as good cause includes general dissatisfaction with the job, normal workplace conflict, dislike of a manager, better opportunity elsewhere, commute preferences, or any reason that comes down to personal preference rather than substantially worsened conditions.
        </p>

        <h2 style={{ marginTop: 30, marginBottom: 12, fontSize: 24 }}>The concept of constructive discharge</h2>
        <p style={{ marginBottom: 20 }}>
          A useful legal concept in this area is constructive discharge, which is the idea that an employer made conditions so intolerable that quitting became the only reasonable option. When constructive discharge applies, your departure is treated more like a termination than a voluntary quit for unemployment purposes. The bar is high, and you generally need to show that you tried to address the problem internally before leaving, but the doctrine exists precisely to prevent employers from forcing people out without consequences.
        </p>

        <h2 style={{ marginTop: 30, marginBottom: 12, fontSize: 24 }}>Why documentation makes or breaks the claim</h2>
        <p style={{ marginBottom: 20 }}>
          The single most important factor in winning an unemployment claim after a voluntary quit is documentation. State unemployment offices evaluate each case on its facts, and the facts come from records, written communications, and witness statements. A worker who quit due to harassment and saved emails reporting the harassment to HR has a strong claim. A worker who quit for the same reason but kept no records faces an uphill battle.
        </p>
        <p style={{ marginBottom: 20 }}>
          Before you quit for any potentially qualifying reason, document everything you can. Save emails about working conditions, write down dates and details of incidents, file written complaints with HR rather than verbal ones, get medical documentation if health is involved, and keep copies of any policies, changes, or directives that affected your work. This documentation is what turns a denied claim into an approved one on appeal.
        </p>

        <h2 style={{ marginTop: 30, marginBottom: 12, fontSize: 24 }}>How to file and what to expect</h2>
        <p style={{ marginBottom: 20 }}>
          File your unemployment claim as soon as you have separated from your employer. Most states allow online filing through the state labor or workforce department website. You will be asked the reason you left, and you should give a clear, factual answer that aligns with the good cause categories your state recognizes. The state will then contact your former employer for their account of the separation.
        </p>
        <p style={{ marginBottom: 20 }}>
          Expect the process to take several weeks. If your initial claim is denied, you have the right to appeal, and many denials are reversed at the appeals stage when claimants present documentation, witnesses, and clear evidence. While waiting for the decision, continue your job search and report any earnings as required. You can <Link href="/jobs">browse current openings across categories and locations</Link> to find new opportunities while your claim is processed.
        </p>

        <h2 style={{ marginTop: 30, marginBottom: 12, fontSize: 24 }}>FAQ</h2>
        <div style={{ display: "grid", gap: 14, marginBottom: 24 }}>
          {faq.map((f, i) => (
            <div key={i}>
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{f.q}</h3>
              <p style={{ margin: 0 }}>{f.a}</p>
            </div>
          ))}
        </div>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Article",
                headline: "Can You Collect Unemployment If You Quit Your Job?",
                description:
                  "A clear, honest guide to whether you can collect unemployment benefits in the US after quitting voluntarily, the good cause exceptions, and how to file.",
                author: { "@type": "Organization", name: "Oh My Job" },
                publisher: { "@type": "Organization", name: "Oh My Job" },
                mainEntityOfPage: PAGE_URL,
              },
              {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: faq.map((x) => ({
                  "@type": "Question",
                  name: x.q,
                  acceptedAnswer: { "@type": "Answer", text: x.a },
                })),
              },
            ]),
          }}
        />

        <hr className="hr" style={{ margin: "30px 0" }} />
        <p className="small" style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.6 }}>
          Disclaimer: This page provides general educational information about US unemployment benefits and is not legal advice. Eligibility rules, good cause definitions, and benefit amounts vary by state and change over time. If you are considering quitting or have already left a job, consult your state unemployment office directly and consider speaking with an employment attorney or unemployment advocate before filing.
        </p>
      </article>
    </div>
  );
}