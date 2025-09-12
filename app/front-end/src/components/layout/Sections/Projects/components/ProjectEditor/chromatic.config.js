/**
 * Chromatic Configuration for ProjectEditor Visual Regression Testing
 *
 * This configuration file defines the visual regression testing setup
 * for the ProjectEditor component using Chromatic.
 */

module.exports = {
  // Project configuration
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,

  // Build configuration
  buildScriptName: 'build-storybook',
  storybookBuildDir: 'storybook-static',

  // Visual testing configuration
  threshold: 0.2, // 0.2% threshold for visual changes

  // Viewport configuration for responsive testing
  viewports: [
    {
      name: 'mobile',
      width: 375,
      height: 667,
    },
    {
      name: 'tablet',
      width: 768,
      height: 1024,
    },
    {
      name: 'desktop',
      width: 1200,
      height: 800,
    },
    {
      name: 'large-desktop',
      width: 1920,
      height: 1080,
    },
  ],

  // Browser configuration
  browsers: ['chrome', 'firefox', 'safari', 'edge'],

  // Interaction testing
  interactionTestConcurrency: 2,

  // Performance configuration
  uploadConcurrency: 10,

  // File patterns to include/exclude
  onlyStoryFiles: [
    'src/components/layout/Sections/Projects/components/ProjectEditor/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  // Skip stories that are not ready for visual testing
  skip: [
    // Add story names to skip if needed
  ],

  // Auto-accept changes in specific branches
  autoAcceptChanges: process.env.NODE_ENV === 'development' ? false : 'main',

  // Exit codes
  exitZeroOnChanges: false,
  exitOnceUploaded: false,

  // Debugging
  debug: process.env.NODE_ENV === 'development',

  // Ignore patterns for files that shouldn't trigger builds
  ignoreLastBuildOnBranch: 'main',

  // TurboSnap configuration for faster builds
  onlyChanged: true,
  traceChanged: 'expanded',

  // Storybook configuration
  storybookConfigDir: '.storybook',

  // Component-specific configuration
  componentConfig: {
    ProjectEditor: {
      // Specific configuration for ProjectEditor stories
      delay: 500, // Wait 500ms before taking screenshots

      // Interaction delays for different actions
      interactions: {
        'mode-switch': 300,
        'toolbar-action': 200,
        'content-change': 100,
      },

      // Responsive breakpoints specific to ProjectEditor
      breakpoints: [375, 768, 1024, 1440, 1920],

      // Accessibility testing
      accessibility: {
        enabled: true,
        rules: ['color-contrast', 'keyboard-navigation', 'aria-labels', 'focus-management'],
      },

      // Performance thresholds
      performance: {
        renderTime: 1000, // Max 1 second render time
        interactionDelay: 300, // Max 300ms interaction delay
      },
    },
  },

  // Custom matchers for visual regression
  matchers: {
    // Ignore minor text rendering differences
    textRendering: {
      threshold: 0.1,
    },

    // Ignore minor color variations
    colorVariation: {
      threshold: 0.05,
    },

    // Ignore layout shifts smaller than 1px
    layoutShift: {
      threshold: 1,
    },
  },

  // Notification configuration
  notifications: {
    // Slack webhook for build notifications
    slack: {
      webhook: process.env.SLACK_WEBHOOK_URL,
      channel: '#frontend-testing',
      onSuccess: false,
      onFailure: true,
      onChanges: true,
    },

    // Email notifications
    email: {
      enabled: false,
      recipients: ['team@example.com'],
    },
  },

  // CI/CD integration
  ci: {
    // GitHub Actions integration
    github: {
      enabled: true,
      statusChecks: true,
      prComments: true,
    },

    // Build information
    buildInfo: {
      commit: process.env.GITHUB_SHA,
      branch: process.env.GITHUB_REF_NAME,
      pullRequest: process.env.GITHUB_PR_NUMBER,
    },
  },

  // Advanced configuration
  advanced: {
    // Parallel testing
    parallelism: 4,

    // Retry configuration
    retries: 2,

    // Timeout configuration
    timeout: 300000, // 5 minutes

    // Memory limits
    memoryLimit: '2GB',

    // Custom headers
    headers: {
      'User-Agent': 'Chromatic-ProjectEditor-Tests',
    },
  },
};
