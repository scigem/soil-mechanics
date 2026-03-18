const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig(({ command }) => ({
    base: command === 'build' ? '/soil-mechanics/' : '/',
    publicDir: false,
    server: {
        open: '/html/mohrs-circle.html',
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'mohrs-circle': path.resolve(__dirname, 'html/mohrs-circle.html'),
                compaction: path.resolve(__dirname, 'html/compaction.html'),
                ruler: path.resolve(__dirname, 'html/ruler.html'),
                'sieve-analysis': path.resolve(__dirname, 'html/sieve-analysis.html'),
                'critical-state': path.resolve(__dirname, 'html/critical-state.html'),
                'elastic-footing': path.resolve(__dirname, 'html/elastic-footing.html'),
                'newmarks-chart': path.resolve(__dirname, 'html/newmarks-chart.html'),
                'system-dynamics': path.resolve(__dirname, 'html/system-dynamics.html'),
            },
        },
    },
}));
