/**
 * Filters and formats public GitHub repositories for display.
 */

const KNOWN_DESCRIPTIONS = {
  Excel_Merger_Desktop_Application: {
    desc: 'Python GUI application built with Tkinter that automatically merges multiple Excel files into a consolidated workbook.',
    tags: ['Automation', 'Python', 'Tkinter'],
  },
  'Excel_Merger_Desktop_Application-': {
    desc: 'Python GUI application built with Tkinter that automatically merges multiple Excel files into a consolidated workbook.',
    tags: ['Automation', 'Python', 'Tkinter'],
  },
  Excel_to_sql: {
    desc: 'Desktop GUI tool (Excel2SQL) to ingest messy spreadsheets, parse schemas, and query workbook data directly with relational SQL.',
    tags: ['SQL', 'Python', 'Data Pipeline'],
  },
  PantryShop_Desktop_Version: {
    desc: 'Desktop CRM and inventory management application architected with modular MVC controllers, models, and views for shop management.',
    tags: ['Python', 'MVC', 'CRM'],
  },
  docktube: {
    desc: 'Lightweight, user-friendly YouTube media downloader built with Python and yt-dlp to download single videos and playlists.',
    tags: ['Python', 'yt-dlp', 'Automation'],
  },
  apl_contact: {
    desc: 'Mobile contact and directory management application developed in Dart with Flutter, featuring clean UI and state management.',
    tags: ['Flutter', 'Dart', 'Mobile'],
  },
  'Spring_Boot-Ordering_system-': {
    desc: 'Digital ordering and transaction management system built with Spring Boot, REST APIs, and modern front-end integration.',
    tags: ['Backend', 'Orders', 'REST API'],
  },
  'Django-RestApi-CRUD': {
    desc: 'RESTful CRUD API service built with Django REST Framework for structured backend data persistence.',
    tags: ['Django', 'REST API', 'Python'],
  },
  'DRF-JWT': {
    desc: 'Stateless JWT authentication and token verification pipeline for Django REST Framework services.',
    tags: ['Django', 'JWT', 'Auth'],
  },
  'Excel-add-ins': {
    desc: 'Custom VBA macros and spreadsheet automation add-ins for streamlined enterprise reporting.',
    tags: ['Excel', 'VBA', 'Automation'],
  },
  Food_Pantry_CRM: {
    desc: 'Customer and inventory management system tailored for pantry operations and order tracking.',
    tags: ['Python', 'CRM', 'Database'],
  },
  GDriveLinker: {
    desc: 'Python utility that converts and manages direct download links and asset sharing for Google Drive workflows.',
    tags: ['Python', 'Automation', 'Cloud'],
  },
  num2bangla: {
    desc: 'Python utility library for converting numerical figures into formatted Bengali text and numerals.',
    tags: ['Python', 'NLP', 'Localization'],
  },
  NVR_Manager: {
    desc: 'TypeScript management interface for monitoring network video recorders and device streams.',
    tags: ['TypeScript', 'Web', 'Systems'],
  },
  pygems: {
    desc: 'Full-stack web hub for Python utilities, technical tutorials, and developer tooling.',
    tags: ['JavaScript', 'Web', 'Python'],
  },
  'PyGems-Office-Utilities': {
    desc: 'Suite of Python desktop and office automation utilities to eliminate repetitive document tasks.',
    tags: ['Python', 'Automation', 'Office'],
  },
  'PyGemsBlog-V2': {
    desc: 'Content publishing platform and technical blog engine engineered with Python.',
    tags: ['Python', 'Web', 'CMS'],
  },
  RuhiPdfEditor: {
    desc: 'Python desktop utility for splitting, merging, and manipulating PDF documents.',
    tags: ['Python', 'PDF', 'Automation'],
  },
  salarySync: {
    desc: 'Automated payroll calculation and salary sheet synchronization tool built in Python.',
    tags: ['Python', 'Data', 'Automation'],
  },
  Route_9: {
    desc: 'Cross-platform mobile application built with Dart and Flutter.',
    tags: ['Flutter', 'Dart', 'Mobile'],
  },
  zia_invento: {
    desc: 'TypeScript inventory and stock tracking web application for real-time warehouse visibility.',
    tags: ['TypeScript', 'Inventory', 'Web'],
  },
};

const FEATURED_NAMES = new Set([
  'excel_to_sql',
  'excel_merger_desktop_application-',
  'excel_merger_desktop_application',
  'pantryshop_desktop_version',
  'docktube',
  'apl_contact',
  'spring_boot-ordering_system-',
]);

export function filterAndFormatRepos(repos) {
  if (!Array.isArray(repos)) return [];

  return repos
    .filter((repo) => {
      if (repo.fork) return false;
      if (repo.size === 0 && !FEATURED_NAMES.has(repo.name.toLowerCase())) return false;
      const lowerName = repo.name.toLowerCase();
      if (lowerName === 'mamuntheprogrammer' || lowerName === 'aistudio' || lowerName === 'foraistudio') return false;
      return true;
    })
    .map((repo) => {
      const lower = repo.name.toLowerCase();
      const isFeatured = FEATURED_NAMES.has(lower);
      const known = KNOWN_DESCRIPTIONS[repo.name] || KNOWN_DESCRIPTIONS[repo.name.replace(/-$/, '')];

      const cleanName = repo.name.replace(/[-_]+/g, ' ').trim();
      const fallbackDesc = `${cleanName} — ${repo.language || 'Software'} implementation and workflow utility by Mamuntheprogrammer.`;

      const desc =
        repo.description && repo.description.trim().length > 0 && repo.description !== 'for test'
          ? repo.description
          : known
            ? known.desc
            : fallbackDesc;

      const tags = known ? known.tags : [repo.language || 'Code', 'Open Source'].filter(Boolean);

      return {
        name: repo.name,
        description: desc,
        language: repo.language || 'Polyglot',
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count || 0,
        featured: isFeatured,
        tags,
      };
    })
    .sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (b.stargazers_count !== a.stargazers_count) {
        return b.stargazers_count - a.stargazers_count;
      }
      return a.name.localeCompare(b.name);
    });
}
