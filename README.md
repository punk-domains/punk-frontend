# Klima Name Service frontend

KNS - Klima Name Service

https://www.kns.earth

## Quickstart

```bash
npm install
npm run dev
```

## Branches & deployment

- **Important:** Never commit directly to the `main` branch.
- Development is done on the `develop` branch (or temporary branches which then merge with the `develop` branch).
- Deployment: When you want to make deployment to the production server (www.kns.earth), merge `develop` into the `main` branch. A CI/CD system on GitHub (GitHub Actions) will automatically build and deploy the new code to GitHub Pages.