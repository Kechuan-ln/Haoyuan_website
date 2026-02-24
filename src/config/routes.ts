export const ROUTES = {
  // Public
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  SERVICE_DETAIL: '/services/:id',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  TEAM: '/team',
  QUALIFICATIONS: '/qualifications',
  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',
  CONTACT: '/contact',

  // Bidding
  BIDDING: '/bidding',
  BIDDING_DETAIL: '/bidding/:id',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',

  // Vendor
  VENDOR_DASHBOARD: '/vendor/dashboard',
  VENDOR_REGISTER: '/vendor/register',
  VENDOR_MY_BIDS: '/vendor/my-bids',
  VENDOR_BID_SUBMIT: '/vendor/bid/:id/submit',
  VENDOR_BID_RESULT: '/vendor/bid/:id/result',

  // Admin
  ADMIN: '/admin',
  ADMIN_ARTICLES: '/admin/articles',
  ADMIN_ARTICLES_NEW: '/admin/articles/new',
  ADMIN_ARTICLES_EDIT: '/admin/articles/:id/edit',
  ADMIN_PROJECTS: '/admin/projects',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_BIDS: '/admin/bids',
  ADMIN_BID_EVALUATE: '/admin/bids/:id/evaluate',
  ADMIN_BID_REPORT: '/admin/bids/:id/report',
  ADMIN_CONTACTS: '/admin/contacts',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_TEAM: '/admin/team',
  ADMIN_ABOUT: '/admin/about',
  ADMIN_HOME: '/admin/home',
  ADMIN_QUALIFICATIONS: '/admin/qualifications',
  ADMIN_USERS: '/admin/users',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_REVIEW: '/admin/review',
} as const
