import {defineConfig} from 'vite'; import vue from '@vitejs/plugin-vue';
export default defineConfig({base:'/taihexing/',plugins:[vue()],server:{port:5173,proxy:{'/taihexing/api':{target:'http://localhost:8080',rewrite:path=>path.replace(/^\/taihexing/, '')}}}});
