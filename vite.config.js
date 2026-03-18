const path = require('path');
const { defineConfig } = require('vite');

module.exports = defineConfig(({ command }) => ({
    base: command === 'build' ? '/soil-mechanics/' : '/',
    publicDir: false,
    server: {
        open: '/mohrs-circle.html',
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                'mohrs-circle': path.resolve(__dirname, 'mohrs-circle.html'),
                'compaction': path.resolve(__dirname, 'compaction.html'),
                'darcy-flow': path.resolve(__dirname, 'darcy-flow.html'),
                'consolidation': path.resolve(__dirname, 'consolidation.html'),
                '1d-compression': path.resolve(__dirname, '1d-compression.html'),
                'ruler': path.resolve(__dirname, 'ruler.html'),
                'sieve-analysis': path.resolve(__dirname, 'sieve-analysis.html'),
                'critical-state': path.resolve(__dirname, 'critical-state.html'),
                'elastic-footing': path.resolve(__dirname, 'elastic-footing.html'),
                'newmarks-chart': path.resolve(__dirname, 'newmarks-chart.html'),
                'system-dynamics': path.resolve(__dirname, 'system-dynamics.html'),
            },
        },
    },
}));
