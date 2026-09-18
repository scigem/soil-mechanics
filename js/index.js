import '../css/index.css';

const pageSources = import.meta.glob('../*.html', {
    eager: true,
    import: 'default',
    query: '?raw',
});

const toolGrid = document.querySelector('#tool-grid');

const extractFirstMatch = (source, pattern) => {
    const match = source.match(pattern);
    return match ? match[1].replace(/\s+/g, ' ').trim() : '';
};

const toSentenceCase = (value) => value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const pages = Object.entries(pageSources)
    .map(([modulePath, source]) => {
        const fileName = modulePath.split('/').pop();

        if (!fileName || fileName === 'index.html') {
            return null;
        }

        const title = extractFirstMatch(source, /<h1[^>]*>([\s\S]*?)<\/h1>/i)
            || extractFirstMatch(source, /<title>([\s\S]*?)<\/title>/i)
            || toSentenceCase(fileName.replace(/\.html$/, ''));

        return {
            fileName,
            href: `./${fileName}`,
            title: title.replace(/<[^>]+>/g, ''),
        };
    })
    .filter(Boolean)
    .sort((left, right) => left.title.localeCompare(right.title));

toolGrid.replaceChildren(...pages.map((page, index) => {
    const card = document.createElement('a');
    card.className = 'tool-card';
    card.href = page.href;

    const pageNumber = document.createElement('span');
    pageNumber.className = 'tool-card-index';
    pageNumber.textContent = `Tool ${String(index + 1).padStart(2, '0')}`;

    const title = document.createElement('h3');
    title.textContent = page.title;

    const destination = document.createElement('p');
    destination.textContent = page.fileName;

    card.append(pageNumber, title, destination);
    return card;
}));