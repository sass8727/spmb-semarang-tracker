name: SPMB Scraper

on:
  workflow_dispatch:
  schedule:
    - cron: "*/30 * * * *"

permissions:
  contents: write

jobs:
  scrape:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Scraper
        run: node scripts/scraper.js

      - name: Commit Data
        run: |
          git config user.name "github-actions"
          git config user.email "actions@github.com"

          git add data/latest.json

          git diff --staged --quiet || git commit -m "Update data"
          git push
