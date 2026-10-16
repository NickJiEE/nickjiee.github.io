# Nick Ji — Portfolio

A buildless portfolio for GitHub Pages, written in HTML, CSS, and JavaScript.

## Preview

Open `index.html` in a browser for the interactive entrance, or `main.html` for the homepage. For a local HTTP preview, run `python -m http.server 8000` in this directory and visit `http://localhost:8000`.

## Structure

- `index.html` and `js/intro.js`: interactive network entrance, pause control, and reduced-motion support.
- `main.html`: featured work, current research, design focus, and FAQ.
- `projects.html`: filterable project index.
- `project-*.html`: individual project descriptions and images.
- `about.html`: biography, grouped skills, experience, and education.
- `contact.html`: direct email and social links.
- `css/style.css`: shared responsive design.
- `js/site.js`: mobile navigation, filters, image dialogs, and scroll reveals.
- `assets/images/`: existing portfolio assets.
- `intro_backup/`: pre-existing archived entrance experiments.

No dependencies or build step are required. Shared navigation and footer markup is repeated in each page; update each copy when changing links. New projects need both a detail page and a card in `projects.html`.

Project images support click, Enter, or Space to enlarge, and Escape to close. Content and navigation links remain available without JavaScript. Publishing is handled by the repository's existing GitHub Pages configuration.
