module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: false,
  },
  // Ensure Storybook's Vite builder resolves the same path aliases as the app (e.g. @/)
  async viteFinal(config, { configType }) {
    // lazy require to avoid changing install-time behavior
    const tsconfigPaths = require('vite-tsconfig-paths').default;
    const plugin = tsconfigPaths();
    config.plugins = config.plugins ? [...config.plugins, plugin] : [plugin];
    return config;
  },
};
