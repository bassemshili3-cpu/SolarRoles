'use client'

import { useState } from 'react'

const CATEGORIES = [
  'All',
  'Solar Careers',
  'Salary Insights',
  'NABCEP Tips',
  'Apprenticeship',
  'Career Switch',
  'Industry Trends',
]

const FEATURED_ARTICLE = {
  category: 'Solar Careers',
  title: 'How to Land Your First Solar Job in 2026 (Even Without Experience)',
  subtitle:
    'Breaking into solar doesn’t require a 4-year degree, a NABCEP cert, or years of rooftop experience. Here’s the playbook for landing your first PV installer role — from the apprenticeship route to the direct-hire path.',
  author: 'Solar Roles Editorial Team',
  date: 'Coming July 2026',
  readTime: '8 min read',
  url: '/blog/how-to-land-first-solar-job',
  image: '/solar-featured.jpg', // ← ajoute la cover de l’article ici (1200x800 min, format 16:10)
}

const ARTICLES: Array<{
  category: string
  title: string
  author: string
  date: string
  readTime: string
  image: string | null
  url: string
}> = [
  // Un seul article pour le moment — l’article featured ci-dessus fait le taf.
  // Ajoute tes prochains articles ici quand ils sont prêts, puis on créera la page /blog/[slug]/page.tsx ensemble.
]

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  'Solar Careers':   { bg: '#FEF3C7', color: '#B45309' },
  'Salary Insights': { bg: '#F0F9FF', color: '#0B1A2E' },
  'NABCEP Tips':     { bg: '#F5F5F4', color: '#0B1A2E' },
  'Apprenticeship':  { bg: '#FEF3C7', color: '#0B1A2E' },
  'Career Switch':   { bg: '#F0F9FF', color: '#0B1A2E' },
  'Industry Trends': { bg: '#F5F5F4', color: '#B45309' },
}

function CategoryBadge({ category }: { category: string }) {
  const style = CATEGORY_COLORS[category] || { bg: '#FEF3C7', color: '#0B1A2E' }
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
  )
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const filtered =
    activeCategory === 'All'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeCategory)

  const withImages = filtered.filter((a) => a.image)
  const withoutImages = filtered.filter((a) => !a.image)

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        background: '#F9FAFB',
        color: '#111827',
        minHeight: '100vh',
      }}
    >
      <style suppressHydrationWarning>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .page-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .page-header { padding: 40px 0 32px; border-bottom: 1px solid #E5E7EB; background: #fff; }
        .page-header-inner { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .page-header h1 { font-size: 26px; font-weight: 700; color: #0B1A2E; letter-spacing: -0.5px; margin-bottom: 6px; }
        .page-header p { font-size: 15px; color: #6B7280; }
        .featured-wrap { padding: 32px 0 0; }
        .featured-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; overflow: hidden; display: grid; grid-template-columns: 1.1fr 0.9fr; }
        .featured-img { width: 100%; height: 100%; min-height: 240px; object-fit: cover; display: block; }
        .featured-body { padding: 36px 32px; display: flex; flex-direction: column; justify-content: center; }
        .featured-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #B45309; margin-bottom: 12px; }
        .featured-title { font-size: 22px; font-weight: 700; line-height: 1.35; color: #0B1A2E; margin-bottom: 12px; letter-spacing: -0.3px; text-decoration: none; display: block; transition: color 0.15s; }
        .featured-title:hover { color: #B45309; }
        .featured-subtitle { font-size: 15px; line-height: 1.6; color: #4B5563; margin-bottom: 20px; }
        .featured-meta { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #9CA3AF; }
        .featured-meta strong { color: #374151; font-weight: 600; }
        .meta-dot { color: #D1D5DB; }
        .filter-wrap { padding: 28px 0 0; }
        .filter-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .filter-label { font-size: 13px; font-weight: 500; color: #6B7280; margin-right: 4px; }
        .filter-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #E5E7EB; background: #fff; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .filter-btn:hover { border-color: #F5B819; color: #B45309; }
        .filter-btn.active { background: #0B1A2E; color: #fff; border-color: #0B1A2E; }
        .articles-wrap { padding: 28px 0 48px; }
        .articles-section-title { font-size: 13px; font-weight: 600; color: #9CA3AF; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 16px; }
        .cards-with-image { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .img-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; transition: box-shadow 0.2s, border-color 0.2s; text-decoration: none; color: inherit; display: block; }
        .img-card:hover { box-shadow: 0 4px 16px rgba(245, 184, 25, 0.18); border-color: #F5B819; }
        .img-card img { width: 100%; height: 168px; object-fit: cover; display: block; }
        .img-card-body { padding: 16px; }
        .img-card-cat { margin-bottom: 8px; }
        .img-card-title { font-size: 15px; font-weight: 600; line-height: 1.4; color: #111827; margin-bottom: 12px; letter-spacing: -0.1px; }
        .img-card:hover .img-card-title { color: #B45309; }
        .img-card-meta { font-size: 12px; color: #9CA3AF; display: flex; gap: 8px; align-items: center; }
        .img-card-meta strong { color: #6B7280; font-weight: 500; }
        .list-articles { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: #E5E7EB; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden; }
        .list-article-item { background: #fff; padding: 20px 24px; transition: background 0.15s; text-decoration: none; color: inherit; display: block; }
        .list-article-item:hover { background: #F9FAFB; }
        .list-article-cat { margin-bottom: 8px; }
        .list-article-title { font-size: 15px; font-weight: 600; line-height: 1.4; color: #111827; margin-bottom: 10px; letter-spacing: -0.1px; }
        .list-article-item:hover .list-article-title { color: #B45309; }
        .list-article-meta { font-size: 12px; color: #9CA3AF; display: flex; gap: 8px; align-items: center; }
        .list-article-meta strong { color: #6B7280; font-weight: 500; }
        .empty-state { text-align: center; padding: 64px 24px; color: #9CA3AF; font-size: 15px; background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; }
        .newsletter-wrap { background: #0B1A2E; border-radius: 10px; padding: 40px 48px; display: flex; align-items: center; justify-content: space-between; gap: 40px; margin-bottom: 48px; }
        .newsletter-text h3 { font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 6px; letter-spacing: -0.3px; }
        .newsletter-text p { font-size: 14px; color: #94A3B8; line-height: 1.5; }
        .newsletter-form { display: flex; gap: 10px; flex-shrink: 0; }
        .newsletter-input { padding: 10px 16px; border: 1px solid #1E3A5F; background: #14233B; color: #fff; border-radius: 6px; font-size: 14px; font-family: inherit; width: 260px; outline: none; transition: border-color 0.15s; }
        .newsletter-input::placeholder { color: #9CA3AF; }
        .newsletter-input:focus { border-color: #F5B819; }
        .newsletter-btn { padding: 10px 20px; background: #F5B819; color: #0B1A2E; border: none; border-radius: 6px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; white-space: nowrap; transition: background 0.15s; }
        .newsletter-btn:hover { background: #E5A810; }
        .stats-bar { background: #fff; border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px 0; margin-bottom: 48px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; }
        .stat-item { padding: 0 24px; border-right: 1px solid #E5E7EB; }
        .stat-item:last-child { border-right: none; }
        .stat-val { font-size: 28px; font-weight: 700; color: #0B1A2E; letter-spacing: -0.5px; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #9CA3AF; font-weight: 500; }
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
        }
      `}</style>

      <div className="page-header">
        <div className="page-header-inner">
          <h1>Solar Career Resources</h1>
          <p>Advice, guides, and market insights for US solar PV installers and solar industry professionals.</p>
        </div>
      </div>

      <div className="page-wrap">
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

        <div className="articles-wrap">
          {filtered.length === 0 ? (
            <div className="empty-state">No articles in this category yet — check back soon.</div>
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
                          <div className="img-card-cat"><CategoryBadge category={article.category} /></div>
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
                  <div className="articles-section-title" style={{ marginTop: withImages.length > 0 ? '8px' : '0' }}>
                    More articles
                  </div>
                  <div className="list-articles">
                    {withoutImages.map((article, i) => (
                      <a key={i} className="list-article-item" href={(article as any).url || '#'}>
                        <div className="list-article-cat"><CategoryBadge category={article.category} /></div>
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

        <div className="newsletter-wrap">
          <div className="newsletter-text">
            <h3>Get weekly solar job market insights</h3>
            <p>Salary data, hiring trends, and career tips for solar professionals — straight to your inbox every Tuesday.</p>
          </div>
          {subscribed ? (
            <div style={{ color: '#F5B819', fontWeight: 600, fontSize: '15px', flexShrink: 0 }}>
              You&rsquo;re in. See you Tuesday.
            </div>
          ) : (
            <div className="newsletter-form">
              <input className="newsletter-input" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="newsletter-btn" onClick={() => email && setSubscribed(true)}>Subscribe</button>
            </div>
          )}
        </div>

        <div className="stats-bar">
          <div className="stats-grid">
            {[
              { val: '12k+',   label: 'Active solar jobs' },
              { val: '$62K',   label: 'Median installer salary' },
              { val: '50',     label: 'States with openings' },
              { val: '1,200+', label: 'Solar companies hiring' },
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
  )
}