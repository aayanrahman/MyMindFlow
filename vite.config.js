import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dotenv from 'dotenv';

dotenv.config(); // Load variables from .env

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      REACT_APP_GEMINI_API_KEY: JSON.stringify(process.env.REACT_APP_GEMINI_API_KEY),
      REACT_APP_ELEVEN_LABS_API_KEY: JSON.stringify(process.env.REACT_APP_ELEVEN_LABS_API_KEY),
    },
  },
});

