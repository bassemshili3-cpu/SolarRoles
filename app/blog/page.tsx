'use client';

import { useState, useEffect } from 'react';


const CATEGORIES = ['All', 'Career Advice', 'Industry Trends', 'Remote Work', 'Salary Insights', 'Interview Tips', 'Tech Jobs'];


const FEATURED_ARTICLE = {

  category: 'Career Advice',

  title: 'How to Quit a Job in 2026: The Complete Guide to Resigning the Right Way',

  subtitle:

    'Walking away from a paycheck is never just about the job. Here\'s how to quit without putting your financial safety net at risk.',

  author: 'Eleanor M. Bishop',

  date: 'March 8, 2026',

  readTime: '14 min read',

  url: '/blog/how-to-quit-a-job',

  image: '/howtoquit.png',

};


const ARTICLES = [

  /* ─── NEW: July 2026 ─── */

  {

    category: 'Career Advice',

    title: 'Three Healthcare Careers You Can Actually Start in Under Two Years',

    author: 'Oh My Job Editorial Team',

    date: 'July 15, 2026',

    readTime: '6 min read',

    image: '/healthcare-careers.jpg',

    url: 'https://www.oh-my-job.com/blog/healthcare-careers-two-years-or-less',

  },

  {

    category: 'Industry Trends',

    title: 'Why Workplace Loneliness Is Now a Performance Problem',

    author: 'Oh My Job Editorial Team',

    date: 'July 15, 2026',

    readTime: '7 min read',

    image: '/workplace-loneliness-performance.jpg',

    url: 'https://www.oh-my-job.com/blog/workplace-loneliness-performance-risk',

  },

  /* ─── EXISTING ─── */

  {

    category: 'Salary Insights',

    title: 'What Six Figures Really Means in New York, San Francisco, and Austin',

    author: 'James Whitfield',

    date: 'March 7, 2026',

    readTime: '8 min read',

    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',

    url: 'https://www.oh-my-job.com/blog/what-six-figures-really-means',

  },

  {

    category: 'Interview Tips',

    title: 'Job Interview Questions in 2026: What Employers Are Really Asking',

    author: 'Gregory S.',

    date: 'March 7, 2026',

    readTime: '11 min read',

    image: '/interview (2).jpg',

    url: 'https://www.oh-my-job.com/blog/job-interview-questions',

  },

  {

    category: 'Interview Tips',

    title: 'The 30-Second Rule: How First Impressions Still Decide Who Gets the Offer',

    author: 'Priya Nair',

    date: 'March 6, 2026',

    readTime: '6 min read',

    image: '/30sec.jpg',

    url: 'https://www.oh-my-job.com/blog/the-30-second-rule',

  },

  {

    category: 'Remote Work',

    title: 'Return-to-Office Mandates Are Backfiring. Here\'s the Data.',

    author: 'David Rosenthal',

    date: 'March 5, 2026',

    readTime: '7 min read',

    image: '/remote.jpg',

    url: 'https://www.oh-my-job.com/blog/return-to-office-mandates-backfiring',

  },

  {

    category: 'Tech Jobs',

    title: 'Inside the AI Talent War: How Startups Are Luring Engineers Away From Big Tech',

    author: 'Michael Chen',

    date: 'March 7, 2026',

    readTime: '9 min read',

    image: null,

    url: 'https://www.oh-my-job.com/blog/ai-talent-war',

  },

  {

    category: 'Industry Trends',

    title: 'Healthcare Hiring Is Booming — But Not Where You\'d Expect',

    author: 'Sarah Abrams',

    date: 'March 6, 2026',

    readTime: '6 min read',

    image: null,

    url: 'https://www.oh-my-job.com/blog/healthcare-hiring-boom',

  },

  {

    category: 'Career Advice',

    title: 'You Don\'t Need a Personal Brand. You Need a Personal Practice.',

    author: 'Tomás Rivera',

    date: 'March 5, 2026',

    readTime: '5 min read',

    image: null,

    url: 'https://www.oh-my-job.com/blog/personal-practice-not-brand',

  },

  {

    category: 'Salary Insights',

    title: 'The Hidden Cost of Stock Options: A Cautionary Tale for Job Hoppers',

    author: 'Angela Wu',

    date: 'March 4, 2026',

    readTime: '7 min read',

    image: null,

    url: 'https://www.oh-my-job.com/blog/stock-options-hidden-cost',

  },

  {

    category: 'Remote Work',

    title: 'Digital Nomad Visas: Which Countries Are Actually Worth It in 2026?',

    author: 'Lukas Bauer',

    date: 'March 3, 2026',

    readTime: '8 min read',

    image: null,

    url: 'https://www.oh-my-job.com/blog/digital-nomad-visas-2026',

  },

  {

    category: 'Interview Tips',

    title: 'When the Interviewer Asks \'Why Should We Hire You?\' — The Only Answer That Works',

    author: 'Rachel Simmons',

    date: 'March 2, 2026',

    readTime: '4 min read',

    image: null,

    url: 'https://www.oh-my-job.com/blog/why-should-we-hire-you',

  },

];


const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {

  'Career Advice': { bg: '#EEF2FF', color: '#2B4ACB' },

  'Interview Tips': { bg: '#F0FDF4', color: '#16A34A' },

  'Salary Insights': { bg: '#FFF7ED', color: '#C2410C' },

  'Remote Work': { bg: '#F0F9FF', color: '#0369A1' },

  'Tech Jobs': { bg: '#FAF5FF', color: '#7C3AED' },

  'Industry Trends': { bg: '#FDF2F8', color: '#BE185D' },

};


function CategoryBadge({ category }: { category: string }) {

  const style = CATEGORY_COLORS[category] || { bg: '#F3F4F6', color: '#374151' };

  return (

    <span

      style={{

        display: 'inline-block',

        padding: '3px 10px',

        borderRadius: '4px',

        fontSize: '11px',

        fontWeight: 600,

        letterSpacing: '0.3px',

        background: style.bg,

        color: style.color,

      }}

    >

      {category}

    </span>

  );

}


export default function BlogPage() {

  const [activeCategory, setActiveCategory] = useState('All');

  const [email, setEmail] = useState('');

  const [subscribed, setSubscribed] = useState(false);


  const filtered =

    activeCategory === 'All'

      ? ARTICLES

      : ARTICLES.filter((a) => a.category === activeCategory);


  const withImages = filtered.filter((a) => a.image);

  const withoutImages = filtered.filter((a) => !a.image);


  return (

    <div

      style={{

        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

        background: '#F8F9FC',

        color: '#111827',

        minHeight: '100vh',

      }}

    >

      <style suppressHydrationWarning>{`

        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');


        * { margin: 0; padding: 0; box-sizing: border-box; }


        .page-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }


        /* Page header */

        .page-header {

          padding: 40px 0 32px;

          border-bottom: 1px solid #E5E7EB;

          background: #fff;

          margin-bottom: 0;

        }

        .page-header-inner {

          max-width: 1200px; margin: 0 auto; padding: 0 24px;

        }

        .page-header h1 {

          font-size: 26px; font-weight: 700;

          color: #0F1B3D; letter-spacing: -0.5px;

          margin-bottom: 6px;

        }

        .page-header p {

          font-size: 15px; color: #6B7280; font-weight: 400;

        }


        /* Featured */

        .featured-wrap { padding: 32px 0 0; }

        .featured-card {

          background: #fff;

          border: 1px solid #E5E7EB;

          border-radius: 10px;

          overflow: hidden;

          display: grid;

          grid-template-columns: 1.1fr 0.9fr;

        }

        .featured-img {

          width: 100%; height: 100%;

          min-height: 240px;

          object-fit: cover;

          display: block;

        }

        .featured-body {

          padding: 36px 32px;

          display: flex; flex-direction: column; justify-content: center;

        }

        .featured-label {

          font-size: 11px; font-weight: 700;

          letter-spacing: 1px; text-transform: uppercase;

          color: #2B4ACB; margin-bottom: 12px;

        }

        .featured-title {

          font-size: 22px; font-weight: 700;

          line-height: 1.35; color: #0F1B3D;

          margin-bottom: 12px; letter-spacing: -0.3px;

          text-decoration: none; display: block;

          transition: color 0.15s;

        }

        .featured-title:hover { color: #2B4ACB; }

        .featured-subtitle {

          font-size: 15px; line-height: 1.6;

          color: #4B5563; margin-bottom: 20px;

        }

        .featured-meta {

          display: flex; align-items: center; gap: 12px;

          font-size: 13px; color: #9CA3AF;

        }

        .featured-meta strong { color: #374151; font-weight: 600; }

        .meta-dot { color: #D1D5DB; }


        /* Category filter */

        .filter-wrap { padding: 28px 0 0; }

        .filter-row {

          display: flex; gap: 8px; flex-wrap: wrap; align-items: center;

        }

        .filter-label {

          font-size: 13px; font-weight: 500;

          color: #6B7280; margin-right: 4px;

        }

        .filter-btn {

          padding: 6px 14px;

          border-radius: 20px;

          border: 1px solid #E5E7EB;

          background: #fff;

          font-size: 13px; font-weight: 500;

          color: #374151; cursor: pointer;

          transition: all 0.15s;

          font-family: inherit;

        }

        .filter-btn:hover { border-color: #2B4ACB; color: #2B4ACB; }

        .filter-btn.active {

          background: #2B4ACB; color: #fff;

          border-color: #2B4ACB;

        }


        /* Articles grid */

        .articles-wrap { padding: 28px 0 48px; }

        .articles-section-title {

          font-size: 13px; font-weight: 600;

          color: #9CA3AF; letter-spacing: 0.5px;

          text-transform: uppercase;

          margin-bottom: 16px;

        }


        /* Card with image */

        .cards-with-image {

          display: grid; grid-template-columns: repeat(3, 1fr);

          gap: 20px; margin-bottom: 32px;

        }

        .img-card {

          background: #fff;

          border: 1px solid #E5E7EB;

          border-radius: 8px; overflow: hidden;

          cursor: pointer;

          transition: box-shadow 0.2s, border-color 0.2s;

          text-decoration: none; color: inherit; display: block;

        }

        .img-card:hover { box-shadow: 0 4px 16px rgba(43,74,203,0.1); border-color: #C7D2FE; }

        .img-card img { width: 100%; height: 168px; object-fit: cover; display: block; }

        .img-card-body { padding: 16px; }

        .img-card-cat { margin-bottom: 8px; }

        .img-card-title {

          font-size: 15px; font-weight: 600;

          line-height: 1.4; color: #111827;

          margin-bottom: 12px; letter-spacing: -0.1px;

        }

        .img-card:hover .img-card-title { color: #2B4ACB; }

        .img-card-meta {

          font-size: 12px; color: #9CA3AF;

          display: flex; gap: 8px; align-items: center;

        }

        .img-card-meta strong { color: #6B7280; font-weight: 500; }


        /* List articles (no image) */

        .list-articles {

          display: grid; grid-template-columns: repeat(2, 1fr);

          gap: 1px;

          background: #E5E7EB;

          border: 1px solid #E5E7EB;

          border-radius: 8px; overflow: hidden;

        }

        .list-article-item {

          background: #fff;

          padding: 20px 24px;

          cursor: pointer;

          transition: background 0.15s;

          text-decoration: none; color: inherit; display: block;

        }

        .list-article-item:hover { background: #F8F9FC; }

        .list-article-cat { margin-bottom: 8px; }

        .list-article-title {

          font-size: 15px; font-weight: 600;

          line-height: 1.4; color: #111827;

          margin-bottom: 10px; letter-spacing: -0.1px;

        }

        .list-article-item:hover .list-article-title { color: #2B4ACB; }

        .list-article-meta {

          font-size: 12px; color: #9CA3AF;

          display: flex; gap: 8px; align-items: center;

        }

        .list-article-meta strong { color: #6B7280; font-weight: 500; }


        /* Empty state */

        .empty-state {

          text-align: center; padding: 64px 24px;

          color: #9CA3AF; font-size: 15px;

          background: #fff; border: 1px solid #E5E7EB;

          border-radius: 8px;

        }


        /* Newsletter */

        .newsletter-wrap {

          background: #0F1B3D;

          border-radius: 10px;

          padding: 40px 48px;

          display: flex; align-items: center;

          justify-content: space-between; gap: 40px;

          margin-bottom: 48px;

        }

        .newsletter-text h3 {

          font-size: 20px; font-weight: 700;

          color: #fff; margin-bottom: 6px;

          letter-spacing: -0.3px;

        }

        .newsletter-text p {

          font-size: 14px; color: #9CA3AF; line-height: 1.5;

        }

        .newsletter-form {

          display: flex; gap: 10px; flex-shrink: 0;

        }

        .newsletter-input {

          padding: 10px 16px;

          border: 1px solid #374151;

          background: #1F2D52;

          color: #fff; border-radius: 6px;

          font-size: 14px; font-family: inherit;

          width: 260px; outline: none;

          transition: border-color 0.15s;

        }

        .newsletter-input::placeholder { color: #6B7280; }

        .newsletter-input:focus { border-color: #2B4ACB; }

        .newsletter-btn {

          padding: 10px 20px;

          background: #2B4ACB; color: #fff;

          border: none; border-radius: 6px;

          font-size: 14px; font-weight: 600;

          font-family: inherit; cursor: pointer;

          white-space: nowrap;

          transition: background 0.15s;

        }

        .newsletter-btn:hover { background: #2240B0; }


        /* Stats */

        .stats-bar {

          background: #fff;

          border: 1px solid #E5E7EB;

          border-radius: 8px;

          padding: 24px 0;

          margin-bottom: 48px;

        }

        .stats-grid {

          display: grid; grid-template-columns: repeat(4, 1fr);

          text-align: center;

        }

        .stat-item {

          padding: 0 24px;

          border-right: 1px solid #E5E7EB;

        }

        .stat-item:last-child { border-right: none; }

        .stat-val {

          font-size: 28px; font-weight: 700;

          color: #0F1B3D; letter-spacing: -0.5px;

          margin-bottom: 4px;

        }

        .stat-label {

          font-size: 12px; color: #9CA3AF; font-weight: 500;

        }


        @media (max-width: 900px) {

          .featured-card { grid-template-columns: 1fr; }

          .featured-img { min-height: 200px; max-height: 220px; }

          .cards-with-image { grid-template-columns: 1fr; }

          .list-articles { grid-template-columns: 1fr; }

          .newsletter-wrap { flex-direction: column; padding: 28px 24px; gap: 20px; }

          .newsletter-form { flex-direction: column; width: 100%; }

          .newsletter-input { width: 100%; }

          .stats-grid { grid-template-columns: repeat(2, 1fr); }

          .stat-item:nth-child(2) { border-right: none; }

          .stat-item:nth-child(3), .stat-item:nth-child(4) { border-top: 1px solid #E5E7EB; border-right: none; }

          .stat-item:nth-child(4) { border-right: none; }

          .footer-inner { flex-direction: column; align-items: flex-start; }

        }

      `}</style>


      {/* Page header */}

      <div className="page-header">

        <div className="page-header-inner">

          <h1>Career Resources</h1>

          <p>Advice, guides, and market insights to help you land your next job.</p>

        </div>

      </div>


      <div className="page-wrap">

        {/* Featured article */}

        <div className="featured-wrap">

          <a href={FEATURED_ARTICLE.url} style={{ textDecoration: 'none', color: 'inherit' }}>

            <div className="featured-card">

              <img className="featured-img" src={FEATURED_ARTICLE.image} alt={FEATURED_ARTICLE.title} />

              <div className="featured-body">

                <div className="featured-label">Featured</div>

                <CategoryBadge category={FEATURED_ARTICLE.category} />

                <div style={{ marginTop: '12px' }}>

                  <span className="featured-title">{FEATURED_ARTICLE.title}</span>

                </div>

                <p className="featured-subtitle">{FEATURED_ARTICLE.subtitle}</p>

                <div className="featured-meta">

                  <strong>{FEATURED_ARTICLE.author}</strong>

                  <span className="meta-dot">·</span>

                  <span>{FEATURED_ARTICLE.date}</span>

                  <span className="meta-dot">·</span>

                  <span>{FEATURED_ARTICLE.readTime}</span>

                </div>

              </div>

            </div>

          </a>

        </div>


        {/* Filter */}

        <div className="filter-wrap">

          <div className="filter-row">

            <span className="filter-label">Topic:</span>

            {CATEGORIES.map((cat) => (

              <button

                key={cat}

                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}

                onClick={() => setActiveCategory(cat)}

              >

                {cat}

              </button>

            ))}

          </div>

        </div>


        {/* Articles */}

        <div className="articles-wrap">

          {filtered.length === 0 ? (

            <div className="empty-state">No articles in this category yet.</div>

          ) : (

            <>

              {withImages.length > 0 && (

                <>

                  <div className="articles-section-title">Latest guides</div>

                  <div className="cards-with-image">

                    {withImages.map((article, i) => (

                      <a key={i} className="img-card" href={(article as any).url || '#'}>

                        <img src={article.image!} alt={article.title} />

                        <div className="img-card-body">

                          <div className="img-card-cat">

                            <CategoryBadge category={article.category} />

                          </div>

                          <div className="img-card-title">{article.title}</div>

                          <div className="img-card-meta">

                            <strong>{article.author}</strong>

                            <span>·</span>

                            <span>{article.readTime}</span>

                          </div>

                        </div>

                      </a>

                    ))}

                  </div>

                </>

              )}


              {withoutImages.length > 0 && (

                <>

                  <div

                    className="articles-section-title"

                    style={{ marginTop: withImages.length > 0 ? '8px' : '0' }}

                  >

                    More articles

                  </div>

                  <div className="list-articles">

                    {withoutImages.map((article, i) => (

                      <a key={i} className="list-article-item" href={(article as any).url || '#'}>

                        <div className="list-article-cat">

                          <CategoryBadge category={article.category} />

                        </div>

                        <div className="list-article-title">{article.title}</div>

                        <div className="list-article-meta">

                          <strong>{article.author}</strong>

                          <span>·</span>

                          <span>{article.readTime}</span>

                        </div>

                      </a>

                    ))}

                  </div>

                </>

              )}

            </>

          )}

        </div>


        {/* Newsletter */}

        <div className="newsletter-wrap">

          <div className="newsletter-text">

            <h3>Get weekly job market insights</h3>

            <p>Salary data, hiring trends, and career tips — straight to your inbox every Tuesday.</p>

          </div>

          {subscribed ? (

            <div style={{ color: '#86EFAC', fontWeight: 600, fontSize: '15px', flexShrink: 0 }}>

              You&apos;re in. See you Tuesday.

            </div>

          ) : (

            <div className="newsletter-form">

              <input

                className="newsletter-input"

                type="email"

                placeholder="Enter your email"

                value={email}

                onChange={(e) => setEmail(e.target.value)}

              />

              <button className="newsletter-btn" onClick={() => email && setSubscribed(true)}>

                Subscribe

              </button>

            </div>

          )}

        </div>


        {/* Stats */}

        <div className="stats-bar">

          <div className="stats-grid">

            {[

              { val: '8.2M', label: 'Open Positions' },

              { val: '$78K', label: 'Median Salary' },

              { val: '62%', label: 'Offer Remote' },

              { val: '3.4%', label: 'Unemployment' },

            ].map((n, i) => (

              <div key={i} className="stat-item">

                <div className="stat-val">{n.val}</div>

                <div className="stat-label">{n.label}</div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

}