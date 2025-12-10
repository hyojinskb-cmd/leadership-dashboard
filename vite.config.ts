import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Granular definition is safer for replacement
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Fallback for object access
      'process.env': JSON.stringify({
        NODE_ENV: mode,
        API_KEY: env.API_KEY || ''
      })
    }
  };
});