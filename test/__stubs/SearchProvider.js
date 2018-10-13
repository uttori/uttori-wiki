class SearchProvider {
  constructor() {
    this.searchTerms = {};
    this.index = null;
    this.documents = [];
  }

  setup(uttori) {}

  search(term) {
    return [
      {
        ref: `first-${term}`,
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
        ref: `second-${term}`,
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
        ref: `third-${term}`,
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
        ref: 'example-title',
        score: 0.134,
        matchData: {
          metadata: {
            document: {
              title: {},
            },
          },
        },
      },
    ];
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
}

module.exports = SearchProvider;
