import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import type { UserConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }): UserConfig => {
  // Load env file based on `mode` in the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  const config: UserConfig = {
    server: {
      host: "::",
      port: 8080,
      strictPort: false,
      open: true,
      cors: mode === 'development',
      // Allow access from any host
      allowedHosts: true,
    },
    plugins: [
      react({
        // SWC configuration
        jsxImportSource: '@emotion/react',
        tsDecorators: true,
        plugins: [
          ['@swc/plugin-emotion', {
            sourceMap: mode === 'development',
            autoLabel: 'always',
            labelFormat: '[local]',
            cssPropOptimization: true,
          }],
        ],
      }),
      // Only use component tagger in development
      mode === 'development' && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      // Output directory for production build
      outDir: 'dist',
      // Generate sourcemaps in development, none in production for better performance
      sourcemap: mode !== 'production' ? 'inline' : false,
      // Minify in production
      minify: mode === 'production' ? 'esbuild' : false,
      // Enable production optimizations
      target: 'esnext',
      // Enable tree shaking and dead code elimination
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      // Rollup options for better code splitting
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor modules
            react: ['react', 'react-dom', 'react-router-dom'],
            // Split UI libraries
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
            // Split utility libraries
            utils: ['date-fns', 'zod', 'react-hook-form', '@hookform/resolvers'],
          },
        },
      },
      // Enable gzip and brotli compression in production
      reportCompressedSize: mode === 'production',
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Enable CSS minification in production
      cssMinify: mode === 'production'
    },
    // Define global constants
    define: {
      __APP_ENV__: JSON.stringify(mode),
      // Ensure React is in production mode when building for production
      'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      // Force pre-bundling of common dependencies
      force: mode === 'development',
      // Enable esbuild optimizations
      esbuildOptions: {
        // Enable production optimizations in production
        define: {
          global: 'globalThis',
        },
      },
    },
    // Cache configuration
    cacheDir: `./node_modules/.vite`,
  };

  return config;
});
