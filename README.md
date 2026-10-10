# RISHABH12005.github.io

Source repository for the static website hosted at [rishabh12005.me](https://rishabh12005.me).

## Overview

This repository contains a responsive static website built with HTML, CSS, and JavaScript. It includes custom styling, responsive layouts, navigation, animations, and interactive sections. This README documents the repository and how to run and deploy the site; it is not a personal portfolio summary.

## Repository Structure

```text
.
├── assets/       # CSS, JavaScript, images, and other static assets
├── index.html    # Main page and website content
├── _config.yml   # Site metadata and URL configuration
├── CNAME         # Custom-domain configuration
├── vercel.json   # Vercel static deployment configuration
├── LICENSE       # License terms
└── README.md     # Repository documentation
```

## Built With

- HTML5
- CSS3
- JavaScript
- Google Fonts (Inter and Space Grotesk)
- Git and GitHub
- Vercel / GitHub Pages configuration

## Run Locally

No dependency installation or build step is required for this static site.

### Open the file directly

```powershell
git clone https://github.com/RISHABH12005/RISHABH12005.github.io.git
cd RISHABH12005.github.io
start .\index.html
```

### Run a local HTTP server

With Python installed:

```powershell
python -m http.server 8000
```

Or with Node.js:

```powershell
npx --yes http-server -p 8000
```

Then visit http://localhost:8000. Press Ctrl+C in the terminal to stop the server.

## Deployment

### Vercel

The repository includes `vercel.json` for static deployment, with the repository root as the output directory.

1. Import this GitHub repository into Vercel.
2. Confirm the project is configured as a static site and the output directory is the repository root.
3. Deploy the project and configure a custom domain if needed.

### GitHub Pages

The repository also contains `CNAME` and `_config.yml` for GitHub Pages-related configuration. Check the repository's Settings > Pages to confirm the publishing source and custom-domain settings.

## Customize

- Edit page content in `index.html`.
- Update styles in `assets/css/`.
- Update client-side behavior in `assets/js/`.
- Review `_config.yml`, `CNAME`, and `vercel.json` when changing hosting or domain settings.

## License

See [LICENSE](LICENSE) for license terms.

---

Repository: [RISHABH12005/RISHABH12005.github.io](https://github.com/RISHABH12005/RISHABH12005.github.io)  
Live site: [rishabh12005.me](https://rishabh12005.me)
