import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Test Prism',
  description: 'A unified test result parser and visualization dashboard.',
  base: '/Test-Prism/',
  head: [['link', { rel: 'icon', href: '/Test-Prism/images/logo/favicon.ico' }]],
  themeConfig: {
    logo: '/images/logo/logo_without_text.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Dashboard Features', link: '/features' },
      { text: 'Layout Definition', link: '/layout-definition' },
      { text: 'Displaying Tests', link: '/displaying-tests' },
      { text: 'CLI Usage', link: '/cli-usage' },
    ],
    sidebar: [
      {
        text: 'User Guide',
        items: [
          { text: 'Dashboard Features', link: '/features' },
          { text: 'Displaying Test Results', link: '/displaying-tests' },
          { text: 'Layout Definition', link: '/layout-definition' },
          { text: 'Available Widgets', link: '/available-widgets' },
          { text: 'CLI', link: '/cli-usage' },
        ],
      },
      {
        text: 'Development',
        items: [{ text: 'Local Setup', link: '/development-guide' }],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/andrei2699/Test-Prism' }],
  },
});
