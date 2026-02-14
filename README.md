# ThesisAnalyzer

Controlled academic data analysis platform with multi-tier access. Built with Next.js (App Router), React 19, and TypeScript.

## Features

- **Analysis types:** Statistical, Regression, Correlation, Clustering, Time-series, Text-analysis.
- **Applications:** Python, R, Excel, MATLAB, SPSS, NLTK (options filtered by analysis type).
- **Predefined analyses:** Simple percentage (with Total row and Cumulative %), descriptive statistics, Pearson correlation, one-sample t-test, chi-square, linear regression, k-means clustering, time-series trend, word frequency. Analyses offered and run are restricted to the selected type and application.
- **Data input:** Manual paste, file upload (CSV, XLSX, DOCX, TXT; 20MB limit), or Excel-style spreadsheet grid.
- **Report:** Download .docx (method, tables, charts/figures, interpretation, effect sizes, insights, recommendations) and .txt.
- **Auth:** Role-based (Personal, Researcher, Institutional, Admin) with localStorage persistence; routes for login, register, dashboard, history, pricing, payment, subscription, admin, error, advanced mode.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — Development server
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Project structure

- `src/app/` — Next.js App Router pages (analysis, auth, dashboard, history, etc.)
- `src/components/` — React components (Header, Footer, analysis selectors, DataInput, AnalysisResults, AnalysisErrorBoundary, etc.)
- `src/contexts/` — AuthContext
- `src/utils/` — analysisEngine, reportDocx, fileParser, csvUtils
- `src/types/` — Shared types (UserRole, AnalysisSnapshot, etc.)
- `docs/` — PRD, SRS, ARCHITECTURE, ERD, UIUX_DESIGN, DESIGN_CODE_ANALYSIS (in repo root `docs/`)

## Documentation

See `docs/` in the repository root: PRD, SRS, ARCHITECTURE, ERD, UIUX_DESIGN, and DESIGN_CODE_ANALYSIS.md for full product and design documentation.
