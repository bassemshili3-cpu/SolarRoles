'use client';
import { useState, useEffect } from "react";

const CATEGORIES = ["All", "Career Advice", "Industry Trends", "Remote Work", "Salary Insights", "Interview Tips", "Tech Jobs"];

const FEATURED_ARTICLE = {
  category: "Career Advice",
  title: "How to Quit a Job in 2026: The Complete Guide to Resigning the Right Way",
  subtitle: "Walking away from a paycheck is never just about the job. It's about your family, your health coverage, your financial safety net, and everything that depends on you. Here's how to quit without putting any of it at risk.",
  author: "Eleanor M. Bishop",
  date: "March 8, 2026",
  readTime: "14 min read",
  url: "https://www.oh-my-job.com/blog/how-to-quit-a-job",
  image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&h=600&fit=crop",
};

const EDITOR_PICKS = [
  {
    category: "Salary Insights",
    title: "What Six Figures Really Means in New York, San Francisco, and Austin",
    author: "James Whitfield",
    date: "March 7, 2026",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop",
  },
  {
    category: "Interview Tips",
    title: "The 30-Second Rule: How First Impressions Still Decide Who Gets the Offer",
    author: "Priya Nair",
    date: "March 6, 2026",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
  },
  {
    category: "Remote Work",
    title: "Return-to-Office Mandates Are Backfiring. Here's the Data.",
    author: "David Rosenthal",
    date: "March 5, 2026",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=400&h=300&fit=crop",
  },
];

const LATEST_ARTICLES = [
  {
    category: "Tech Jobs",
    title: "Inside the AI Talent War: How Startups Are Luring Engineers Away From Big Tech",
    author: "Michael Chen",
    date: "March 7, 2026",
    readTime: "9 min read",
  },
  {
    category: "Industry Trends",
    title: "Healthcare Hiring Is Booming — But Not Where You'd Expect",
    author: "Sarah Abrams",
    date: "March 6, 2026",
    readTime: "7 min read",
  },
  {
    category: "Career Advice",
    title: "You Don't Need a Personal Brand. You Need a Personal Practice.",
    author: "Tomás Rivera",
    date: "March 5, 2026",
    readTime: "5 min read",
  },
  {
    category: "Salary Insights",
    title: "The Hidden Cost of Stock Options: A Cautionary Tale for Job Hoppers",
    author: "Angela Wu",
    date: "March 4, 2026",
    readTime: "11 min read",
  },
  {
    category: "Remote Work",
    title: "Digital Nomad Visas: Which Countries Are Actually Worth It in 2026?",
    author: "Lukas Bauer",
    date: "March 3, 2026",
    readTime: "8 min read",
  },
  {
    category: "Interview Tips",
    title: "When the Interviewer Asks 'Why Should We Hire You?' — The Only Answer That Works",
    author: "Rachel Simmons",
    date: "March 2, 2026",
    readTime: "4 min read",
  },
];

const OPINION_PIECES = [
  {
    title: "America's Obsession With 'Passion' at Work Is Making Us Miserable",
    author: "Dr. Caroline Frey",
    excerpt: "The relentless pursuit of passion has become a trap, not a compass. It's time we talked about jobs as jobs.",
  },
  {
    title: "Why I Stopped Applying to Jobs Online — and Started Getting Offers",
    author: "Marcus Holloway",
    excerpt: "The application black hole is real. But the alternative isn't networking events — it's something far simpler.",
  },
];

export default function OhMyJobHome() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setVisible(true);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = activeCategory === "All"
    ? LATEST_ARTICLES
    : LATEST_ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif", background: "#FAFAF7", color: "#1A1A1A", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&family=Libre+Franklin:wght@300;400;500;600;700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        ::selection { background: #1A1A1A; color: #FAFAF7; }

        .nav-bar {
          position: sticky; top: 0; z-index: 100;
          background: rgba(250, 250, 247, 0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #E0DDD5;
          transition: box-shadow 0.3s ease;
        }
        .nav-bar.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.06); }

        .masthead {
          text-align: center;
          padding: 28px 24px 18px;
          border-bottom: 3px double #1A1A1A;
        }
        .masthead h1 {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 900;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .masthead h1 span { color: #2B4ACB; }
        .masthead-date {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: #888;
          margin-top: 6px;
        }

        .nav-links {
          display: flex; justify-content: center; gap: 28px;
          padding: 12px 24px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          border-bottom: 1px solid #E0DDD5;
          overflow-x: auto;
        }
        .nav-links a {
          color: #555; text-decoration: none; white-space: nowrap;
          transition: color 0.2s;
          cursor: pointer;
        }
        .nav-links a:hover { color: #1A1A1A; }

        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        .breaking-bar {
          background: #1A1A1A; color: #FAFAF7;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.5px;
          padding: 10px 24px;
          text-align: center;
          overflow: hidden;
        }
        .breaking-bar span { color: #E8C547; font-weight: 700; margin-right: 12px; letter-spacing: 1.5px; }

        /* Hero featured */
        .hero { padding: 48px 0 40px; border-bottom: 1px solid #D5D1C9; }
        .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 48px; align-items: start; }
        .hero-image {
          width: 100%; aspect-ratio: 3/2; object-fit: cover;
          filter: grayscale(15%) contrast(1.05);
          transition: filter 0.4s;
        }
        .hero-image:hover { filter: grayscale(0%) contrast(1); }
        .hero-category {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2B4ACB; margin-bottom: 14px;
        }
        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 38px; font-weight: 800;
          line-height: 1.18; letter-spacing: -0.3px;
          margin-bottom: 18px;
          cursor: pointer;
          transition: color 0.2s;
        }
        .hero-title:hover { color: #2B4ACB; }
        .hero-subtitle {
          font-family: 'Source Serif 4', serif;
          font-size: 18px; line-height: 1.65;
          color: #444; margin-bottom: 24px;
        }
        .hero-meta {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px; color: #888;
          display: flex; align-items: center; gap: 8px;
        }
        .hero-meta strong { color: #1A1A1A; font-weight: 600; }

        /* Editor's picks */
        .section-header {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 2.5px; text-transform: uppercase;
          color: #1A1A1A;
          padding-bottom: 12px;
          border-bottom: 2px solid #1A1A1A;
          margin-bottom: 28px;
        }
        .picks-section { padding: 48px 0; border-bottom: 1px solid #D5D1C9; }
        .picks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .pick-card { cursor: pointer; }
        .pick-card img {
          width: 100%; aspect-ratio: 4/3; object-fit: cover;
          filter: grayscale(20%);
          transition: filter 0.4s, transform 0.4s;
        }
        .pick-card:hover img { filter: grayscale(0%); transform: scale(1.01); }
        .pick-card-cat {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2B4ACB; margin: 14px 0 8px;
        }
        .pick-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700;
          line-height: 1.28; margin-bottom: 10px;
          transition: color 0.2s;
        }
        .pick-card:hover .pick-card-title { color: #2B4ACB; }
        .pick-card-meta {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #999;
        }
        .pick-card-meta strong { color: #555; font-weight: 600; }

        /* Main content area */
        .main-section { padding: 48px 0; }
        .main-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 56px; }

        /* Category filter */
        .cat-filter {
          display: flex; gap: 6px; flex-wrap: wrap;
          margin-bottom: 32px;
        }
        .cat-btn {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.5px;
          padding: 6px 14px;
          border: 1px solid #D5D1C9;
          background: transparent;
          color: #666; cursor: pointer;
          transition: all 0.2s;
        }
        .cat-btn:hover { border-color: #1A1A1A; color: #1A1A1A; }
        .cat-btn.active {
          background: #1A1A1A; color: #FAFAF7;
          border-color: #1A1A1A;
        }

        /* Article list */
        .article-item {
          padding: 24px 0;
          border-bottom: 1px solid #E8E5DD;
          cursor: pointer;
          transition: background 0.2s;
        }
        .article-item:first-child { padding-top: 0; }
        .article-item:hover { background: rgba(0,0,0,0.01); }
        .article-item-num {
          font-family: 'Playfair Display', serif;
          font-size: 36px; font-weight: 300;
          color: #D5D1C9; line-height: 1;
          margin-bottom: 8px;
        }
        .article-item-cat {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: 2px; text-transform: uppercase;
          color: #2B4ACB; margin-bottom: 6px;
        }
        .article-item-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          line-height: 1.3; margin-bottom: 8px;
          transition: color 0.2s;
        }
        .article-item:hover .article-item-title { color: #2B4ACB; }
        .article-item-meta {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #999;
        }
        .article-item-meta strong { color: #555; font-weight: 600; }

        /* Sidebar */
        .sidebar-section { margin-bottom: 40px; }
        .sidebar-section .section-header { font-size: 10px; }

        /* Opinion */
        .opinion-card {
          padding: 20px 0;
          border-bottom: 1px solid #E8E5DD;
        }
        .opinion-card:last-child { border-bottom: none; }
        .opinion-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; font-style: italic;
          line-height: 1.35; margin-bottom: 8px;
          cursor: pointer; transition: color 0.2s;
        }
        .opinion-title:hover { color: #2B4ACB; }
        .opinion-excerpt {
          font-family: 'Source Serif 4', serif;
          font-size: 14px; line-height: 1.6; color: #666;
          margin-bottom: 8px;
        }
        .opinion-author {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; font-weight: 600; color: #888;
        }

        /* Newsletter */
        .newsletter-box {
          background: #1A1A1A; color: #FAFAF7;
          padding: 32px 28px;
        }
        .newsletter-box h3 {
          font-family: 'Playfair Display', serif;
          font-size: 22px; font-weight: 700;
          margin-bottom: 10px;
        }
        .newsletter-box p {
          font-family: 'Source Serif 4', serif;
          font-size: 14px; line-height: 1.6;
          color: #BBB; margin-bottom: 18px;
        }
        .newsletter-input {
          width: 100%; padding: 10px 14px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 13px;
          border: 1px solid #444; background: transparent;
          color: #FAFAF7; margin-bottom: 10px;
          outline: none; transition: border-color 0.2s;
        }
        .newsletter-input::placeholder { color: #777; }
        .newsletter-input:focus { border-color: #E8C547; }
        .newsletter-btn {
          width: 100%; padding: 11px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 1.5px; text-transform: uppercase;
          background: #E8C547; color: #1A1A1A;
          border: none; cursor: pointer;
          transition: background 0.2s;
        }
        .newsletter-btn:hover { background: #F0D060; }

        /* Numbers bar */
        .numbers-bar {
          border-top: 3px double #1A1A1A;
          border-bottom: 1px solid #D5D1C9;
          padding: 36px 0;
          margin-bottom: 0;
        }
        .numbers-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 24px; text-align: center;
        }
        .number-val {
          font-family: 'Playfair Display', serif;
          font-size: 38px; font-weight: 800;
          color: #1A1A1A; line-height: 1;
        }
        .number-label {
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; letter-spacing: 1px;
          text-transform: uppercase; color: #888;
          margin-top: 6px;
        }

        /* Footer */
        .site-footer {
          background: #1A1A1A; color: #999;
          padding: 48px 24px 32px;
          margin-top: 64px;
        }
        .footer-inner { max-width: 1200px; margin: 0 auto; }
        .footer-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; padding-bottom: 28px;
          border-bottom: 1px solid #333;
          flex-wrap: wrap; gap: 24px;
        }
        .footer-brand {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 900; color: #FAFAF7;
        }
        .footer-brand span { color: #2B4ACB; }
        .footer-links {
          display: flex; gap: 24px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .footer-links a { color: #777; text-decoration: none; transition: color 0.2s; }
        .footer-links a:hover { color: #FAFAF7; }
        .footer-bottom {
          padding-top: 20px;
          font-family: 'Libre Franklin', sans-serif;
          font-size: 11px; color: #555;
          text-align: center;
        }

        /* Animations */
        .fade-up {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .fade-up.visible { opacity: 1; transform: translateY(0); }
        .fade-up.d1 { transition-delay: 0.1s; }
        .fade-up.d2 { transition-delay: 0.2s; }
        .fade-up.d3 { transition-delay: 0.3s; }
        .fade-up.d4 { transition-delay: 0.4s; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 24px; }
          .picks-grid { grid-template-columns: 1fr; }
          .main-grid { grid-template-columns: 1fr; }
          .numbers-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-title { font-size: 28px; }
          .masthead h1 { font-size: 32px; }
        }
      `}</style>

      {/* Breaking Bar */}
      <div className="breaking-bar">
        <span>TRENDING</span>
        Tech layoffs slow as AI hiring surges across 14 major U.S. metros — Full Report →
      </div>

      {/* Navigation */}
      <nav className={`nav-bar ${scrolled ? "scrolled" : ""}`}>
        <div className="masthead">
          <h1>Oh My <span>Job</span></h1>
          <div className="masthead-date">Sunday, March 8, 2026 · Your career, examined.</div>
        </div>
        <div className="nav-links">
          <a>Find Jobs</a>
          <a>Career Advice</a>
          <a>Salary Data</a>
          <a>Remote Work</a>
          <a>Industry Reports</a>
          <a>Opinion</a>
          <a>Newsletter</a>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className={`hero-grid fade-up ${visible ? "visible" : ""}`}>
            <div style={{ overflow: "hidden" }}>
              <img className="hero-image" src={FEATURED_ARTICLE.image} alt="" />
            </div>
            <div>
              <div className="hero-category">{FEATURED_ARTICLE.category}</div>
              <h2 className="hero-title"><a href={FEATURED_ARTICLE.url} style={{color: 'inherit', textDecoration: 'none'}}>{FEATURED_ARTICLE.title}</a></h2>
              <p className="hero-subtitle">{FEATURED_ARTICLE.subtitle}</p>
              <div className="hero-meta">
                <strong>{FEATURED_ARTICLE.author}</strong>
                <span>·</span>
                <span>{FEATURED_ARTICLE.date}</span>
                <span>·</span>
                <span>{FEATURED_ARTICLE.readTime}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editor's Picks */}
      <section className="picks-section">
        <div className="container">
          <div className="section-header">Editor's Picks</div>
          <div className="picks-grid">
            {EDITOR_PICKS.map((pick, i) => (
              <div key={i} className={`pick-card fade-up d${i + 1} ${visible ? "visible" : ""}`}>
                <div style={{ overflow: "hidden" }}>
                  <img src={pick.image} alt="" />
                </div>
                <div className="pick-card-cat">{pick.category}</div>
                <div className="pick-card-title">{pick.title}</div>
                <div className="pick-card-meta">
                  <strong>{pick.author}</strong> · {pick.date} · {pick.readTime}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content + Sidebar */}
      <section className="main-section">
        <div className="container">
          <div className="main-grid">
            {/* Articles */}
            <div>
              <div className="section-header">Latest</div>
              <div className="cat-filter">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div>
                {filtered.map((article, i) => (
                  <div key={i} className={`article-item fade-up d${Math.min(i + 1, 4)} ${visible ? "visible" : ""}`}>
                    <div className="article-item-num">{String(i + 1).padStart(2, "0")}</div>
                    <div className="article-item-cat">{article.category}</div>
                    <div className="article-item-title">{article.title}</div>
                    <div className="article-item-meta">
                      <strong>{article.author}</strong> · {article.date} · {article.readTime}
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p style={{ fontFamily: "'Source Serif 4', serif", color: "#999", padding: "32px 0", fontStyle: "italic" }}>
                    No articles in this category yet. Check back soon.
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside>
              <div className="sidebar-section">
                <div className="section-header">Opinion</div>
                {OPINION_PIECES.map((op, i) => (
                  <div key={i} className="opinion-card">
                    <div className="opinion-title">{op.title}</div>
                    <div className="opinion-excerpt">{op.excerpt}</div>
                    <div className="opinion-author">{op.author}</div>
                  </div>
                ))}
              </div>

              <div className="sidebar-section">
                <div className="section-header">The Morning Brief</div>
                <div className="newsletter-box">
                  <h3>Get hired smarter.</h3>
                  <p>
                    A weekly dispatch of career intelligence: market shifts, salary benchmarks,
                    and the advice that actually works. Free, every Tuesday.
                  </p>
                  <input
                    className="newsletter-input"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button className="newsletter-btn">Subscribe</button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="numbers-bar">
        <div className="container">
          <div className={`numbers-grid fade-up d2 ${visible ? "visible" : ""}`}>
            {[
              { val: "8.2M", label: "Open Positions" },
              { val: "$78K", label: "Median Salary" },
              { val: "62%", label: "Offer Remote" },
              { val: "3.4%", label: "Unemployment" },
            ].map((n, i) => (
              <div key={i}>
                <div className="number-val">{n.val}</div>
                <div className="number-label">{n.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">Oh My <span>Job</span></div>
            <div className="footer-links">
              <a>About</a>
              <a>Contact</a>
              <a>Privacy</a>
              <a>Terms</a>
              <a>Advertise</a>
              <a>Careers</a>
            </div>
          </div>
          <div className="footer-bottom">
            © 2026 Oh My Job. All rights reserved. Made for job seekers, by job seekers.
          </div>
        </div>
      </footer>
    </div>
  );
}