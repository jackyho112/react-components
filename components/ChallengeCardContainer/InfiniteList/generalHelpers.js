/* global
  Promise
*/

import _ from 'lodash';

const fetchPromise = Promise.resolve();
const loadBatchSize = 1;
const timeInterval = 1000 * (loadBatchSize / 100);
export function fetchAdditionalItems({
  items,
  itemUniqueIdentifier,
  fetchItems,
  successCallback,
  finishCallback,
}) {
  fetchPromise.then(
    fetchItems().then((receivedItems) => {
      let newItems = _.concat([], items, receivedItems);
      if (itemUniqueIdentifier) newItems = _.uniqBy(newItems, itemUniqueIdentifier);
      const uniqueReceivedItems = _.slice(newItems, items.length - 1);

      function returnReceivedItems(currentLoadedItemIndex = 0) {
        if (currentLoadedItemIndex >= uniqueReceivedItems.length) {
          setTimeout(() => finishCallback(), timeInterval);
          return;
        }

        setTimeout(() => {
          successCallback(receivedItems.slice(
            currentLoadedItemIndex,
            currentLoadedItemIndex + loadBatchSize,
          ));

          returnReceivedItems(currentLoadedItemIndex + loadBatchSize);
        }, timeInterval);
      }

      returnReceivedItems();
    }),
  );
}

export function hasFilterChanged(collection, filterA, filterB) {
  const [filteredCollectionA, filteredCollectionB] = [filterA, filterB]
    .map(filter => _.filter(collection, filter));

  return filteredCollectionA.length !== filteredCollectionB.length;
}

export function hasSortingChanged(collection, uniqueIdentifier, sortA, sortB) {
  const [sortedStringA, sortedStringB] = [sortA, sortB].map(sort => _.map(_.sortBy(collection, sort), uniqueIdentifier).join(''));

  return sortedStringA !== sortedStringB;
}

export function addNewIds(numberToAdd, prefix, currentIndex) {
  return _.times(
    numberToAdd,
    num => `${prefix}-${currentIndex + num}`,
  );
}
