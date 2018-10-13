const DetailPage = function DetailPage($scope) {
  this.$tocSelector = $scope.find('.toc');
  this.$tocContainer = $scope;
  this.$tocSelectors = $scope.find('h2, h3');

  this.init();
};
DetailPage.constructor = DetailPage;
DetailPage.prototype = {
  init() {
    // build TOC
    if (this.$tocSelector.length > 0 && this.$tocContainer.length > 0 && this.$tocSelectors.length > 0) {
      this.$tocSelector.show();
      this.$tocSelector.toc({
        container: '.js-page',
        selectors: 'h2, h3',
      });
    }
    // highlight code
    hljs.initHighlightingOnLoad();
  },
};

$(() => {
  const page = new DetailPage($('.js-page'));
});
