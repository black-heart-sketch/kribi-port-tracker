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
      // Use type assertion to handle the string | RegExp array
      allowedHosts: (mode === 'production' 
        ? ['kribi-port-tracker.vercel.app']
        : ['localhost', '6a893ef4415f.ngrok-free.app', '*.ngrok-free.app', 'kribi-port-tracker-bakend.onrender.com']) as string[],
      // Enable CORS in development
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
      // Generate sourcemaps in development
      sourcemap: mode === 'development',
      // Minify in production
      minify: mode === 'production' ? 'esbuild' : false,
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
    },
    // Define global constants
    define: {
      __APP_ENV__: JSON.stringify(mode),
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
      // Force pre-bundling of common dependencies
      force: mode === 'development',
    },
    // Cache configuration
    cacheDir: `./node_modules/.vite`,
  };

  return config;
});
