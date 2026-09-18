const fs = require('fs');
const path = require('path');
const { defineConfig } = require('vite');

function getHtmlEntries(rootDir) {
    return Object.fromEntries(
        fs.readdirSync(rootDir)
            .filter((fileName) => fileName.endsWith('.html'))
            .sort((left, right) => left.localeCompare(right))
            .map((fileName) => [fileName.replace(/\.html$/, ''), path.resolve(rootDir, fileName)])
    );
}

module.exports = defineConfig(({ command }) => ({
    base: command === 'build' ? '/soil-mechanics/' : '/',
    publicDir: false,
    server: {
        open: '/',
    },
    build: {
        outDir: path.resolve(__dirname, 'dist'),
        emptyOutDir: true,
        rollupOptions: {
            input: getHtmlEntries(__dirname),
        },
    },
}));
