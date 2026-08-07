'use client';

export function AffiliateLink({ href, offerName, className, children }: {
  href: string;
  offerName: string;
  className?: string;
  children: React.ReactNode;
}) {
  const handleClick = () => {
    // @ts-ignore — gtag injecté par ton script GA4
    window.gtag?.('event', 'click_affiliate_link', {
      offer_name: offerName,
      link_url: href,
      page_path: window.location.pathname,
    });
  };

  return (
    <a href={href} target="_blank" rel="noopener sponsored" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}