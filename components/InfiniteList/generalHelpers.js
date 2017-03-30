/* global
  Promise, clearTimeout
*/

import _ from 'lodash';

const fetchPromise = Promise.resolve();
const loadBatchSize = 1;
const timeInterval = 1000 * (loadBatchSize / 100);
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
          setTimeout(() => finishCallback(receivedItems), timeInterval);
          return;
        }

        lastItemReturnTimeout = setTimeout(() => {
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

// clear item batch return timeout and stop the chain
export function stopItemReturnChain() {
  clearTimeout(lastItemReturnTimeout);
}

export function generateIds(numberToAdd, prefix, currentIndex) {
  return _.times(
    numberToAdd,
    num => `${prefix}-${currentIndex + num}`,
  );
}
