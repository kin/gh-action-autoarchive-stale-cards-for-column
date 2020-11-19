# gh-action-autoarchive-stale-cards-for-column
This action allows the archiving of stale project cards in a given Github Project column. Helpful especially for cleaning up columns like "Done"

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
## Required Inputs
- `access-token`: Access token for repository. Use `"{{ secrets.GITHUB_TOKEN }}"` to prevent leaking secrets. This may require setting up a token with increased privileges. The token must have `repo` privileges.
- `repository`: String with target repo name (e.g. 'kin/gh-action-autoarchive-issues-for-column' should be 'gh-action-autoarchive-issues-for-column' here)
- `repository-owner`: String with repo owner name only (e.g. 'kin/gh-action-autoarchive-issues-for-column' should be 'kin' here)
- `project-name`: String with name of project the target column is in (case insensitive)
- `column-to-archive`: String with target column name (case insensitive)
- `days-old`: Integer for how many days must have elapsed since the last time each card was touched before archiving

## Contribution
To cotnribute, please open an Issue on the action repo: https://github.com/kin/gh-action-autoarchive-issues-for-column to discuss bugs/modifications.
