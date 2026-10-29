// Shared header-menu data — used by the home-page hero header and by
// CheckInHeader (every other page), so the two menus can never drift apart.

export type NavChild = {
  href: string;
  label: string;
};

export type NavItem = {
  href: string;
  label: string;
  /** When present, the item renders as a dropdown instead of a plain link. */
  children?: NavChild[];
};

// The dashboard dropdown: the member's own dashboard plus their challenge
// group's dashboard. The challenge label is hard-coded from the current mock
// challenge ("30 Day Winter Reset Challenge"); it will come from the member's
// active challenge record once challenge groups are wired to the backend.
export const DASHBOARD_MENU_ITEMS: NavChild[] = [
  { href: '/dashboard', label: 'Your Dashboard' },
  { href: '/challenge-group', label: 'Winter Reset Dashboard' },
];

export const SITE_NAV: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard', children: DASHBOARD_MENU_ITEMS },
  { href: '#', label: 'Challenges' },
  { href: '#', label: 'Community' },
  { href: '#', label: 'Library' },
];
