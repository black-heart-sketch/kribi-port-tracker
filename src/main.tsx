/** @jsxImportSource @emotion/react */
import { createRoot } from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import App from './App.tsx';
import './index.css';

// Create an Emotion cache instance
const emotionCache = createCache({
  key: 'css',
  prepend: true,
});

createRoot(document.getElementById("root")!).render(
  <CacheProvider value={emotionCache}>
    <App />
  </CacheProvider>
);
