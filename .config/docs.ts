import type { BunPressOptions } from '@stacksjs/bunpress'

const config: BunPressOptions = {
  verbose: true,

  docsDir: './docs',
  outDir: './dist',

  theme: 'vitepress',

  markdown: {
    title: 'Stacks.js White Paper',

    meta: {
      description: 'An open protocol and reference implementation for building full-stack TypeScript applications with Bun',
      author: 'Stacks.js Core Team',
      viewport: 'width=device-width, initial-scale=1.0',
    },

    toc: {
      enabled: true,
      position: ['sidebar'],
      title: 'On This Page',
      minDepth: 2,
      maxDepth: 4,
      smoothScroll: true,
      activeHighlight: true,
      collapsible: true,
    },

    syntaxHighlightTheme: 'github-dark',

    preserveDirectoryStructure: true,

    features: {
      inlineFormatting: true,
      containers: true,
      githubAlerts: true,
      codeBlocks: {
        lineHighlighting: true,
        lineNumbers: true,
        focus: true,
        diffs: true,
        errorWarningMarkers: true,
      },
      codeGroups: true,
      codeImports: true,
      inlineToc: true,
      customAnchors: true,
      emoji: true,
      badges: true,
      includes: true,
      externalLinks: {
        autoTarget: true,
        autoRel: true,
        showIcon: true,
      },
      imageLazyLoading: true,
      tables: {
        alignment: true,
        enhancedStyling: true,
        responsive: true,
      },
    },

    nav: [
      { text: 'Home', link: '/' },
      {
        text: 'Introduction',
        activeMatch: '/introduction',
        items: [
          { text: 'Overview', link: '/introduction/' },
          { text: 'Protocol & Framework Overview', link: '/introduction/overview' },
          { text: 'Getting Started', link: '/introduction/getting-started' },
        ],
      },
      {
        text: 'Guide',
        activeMatch: '/guide',
        items: [
          { text: 'Frontend', link: '/guide/frontend' },
          { text: 'Backend', link: '/guide/backend' },
          { text: 'Database', link: '/guide/database' },
          { text: 'Authentication', link: '/guide/authentication' },
        ],
      },
      {
        text: 'Advanced',
        activeMatch: '/advanced',
        items: [
          { text: 'Dashboard', link: '/advanced/dashboard' },
          { text: 'AI Integration', link: '/advanced/ai-integration' },
          { text: 'Cloud Infrastructure', link: '/advanced/cloud-infrastructure' },
          { text: 'Real-Time', link: '/advanced/realtime' },
        ],
      },
      { text: 'Reference', link: '/reference/modules' },
    ],

    sidebar: {
      '/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Overview', link: '/introduction/' },
            { text: 'Protocol & Framework Overview', link: '/introduction/overview' },
            { text: 'Getting Started', link: '/introduction/getting-started' },
          ],
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Technical Architecture', link: '/architecture/' },
            { text: 'Request Lifecycle', link: '/architecture/request-lifecycle' },
            { text: 'Runtime & Performance', link: '/architecture/performance' },
            { text: 'Framework Internals', link: '/architecture/internals' },
          ],
        },
        {
          text: 'Core Guide',
          items: [
            { text: 'Frontend Development', link: '/guide/frontend' },
            { text: 'STX Components', link: '/guide/components' },
            { text: 'Backend Development', link: '/guide/backend' },
            { text: 'Database & ORM', link: '/guide/database' },
            { text: 'Authentication & Security', link: '/guide/authentication' },
            { text: 'Validation', link: '/guide/validation' },
            { text: 'Queues & Jobs', link: '/guide/queues' },
            { text: 'Email & Notifications', link: '/guide/notifications' },
            { text: 'Error Handling', link: '/guide/error-handling' },
            { text: 'Security', link: '/guide/security' },
            { text: 'Logging', link: '/guide/logging' },
            { text: 'API Design', link: '/guide/api-design' },
            { text: 'Examples & Recipes', link: '/guide/examples' },
          ],
        },
        {
          text: 'Frontend',
          items: [
            { text: 'Accessibility', link: '/frontend/accessibility' },
            { text: 'SEO', link: '/frontend/seo' },
          ],
        },
        {
          text: 'Advanced Features',
          items: [
            { text: 'Dashboard', link: '/advanced/dashboard' },
            { text: 'AI Integration', link: '/advanced/ai-integration' },
            { text: 'Cloud & Infrastructure', link: '/advanced/cloud-infrastructure' },
            { text: 'Real-Time & Messaging', link: '/advanced/realtime' },
            { text: 'Production & Operations', link: '/advanced/production' },
            { text: 'Performance Tuning', link: '/advanced/performance' },
            { text: 'Search Integration', link: '/advanced/search' },
            { text: 'File Storage', link: '/advanced/storage' },
            { text: 'Internationalization', link: '/advanced/i18n' },
            { text: 'Content Management', link: '/advanced/cms' },
            { text: 'E-Commerce', link: '/advanced/commerce' },
            { text: 'Desktop Applications', link: '/advanced/desktop' },
            { text: 'Chat & Messaging', link: '/advanced/chat' },
            { text: 'Push Notifications', link: '/advanced/push-notifications' },
            { text: 'Social Integration', link: '/advanced/socials' },
            { text: 'Analytics', link: '/advanced/analytics' },
            { text: 'Calendar & Scheduling', link: '/advanced/calendar' },
            { text: 'Debugging with X-Ray', link: '/advanced/debugging' },
          ],
        },
        {
          text: 'Developer Experience',
          items: [
            { text: 'CLI & Tooling', link: '/developer-experience/cli' },
            { text: 'Developer Tools', link: '/developer-experience/tooling' },
            { text: 'IDE Setup', link: '/developer-experience/ide-setup' },
            { text: 'Type Safety', link: '/developer-experience/type-safety' },
            { text: 'Testing & Quality', link: '/developer-experience/testing' },
          ],
        },
        {
          text: 'Ecosystem',
          items: [
            { text: 'Companion Packages', link: '/ecosystem/companion-packages' },
            { text: 'Library Showcases', link: '/ecosystem/libraries' },
            { text: 'Bun Plugins', link: '/ecosystem/bun-plugins' },
            { text: 'Multimodal Deployment', link: '/ecosystem/deployment' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Source Evidence', link: '/reference/source-evidence' },
            { text: 'Configuration', link: '/reference/configuration' },
            { text: 'Use Cases', link: '/reference/use-cases' },
            { text: 'Module Reference', link: '/reference/modules' },
            { text: 'Protocol & Framework Comparison', link: '/reference/comparison' },
            { text: 'Migration Guides', link: '/reference/migration' },
            { text: 'Troubleshooting & FAQ', link: '/reference/troubleshooting' },
            { text: 'Upgrade Guide', link: '/reference/upgrade-guide' },
            { text: 'Contributing', link: '/reference/contributing' },
            { text: 'Community', link: '/reference/community' },
            { text: 'Roadmap & Future', link: '/reference/roadmap' },
          ],
        },
      ],
    },
  },

  sitemap: {
    enabled: true,
    baseUrl: 'https://whitepaper.stacksjs.com',
    filename: 'sitemap.xml',
    defaultPriority: 0.5,
    defaultChangefreq: 'monthly',
  },

  robots: {
    enabled: true,
    filename: 'robots.txt',
  },
}

export default config
