/* global
  Math, window
*/

/**
 *  This component handles the display of an infinite list of items as well as
 *  their sorting, filtering and any further loading.
 *
 *  It takes an initial list of items and once the user scrolls to the bottom of
 *  the list. The component adds a batch of new item ids, loads a batch of templates
 *  with those ids, fetch more items and then load these items into the DOM in
 *  smaller batches to replace the templates with the ids.
 *
 *  The above-mentioned behavior will continue until the number of the cached
 *  items is equal to or more than the total item count passed in as props
 *  to the component. The total item count should be the total amount of items
 *  available for retrieval from the database.
 *
 *  For performance purposes, this component does not keep any state. All the
 *  state properties are kept at the component object level. And the component
 *  will only re-render if forceUpdate is called. forceUpdate is called in three
 *  methods, reCacheItemElements, setLoadingStatus and addNewItems. This is
 *  similar to how Redux updates a component.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import {
  fetchAdditionalItems,
  insertWithinEvery,
  hasFilterChanged,
  hasSortingChanged,
  generateIds,
  stopItemReturnChain,
} from './generalHelpers'

const assignedIdKey = 'assignedId'
const loadpointBottomOffset = -200
const { arrayOf, object, func, string, bool, number, oneOfType } = React.PropTypes

class InfiniteList extends Component {
  constructor(props) {
    super(props)

    const { items: passedInItems } = props

    this.initializeProperties(passedInItems.length)
    this.addNewItems(passedInItems, null, true)
  }

  componentWillReceiveProps(nextProps) {
    const { filter: oldFilter, sort: oldSort, uniqueIdentifier } = this.props
    const { items, itemCountTotal, batchNumber, filter, sort } = nextProps
    const [ newlyOrganizedItems, oldOrganizedItems ] = [
      [filter, sort], [oldFilter, oldSort]
    ].map((organizers) => _.sortBy(_.filter(this.items, organizers[0]), organizers[1]))
    const [ newItemOrderRepresentation, oldItemOrderRepresentation ] = [
      newlyOrganizedItems, oldOrganizedItems
    ].map((items) => _.map(items, uniqueIdentifier).join(''))

    if (itemCountTotal !== this.props.itemCountTotal) {
      stopItemReturnChain()
      this.initializeProperties(items.length)
      this.addNewItems(items, nextProps)
      this.setLoadingStatus(false)
    } else if (newItemOrderRepresentation !== oldItemOrderRepresentation) {
      this.reCacheItemElements(newlyOrganizedItems, nextProps.renderItem)
    } else {
      return
    }
  }

  initializeProperties(passedInItemCount) {
    this.items = []
    this.cachedItemElements = []
    this.ids = []
    this.addBatchIds(passedInItemCount)
  }

  reCacheItemElements(organizedItems, renderItem) {
    this.cachedItemElements = organizedItems
      .map(item => renderItem(item[assignedIdKey], item))

    this.forceUpdate()
  }

  addNewItems(newItems, nextProps = null, isInitialization = false) {
    const { renderItem, sort, filter } = nextProps || this.props
    const { items: existingItems, cachedItemElements, ids, idPrefix } = this
    const { length: existingItemCount } = existingItems

    const stampedNewItems = newItems.map((item, index) => {
      const idIndex = existingItemCount + index

      return _.assign(
        {},
        _.set(item, assignedIdKey, ids[idIndex] || `${idPrefix}-${idIndex}`)
      )
    })

    const newElements = _
      .sortBy(_.filter(stampedNewItems, filter), sort)
      .map(item => renderItem(item[assignedIdKey], item))

    this.items = existingItems.concat(stampedNewItems)
    this.cachedItemElements = cachedItemElements.concat(newElements)
    if (!isInitialization) this.forceUpdate()
  }

  setLoadingStatus(status) {
    if (this.loading !== status) {
      this.loading = status
      this.forceUpdate()
    }
  }

  addBatchIds(numberToAdd) {
    const { batchNumber } = this.props
    const { ids = [], idPrefix, items: { length: itemCount } } = this

    this.idPrefix = idPrefix || Math.random().toString(36).substring(7)
    this.ids = ids.concat(generateIds(numberToAdd || batchNumber, idPrefix, itemCount))
  }

  onScrollToLoadPoint() {
    if (this.loading || this.items.length >= this.props.itemCountTotal) return

    this.addBatchIds()

    const { items: passedInItems, fetchItems, uniqueIdentifier, itemCountTotal } = this.props

    this.setLoadingStatus(true)

    fetchAdditionalItems({
      items: passedInItems,
      fetchItems,
      uniqueIdentifier,
      finishCallback: (newItems) => {
        this.props.fetchItemFinishCallback(newItems)
        this.setLoadingStatus(false)
      },
      successCallback: (newItems) => {
        const newItemCountTotal = this.items.length + newItems.length

        if (newItemCountTotal <= itemCountTotal) {
          this.addNewItems(newItems)
        } else {
          this.addNewItems(newItems.slice(0, newItemCountTotal - itemCountTotal - 1))
        }
      },
    })
  }

  render() {
    const { ids, items, cachedItemElements, items: { length: loadedCount } } = this
    const { renderItemTemplate, batchNumber } = this.props
    let templates

    if (this.loading) {
      templates = _.slice(ids, loadedCount, loadedCount + batchNumber).map(id => renderItemTemplate(id))
    } else {
      templates = []
    }

    return (
      <div>
        {cachedItemElements}
        {templates}
        <Waypoint
          onEnter={() => this.onScrollToLoadPoint()}
          scrollableAncestor={window}
          bottomOffset={loadpointBottomOffset}
          key={Math.random()}
        />
      </div>
    )
  }
}

InfiniteList.defaultProps = {
  items: [],
  itemCountTotal: 0,
  batchNumber: 50,
  fetchMoreItems: _.noop,
  renderItem: _.noop,
  renderItemTemplate: _.noop,
  filter: () => true,
  sort: () => true,
  uniqueIdentifier: false,
  fetchItemFinishCallback: _.noop,
}

InfiniteList.propTypes = {
  items: arrayOf(object),
  itemCountTotal: number,
  batchNumber: number,
  fetchItems: func,
  renderItem: func,
  renderItemTemplate: func,
  filter: func,
  sort: func,
  uniqueIdentifier: oneOfType([string, bool]),
  fetchItemFinishCallback: func,
}

export default InfiniteList
