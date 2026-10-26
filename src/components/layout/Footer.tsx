import Image from 'next/image';
import Link from 'next/link';
import { Fragment } from 'react';

import { Container } from '@/components/layout/Container';
import { fluidFontSize } from '@/lib/fontSize';
import type { SiteSetting } from '@/payload-types';

const fontSans3 = { fontFamily: 'var(--font-source-sans-3), sans-serif' };
const fontArial = { fontFamily: 'Arial, Helvetica, sans-serif' };

type FooterLink = {
  label: string;
  href: string;
};

// Pages that do not exist yet use '#' as a placeholder href.
const exploreLinks: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Progress', href: '#' },
  { label: 'Challenges', href: '#' },
  { label: 'Library', href: '#' },
  { label: 'Community', href: '#' },
];

const supportLinks: FooterLink[] = [
  { label: 'Help center', href: '#' },
  { label: 'Contact Walt', href: '#' },
  { label: 'Frequently asked', href: '#' },
  { label: 'Account settings', href: '#' },
];

const legalLinks: FooterLink[] = [
  { label: 'Privacy', href: '#' },
  { label: 'Terms', href: '#' },
  { label: 'Accessibility', href: '#' },
];

function FooterLinkItem({ link, className }: { link: FooterLink; className?: string }) {
  const classes = className ?? 'hover:text-white';
  if (link.href === '#') {
    return (
      <a href={link.href} className={classes}>
        {link.label}
      </a>
    );
  }
  return (
    <Link href={link.href} className={classes}>
      {link.label}
    </Link>
  );
}

function LinkColumn({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <nav aria-label={title}>
      <h3
        className="font-medium uppercase tracking-[0.08em]"
        style={{ ...fontSans3, fontSize: fluidFontSize(22.5) }}
      >
        {title}
      </h3>
      <ul className="mt-5 space-y-3" style={{ ...fontSans3, fontSize: fluidFontSize(24) }}>
        {links.map((link) => (
          <li key={link.label}>
            <FooterLinkItem link={link} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Footer({ settings }: { settings: SiteSetting }) {
  const year = new Date().getFullYear();
  const name = settings.businessName || "Walt's Warriors";
  const tagline =
    settings.tagline || 'Small steps become lasting habits. Move, fuel, and mind, together.';

  return (
    <footer className="mt-auto border-t-2 border-[#e3a64e]">
      <div className="bg-[#0b1424] text-[#c5d7e2]">
        <Container className="max-w-[1440px] py-7 sm:py-9">
          <div className="grid gap-8 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-5">
              <div className="flex items-start gap-3 sm:gap-4">
                <Image
                  src="/images/shield1_small.png"
                  alt=""
                  width={88}
                  height={186}
                  sizes="112px"
                  className="h-[72px] w-auto md:h-20"
                />
                <div>
                  <h2
                    className="max-w-[12rem] font-semibold uppercase leading-[1.2]"
                    style={{ ...fontSans3, fontSize: fluidFontSize(36) }}
                  >
                    {name}
                  </h2>
                  <p
                    className="mt-5 max-w-[18rem] font-medium leading-snug"
                    style={{ ...fontSans3, fontSize: fluidFontSize(24) }}
                  >
                    {tagline}
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-4">
              <LinkColumn title="Explore" links={exploreLinks} />
            </div>

            <div className="md:col-span-3">
              <LinkColumn title="Support" links={supportLinks} />
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-[#040912] text-[#606060]">
        <Container className="max-w-[1440px] py-3 sm:py-4">
          <div
            className="grid items-center gap-4 text-center md:grid-cols-3 md:text-left"
            style={{ ...fontArial, fontSize: fluidFontSize(13.5) }}
          >
            <p>
              © {year} {name}
            </p>

            <div className="flex items-center justify-center gap-2">
              {legalLinks.map((link, index) => (
                <Fragment key={link.label}>
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  <FooterLinkItem link={link} className="hover:text-[#c5d7e2]" />
                </Fragment>
              ))}
            </div>

            <div className="flex flex-col items-center gap-1 text-[#c5d7e2] md:items-end">
              <span className="text-[#606060]" style={{ fontSize: fluidFontSize(12) }}>
                Created by
              </span>
              <Image
                src="/images/offworldcreations_logo_transparent2.png"
                alt="Offworld Creations"
                width={200}
                height={119}
                sizes="76px"
                className="h-auto w-14"
              />
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
