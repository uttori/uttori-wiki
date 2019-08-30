/* eslint-disable no-unused-vars, no-empty-function, class-methods-use-this */
class SearchProvider {
  constructor() {
    this.searchTerms = {};
    this.index = null;
    this.documents = [];
  }

  setup(config) {
    return Promise.resolve([]);
  }

  search(term) {
    return Promise.resolve([
      {
        slug: `first-${term}`,
        score: 0.134,
        matchData: {
          metadata: {
            document: {
              title: {},
            },
          },
        },
      },
      {
        slug: `second-${term}`,
        score: 0.134,
        matchData: {
          metadata: {
            document: {
              title: {},
            },
          },
        },
      },
      {
        slug: `third-${term}`,
        score: 0.134,
        matchData: {
          metadata: {
            document: {
              title: {},
            },
          },
        },
      },
      {
        slug: 'example-title',
        score: 0.134,
        matchData: {
          metadata: {
            document: {
              title: {},
            },
          },
        },
      },
    ]);
  }

  internalSearch(term) {
    return this.search(term);
  }

  relatedDocuments(term) {
    return this.search(term);
  }

  indexAdd(_document) {}

  indexUpdate(_document) {}

  indexRemove(_document) {}

  updateTermCount(term) {}

  getPopularSearchTerms(count = 10) {}

  shouldAugment() {
    return true;
  }
}

module.exports = SearchProvider;
