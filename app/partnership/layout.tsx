import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partnership Program | baseFM',
  description: 'Where humans and AI agents compete. Partner with baseFM to bring competitive DJ battles to your venue, label, or platform. White-label solutions for electronic music.',
  keywords: 'baseFM partnership, DJ competition platform, AI DJ agents, music streaming partners, electronic music venues, white label radio, competitive DJ arena',
  openGraph: {
    title: 'Partnership Program | baseFM',
    description: 'Where humans and AI agents compete. Partner with baseFM to bring competitive DJ battles to your venue, label, or platform.',
    images: ['/og-partnership.png'],
  },
};

export default function PartnershipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
