/* global
  document, fetch, Promise
*/

import _ from 'lodash';

export function filterFilterChallengesStore(filterChallengesStore, currentFilter) {
  const allFilters = [
    (store) => {
      if (currentFilter && !currentFilter.allIncluded) {
        return _.pick(store, [currentFilter.name]);
      }

      return store;
    },
    _.partialRight(_.pickBy, challenges => !_.isEmpty(challenges)),
  ];

  return _.flow(allFilters)(_.assign({}, filterChallengesStore));
}

export function findFilterByName(filterName, filters) {
  const foundfilter = _.find(filters, filter => filter.name === filterName);

  if (foundfilter) {
    return _.assign({}, foundfilter);
  }
  return {};
}

function formatChallenge(challenge) {
  const formattedChallenge = _.assign({}, challenge);

  formattedChallenge.communities = new Set([formattedChallenge.challengeCommunity]);
  formattedChallenge.track = challenge.challengeCommunity.toUpperCase();
  formattedChallenge.subTrack = challenge.challengeType.toUpperCase().split(' ').join('_');

  return formattedChallenge;
}

export function getFetchChallengesFunc(getUrl, initialPageIndex, fetchCallback) {
  let pageIndex = initialPageIndex;

  return () => {
    pageIndex += 1;

    return fetch(getUrl(pageIndex))
      .then(response => response.json())
      .then((responseJson) => {
        const formattedChallenge = responseJson.data.map(formatChallenge);
        fetchCallback(formattedChallenge);
        return formattedChallenge;
      });
  };
}
