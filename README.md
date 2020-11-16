# gh-action-autoarchive-stale-cards-for-column
This action allows the archiving of stale project cards in a given Github Project column. Helpful especially for cleaning up columns like "Done"

## Use
- Create a .yml workflow in `.github/workflows` directory of the repo that will run the action.
- Follow the below template to use the action and make sure to fill out all required environment variables.

## Workflow Template
```
name: Archive Stale Done Cards

on:
  # Any trigger is usable here. This will run the action every day at 5AM.
  schedule:
    - cron: '0 5 * * *'

jobs:
  autoarchive-cards-job:
    runs-on: ubuntu-latest
    name: Autoarchive Done Column Cards
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: The autoarchive action
        uses: kin/gh-action-autoarchive-stale-cards-for-column@v1.0
        id: archive
        with:
          # Required: personal access token with permissions to archive cards
          access-token: "${{ secrets.GITHUB_TOKEN }}"

          # Required: String with repo name (e.g. 'kin/gh-action-autoarchive-issues-for-column' should be 'gh-action-autoarchive-issues-for-column' here)
          repository: 'my-repo-name'

          # Required: String with owner name only (e.g. 'kin/gh-action-autoarchive-issues-for-column' should be 'kin' here)
          repository-owner: 'the-owner'

          # Required: String with name of project the column is in (case insensitive)
          project-name: 'My Project'

          # Required: String with column name for (case insensitive)
          column-to-archive: 'Done'

          # Required: Integer for how many days must have elapsed since the last time this card was touched
          days-old: 5
```

## Contribution
To cotnribute, please open an Issue on the action repo: https://github.com/kin/gh-action-autoarchive-issues-for-column to discuss bugs/modifications.
