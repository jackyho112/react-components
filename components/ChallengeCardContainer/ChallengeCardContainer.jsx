/* global
  sessionStorage, window
*/

/**
 *  This component is responsbile for displaying and handling the interaction
 *  of challenges contained in different categories.
 *
 *  It will handle the expansion of each cateogry container to see more challenges
 *  than the initial number which is 10 as well as the further expansion of the container.
 *  if the user scrolls down to the last challenge in the state and there are
 *  more challenges, additional 50 challenges will be fetched.
 *
 *  It will also handle sorting in each cateogry container and store the setting
 *  in sessionStorage. It will load the setting if it exists at the begining.
 *
 *  It loads from files, filters.js and sortingFunctionStore.js, to know the filter
 *  categories and their information as well as all the sorting options for each
 *  filter category.
 */

import _ from 'lodash';
import React, { Component } from 'react';
import SortingSelectBar from './SortingSelectBar/SortingSelectBar';
import InfiniteList from './InfiniteList/InfiniteList';
import defaultFilters from './challengeFilters';
import defaultSortingFunctionStore from './sortingFunctionStore';
import {
  getChallengeCardPlaceholder,
  getChallengeCard,
  getExpandBucketButton,
} from './childComponentConstructorHelpers'
import {
  getFilterChallengesStore,
  getFilterSortingStore,
  getFilterTotalCountStore,
} from './storeConstructorHelpers'
import {
  findFilterByName,
  filterFilterChallengesStore,
  getFetchChallengesFunc,
} from './generalHelpers';
import './ChallengeCardContainer.scss';

const { arrayOf, object, shape, func, string, bool, oneOfType } = React.PropTypes;
const initialNumberToShow = 10;
const batchLoadNumber = 50;
const initialPageIndex = 2;
const challengeUniqueIdentifier = 'challengeId';

class ChallengeCardContainer extends Component {
  constructor(props) {
    super(props);
    const { challenges, filters, currentFilterName, expanded } = props;
    let userSessionFilterSortingStore;

    if (sessionStorage && sessionStorage.challengeFilterSortingStore) {
      userSessionFilterSortingStore = JSON.parse(sessionStorage.challengeFilterSortingStore);
    }

    this.state = {
      filterChallengesStore: getFilterChallengesStore(filters, challenges),
      currentFilter: findFilterByName(currentFilterName, filters),
      filterSortingStore: getFilterSortingStore(filters, userSessionFilterSortingStore),
      sortingFunctionStore: defaultSortingFunctionStore,
      filterTotalCountStore: {},
      expanded,
    };

    getFilterTotalCountStore().then((filterTotalCountStore) => this.setState({ filterTotalCountStore }))
  }

  componentWillReceiveProps(nextProps) {
    const { challenges, filters, currentFilterName, expanded } = nextProps;
    const { filterSortingStore } = this.state;

    this.setState({
      filterChallengesStore: getFilterChallengesStore(filters, challenges),
      currentFilter: findFilterByName(currentFilterName, filters),
      filterSortingStore: getFilterSortingStore(filters, filterSortingStore),
      expanded,
    });
  }

  onExpandFilterResult(filterName) {
    this.setState({
      currentFilter: findFilterByName(filterName, this.props.filters),
      expanded: true,
    }, this.props.onExpandFilterResult);
  }

  onSortingSelect(filterName, sortingOptionName) {
    const filterSortingStore = _.assign(
      {},
      this.state.filterSortingStore,
      { [filterName]: sortingOptionName },
    );
    sessionStorage.challengeFilterSortingStore = JSON.stringify(filterSortingStore);

    this.setState({ filterSortingStore });
  }

  render() {
    const { additionalFilter, filters, fetchCallback } = this.props;
    const {
      currentFilter,
      expanded,
      filterSortingStore,
      sortingFunctionStore,
      filterTotalCountStore,
    } = this.state;

    const filterChallengesStore = filterFilterChallengesStore(
      this.state.filterChallengesStore,
      currentFilter
    );

    return (
      <div className="challengeCardContainer">
        {
          Object.keys(filterChallengesStore).map((filterName) => {
            let expansionButtion
            let challenges = filterChallengesStore[filterName]

            const challengeCountTotal = filterTotalCountStore[filterName]
            const trimmedFilterName = filterName.replace(/\s+/g, '-').toLowerCase();
            const filter = findFilterByName(filterName, filters);
            const { sortingOptions } = filter;
            const { length: challengeNumber } = challenges;

            if (!expanded && challengeNumber > initialNumberToShow) {
              challenges = challenges.slice(0, initialNumberToShow);

              expansionButtion = getExpandBucketButton(
                filterChallengesStore[filterName].length - 10,
                () => this.onExpandFilterResult(filterName)
              );
            }

            return (
              <div className="category-challenges-container example-lg" key={`${trimmedFilterName}-container`}>
                <SortingSelectBar
                  sortingOptions={sortingOptions}
                  filterName={filterName}
                  onSortingSelect={optionName => this.onSortingSelect(filterName, optionName)}
                  value={filterSortingStore[filterName]}
                  key={`${trimmedFilterName}-sorting-bar`}
                />
                <InfiniteList
                  items={challenges}
                  itemCountTotal={
                    expanded
                    ? challengeCountTotal || challenges.length
                    : challenges.length
                  }
                  renderItem={_.partialRight(
                    getChallengeCard,
                    tag => this.props.onTechTagClicked(tag)
                  )}
                  renderItemTemplate={getChallengeCardPlaceholder}
                  fetchItems={
                    getFetchChallengesFunc(filter.getApiUrl, initialPageIndex, fetchCallback)
                  }
                  batchNumber={batchLoadNumber}
                  filter={additionalFilter}
                  sort={sortingFunctionStore[filterSortingStore[filterName]]}
                  uniqueIdentifier={challengeUniqueIdentifier}
                />
                {expansionButtion}
              </div>
            );
          })
        }
      </div>
    );
  }
}

ChallengeCardContainer.defaultProps = {
  onTechTagClicked: _.noop,
  onExpandFilterResult: _.noop,
  filters: defaultFilters,
  additionalFilter() {
    return true;
  },
  currentFilterName: '',
  challenges: [],
  expanded: false,
  fetchCallback: _.noop,
};

ChallengeCardContainer.propTypes = {
  onTechTagClicked: func,
  onExpandFilterResult: func,
  additionalFilter: func,
  challenges: arrayOf(object),
  currentFilterName: string,
  filters: arrayOf(shape({
    check: func,
    name: string,
    getApiUrl: func,
    sortingOptions: arrayOf(string),
    allIncluded: bool,
    info: object,
  })),
  expanded: oneOfType([bool, string]),
  fetchCallback: func,
};

export default ChallengeCardContainer;
