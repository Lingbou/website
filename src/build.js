const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'content');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const OUTPUT_HTML = path.join(ROOT_DIR, 'index.html');

const ARCH_SVG = '<svg viewBox="0 0 24 24" width="1.15em" height="1.15em" fill="currentColor" style="display:inline-block;vertical-align:-0.15em;margin-right:0.25em;"><path d="M11.39.605C10.376 3.092 9.764 4.72 8.635 7.132c.693.734 1.543 1.589 2.923 2.554-1.484-.61-2.496-1.224-3.252-1.86C6.86 10.842 4.596 15.138 0 23.395c3.612-2.085 6.412-3.37 9.021-3.862a6.61 6.61 0 01-.171-1.547l.003-.115c.058-2.315 1.261-4.095 2.687-3.973 1.426.12 2.534 2.096 2.478 4.409a6.52 6.52 0 01-.146 1.243c2.58.505 5.352 1.787 8.914 3.844-.702-1.293-1.33-2.459-1.929-3.57-.943-.73-1.926-1.682-3.933-2.713 1.38.359 2.367.772 3.137 1.234-6.09-11.334-6.582-12.84-8.67-17.74z"/></svg>';

function parseMarkdown(mdText) {
  const blocks = mdText.split(/\r?\n\r?\n+/).map(b => b.trim()).filter(Boolean);
  const htmlParts = [];

  for (const block of blocks) {
    if (block.startsWith('<img') || block.startsWith('<div') || block.startsWith('<details')) {
      htmlParts.push(block);
      continue;
    }

    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        let text = currentParagraph.join('<br/>\n        ');
        text = text
          .replace(/~~(.*?)~~/g, '<strike>$1</strike>')
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
        htmlParts.push(`<p>${text}</p>`);
        currentParagraph = [];
      }
    };

    for (const line of lines) {
      if (/^#+\s+/.test(line)) {
        flushParagraph();
        const headingText = line.replace(/^#+\s+/, '').trim();
        htmlParts.push(`<p style="border-left:3px solid #828486">${headingText}</p>`);
      } else {
        currentParagraph.push(line);
      }
    }
    flushParagraph();
  }

  return htmlParts.join('\n\n        ');
}

function renderLabelGroups(groups) {
  return groups.map((g, idx) => {
    const itemsHtml = g.items.map(it => {
      if (it.svg === 'arch') {
        return `<span class="label">${ARCH_SVG}${it.label} </span>`;
      }
      const titleAttr = it.title ? ` title="${it.title}"` : '';
      return `<span class="label"${titleAttr}><i aria-hidden="true" class="${it.icon}"></i> ${it.label} </span>`;
    }).join('\n        ');

    return `<div class="label-group">\n        <span class="header">${g.name}</span>\n        ${itemsHtml}\n      </div>`;
  }).join('\n      <br/>\n      ');
}

function renderIdentityList(items) {
  return items.map(it => {
    return `<li><a href="${it.url}" target="_blank"><i aria-hidden="true" class="${it.icon}"></i> <span class="label">${it.label}</span> <span class="fake-link">${it.value}</span></a></li>`;
  }).join('\n            ');
}

function build() {
  const startTime = Date.now();
  console.log('⚡ Building website from content and templates...');

  const template = fs.readFileSync(path.join(SRC_DIR, 'template.html'), 'utf8');
  const siteConfig = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, 'site.json'), 'utf8'));
  const aboutMd = fs.readFileSync(path.join(CONTENT_DIR, 'about.md'), 'utf8');
  const gamesMd = fs.readFileSync(path.join(CONTENT_DIR, 'games.md'), 'utf8');

  const aboutContent = parseMarkdown(aboutMd);
  const gamesContent = parseMarkdown(gamesMd);
  const labelGroupsHtml = renderLabelGroups(siteConfig.groups);
  const linksHtml = renderIdentityList(siteConfig.links);
  const projectsHtml = renderIdentityList(siteConfig.projects);
  const profilesHtml = renderIdentityList(siteConfig.profiles);

  let output = template
    .replace('{{title}}', siteConfig.title)
    .replace('{{avatar}}', siteConfig.avatar)
    .replace('{{name}}', siteConfig.name)
    .replace('{{label_groups}}', labelGroupsHtml)
    .replace('{{about_content}}', aboutContent)
    .replace('{{links}}', linksHtml)
    .replace('{{projects}}', projectsHtml)
    .replace('{{games_content}}', gamesContent)
    .replace('{{profiles}}', profilesHtml)
    .replace('{{copyright}}', siteConfig.copyright);

  fs.writeFileSync(OUTPUT_HTML, output, 'utf8');
  console.log(`✓ index.html generated successfully in ${Date.now() - startTime}ms`);
}

build();

if (process.argv.includes('--watch')) {
  console.log('👀 Watching content/ and src/ for changes...');
  const watchPaths = [CONTENT_DIR, path.join(SRC_DIR, 'template.html')];
  watchPaths.forEach(target => {
    fs.watch(target, { recursive: true }, (eventType, filename) => {
      if (filename) {
        console.log(`\n[Change detected in ${filename}] Rebuilding...`);
        try {
          build();
        } catch (err) {
          console.error('Build error:', err.message);
        }
      }
    });
  });
}