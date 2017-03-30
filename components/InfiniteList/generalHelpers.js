/* global
  Promise, clearTimeout
*/

import _ from 'lodash';

const fetchPromise = Promise.resolve();
const loadBatchSize = 1;
let lastItemReturnTimeout;

// fetch items and then return them in batches
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
          setTimeout(() => finishCallback(receivedItems));
          return;
        }

        lastItemReturnTimeout = setTimeout(() => {
          successCallback(receivedItems.slice(
            currentLoadedItemIndex,
            currentLoadedItemIndex + loadBatchSize,
          ));

          returnReceivedItems(currentLoadedItemIndex + loadBatchSize);
        });
      }

      returnReceivedItems();
    }),
  );
}

// clear item batch return timeout and stop the chain
export function stopNewItemReturnChain() {
  clearTimeout(lastItemReturnTimeout);
}

export function generateIds(numberToAdd, prefix, currentIndex) {
  return _.times(numberToAdd, num => `${prefix}-${currentIndex + num}`);
}

export function organizeItems(items, filter, sort) {
  return _.sortBy(_.filter(items, filter), sort);
}
