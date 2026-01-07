import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Test Prism',
  description: 'A unified test result parser and visualization dashboard.',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Dashboard Guide', link: '/ui-documentation' },
      { text: 'Displaying Tests', link: '/displaying-tests' },
      { text: 'Development', link: '/development-guide' },
    ],
    sidebar: [
      {
        text: 'User Guide',
        items: [
          { text: 'Dashboard Features', link: '/ui-documentation' },
          { text: 'Displaying Test Results', link: '/displaying-tests' },
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
