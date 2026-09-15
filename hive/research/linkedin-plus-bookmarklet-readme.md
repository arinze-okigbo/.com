
# LinkedIn+ Bookmarklet

A clean, ethical, portfolio-ready bookmarklet that demonstrates JavaScript, DOM scraping, Shadow DOM UI, and browser tooling craftsmanship.

[![GitHub stars](https://img.shields.io/github/stars/arinze-okigbo/linkedin-plus-bookmarklet?style=for-the-badge)](https://github.com/arinze-okigbo/linkedin-plus-bookmarklet/stargazers)
[![LinkedIn 2026 Ready](https://img.shields.io/badge/LinkedIn-2026%20Ready-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## Features

- Async IIFE bookmarklet architecture for clean execution flow
- DOM scraping utilities for profile/page data extraction
- Shadow DOM based UI layer to reduce style collisions
- Lightweight, one-click installation flow
- Source + minified distribution split for maintainability
- Explicit legal and ethical boundaries

---

## Legal + Ethical Warning

> This tool is for personal productivity, experimentation, and educational use.
>
> You are responsible for complying with:
> - LinkedIn Terms of Service
> - Applicable privacy/data protection laws
> - Your local regulations and organizational policies
>
> Do **not** use this project for unauthorized automation, mass scraping, data resale, spam, or abusive behavior.

---

## 30-Second Install

1. Open this repository and copy the full contents of `bookmarklet.url`.
2. Create a new bookmark in your browser.
3. Set:
	- **Name**: `LinkedIn+`
	- **URL**: paste the `javascript:` one-liner
4. Visit LinkedIn and click the bookmark.

Done. The bookmarklet runs directly in-page.

---


## Development

### Edit source

Modify:

- `src/main.js`

### Minify to production one-liner

Using Terser:

```bash
npm install --save-dev terser
npx terser src/main.js -c -m -o dist/bookmarklet.min.js
```

### Generate bookmarklet URL file

Wrap minified output with `javascript:` and place it into:

- `bookmarklet.url`

---

## Project Structure

```text
src/main.js                # readable source
dist/bookmarklet.min.js    # minified one-liner build
docs/demo.gif              # demo placeholder
docs/screenshots/          # static screenshots
bookmarklet.url            # final javascript: one-liner
```

---

## Limitations

- LinkedIn DOM changes can break selectors over time
- Bookmarklets may be restricted by browser security contexts
- No server-side persistence in this repo by design
- Intended for manual, user-triggered execution only

---

## Contributing

PRs are welcome for:

- Selector resilience improvements
- UI/UX polish in shadow-root panel
- Better error handling and compatibility notes
- Documentation and onboarding upgrades

Please keep contributions aligned with ethical usage and legal compliance.

---

## License

MIT License. See [LICENSE](LICENSE).
