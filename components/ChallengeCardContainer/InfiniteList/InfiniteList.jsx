import _ from 'lodash';
import React, { Component } from 'react';
import Waypoint from 'react-waypoint';
import {
  fetchAdditionalItems,
  insertWithinEvery,
  hasFilterChanged,
  hasSortingChanged,
  addNewIds,
} from './generalHelpers'

const assignedIdKey = 'assignedId'
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
    const { items: previousItems } = this

    if (itemCountTotal !== this.props.itemCountTotal) {
      this.initializeProperties(items.length)
      this.addNewItems(items, nextProps)
    } else if (
      hasFilterChanged(items, oldFilter, filter)
      || hasSortingChanged(items, uniqueIdentifier, oldSort, sort)
    ) {
      this.reCacheItemElements(sort, filter, nextProps.renderItem)
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

  reCacheItemElements(sort, filter, renderItem) {
    this.cachedItemElements = _
      .sortBy(_.filter(this.items, filter), sort)
      .map(item => renderItem(item[assignedIdKey], item))

    this.forceUpdate()
  }

  addNewItems(newItems, nextProps = null, isInitialization = false) {
    const { renderItem, sort, filter } = nextProps || this.props
    const { items: existingItems, cachedItemElements, ids, idPrefix } = this
    const { length: existingItemCount } = existingItems

    const stampedNewItems = newItems.map((item, index) => {
      const idIndex = existingItemCount + index

      return _.assign({}, _.set(item, assignedIdKey, ids[idIndex], `${idPrefix}-${idIndex}`))
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
    this.ids = ids.concat(addNewIds(numberToAdd || batchNumber, idPrefix, itemCount))
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
      finishCallback: () => this.setLoadingStatus(false),
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
          bottomOffset={-200}
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
}

export default InfiniteList
