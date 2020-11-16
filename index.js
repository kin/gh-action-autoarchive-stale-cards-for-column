const core = require('@actions/core');
const github = require('@actions/github');
const { graphql } = require("@octokit/graphql");
const isBefore = require('date-fns/isBefore')
const sub = require('date-fns/sub')

const fetchCardsQuery = `query projectCards($owner: String!, $repo: String!, $projectName: String!, $cursor: String!) {
                           repository(owner: $owner, name: $repo) {
                             projects(search: $projectName, last: 1) {
                               edges {
                                 node {
                                   columns(first: 20) {
                                     edges {
                                       node {
                                         name
                                         cards(first: 50, after: $cursor, archivedStates: NOT_ARCHIVED) {
                                           edges {
                                             node {
                                               id
                                               updatedAt
                                             }
                                             cursor
                                           }
                                           pageInfo {
                                             endCursor
                                             hasNextPage
                                           }
                                         }
                                       }
                                     }
                                   }
                                 }
                               }
                             }
                           }
                         }`

const archiveCardQuery = `mutation archiveCards($cardId: String!, $isArchived: Boolean = true) {
                             updateProjectCard(input:{projectCardId: $cardId, isArchived: $isArchived}) {
                               projectCard {
                                 id
                               }
                             }
                           }`

async function fetchCards(repoOwner, repo, projectName, currentCursor, accessToken) {
  return graphql(fetchCardsQuery, {
    owner: repoOwner,
    repo: repo,
    projectName: projectName,
    cursor: currentCursor,
    headers: {
      authorization: `bearer ${accessToken}`,
    }
  })
}


const dateifyCard = (card) => {
  const updatedAt = new Date(card.updatedAt)
  return { id: card.id, updatedAt: updatedAt }
}

async function fetchCardInfo(repoOwner, repo, projectName, accessToken, columnToArchive) {
  try {
    const projectCardIdsWithDate = []
    let currentCursor = ''
    let nextPage = true

    while(nextPage) {
      let projectCards = await fetchCards(repoOwner, repo, projectName, currentCursor, accessToken)
      projectCards = projectCards.repository.projects.edges[0].node.columns.edges.find(edge => edge.node.name.toLowerCase() === columnToArchive.toLowerCase()).node.cards
      projectCardIdsWithDate.push(...projectCards.edges.flatMap(card => card.node).map(dateifyCard))

      currentCursor = projectCards.pageInfo.endCursor
      nextPage = projectCards.pageInfo.hasNextPage
    }

    return projectCardIdsWithDate
  }
  catch(e) {
    console.log('fetchCardInfo error: ', e)
    return []
  }
}

const run = async () => {
  try {
    const accessToken = core.getInput('access-token')
    const columnToArchive = core.getInput('column-to-archive')
    const repoOwner = core.getInput('repository-owner')
    const repo = core.getInput('repository')
    const projectName = core.getInput('project-name')
    const payload = JSON.stringify(github.context.payload, undefined, 2)

    const daysOld = core.getInput('days-old');
    const cutoffDate = sub(new Date(), { days: daysOld })

    console.log(`Archiving all cards that have been untouched for ${daysOld} days from column ${columnToArchive}!`);

    console.log(`The event payload: ${payload}`);

    const projectCardIdsWithDate = await fetchCardInfo(repoOwner, repo, projectName, accessToken, columnToArchive)

    // Filter by updated at date
    const cardIdsToArchive = projectCardIdsWithDate
          .filter(card => isBefore(card.updatedAt, cutoffDate))
          .map(node => node.id)

    // Archive those - https://docs.github.com/en/free-pro-team@latest/rest/reference/projects#update-an-existing-project-card
    let archivedCards = 0

    cardIdsToArchive.forEach(async (id) => {
      try {
        await graphql(archiveCardQuery, {
                cardId: id,
                headers: {
                  authorization: `bearer ${accessToken}`,
                },
        })
        archivedCards += 1
      }
      catch(e) {
        console.log('archiveCard error: ', e)
        return false
      }
    })

    console.log(`Archived ${archivedCards} cards`)
  } catch (error) {
    core.setFailed(error.message);
  }

}

run()
