'use client';

import type { TrainingCategoryId } from '@/lib/freeTraining';
import { trackTrainingEvent } from '@/lib/trainingAnalytics';

export function AffiliateLink({ href, offerName, className, children, trainingCategory }: {
  href: string;
  offerName: string;
  className?: string;
  children: React.ReactNode;
  trainingCategory?: TrainingCategoryId;
}) {
  const handleClick = () => {
    if (trainingCategory) trackTrainingEvent('training_course_click', trainingCategory);
    // @ts-ignore — gtag injecté par ton script GA4
    window.gtag?.('event', 'click_affiliate_link', {
      offer_name: offerName,
      link_url: href,
      page_path: window.location.pathname,
    });
  };

  return (
    <a href={href} target="_blank" rel="nofollow sponsored noopener noreferrer" className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
