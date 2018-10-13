const SELECTORS = {
  MARKDOWN_INPUT: 'textarea',
  FORM: 'form',
  TITLE_INPUT: '#title',
  DELETE: '.js-delete',
  DROPZONE: '.js-dropzone',
};

// Page View Class for the Document Edit page.
const EditPage = function EditPage($scope) {
  this.$scope = $scope;

  this.$markdownInput = $scope.find(SELECTORS.MARKDOWN_INPUT);
  this.$form = $scope.find(SELECTORS.FORM);
  this.$titleInput = $scope.find(SELECTORS.TITLE_INPUT);
  this.$deleteButton = $scope.find(SELECTORS.DELETE);

  this.dropzone = new Dropzone(SELECTORS.DROPZONE);
  this.simplemde = new SimpleMDE();

  this.bind();
};

EditPage.constructor = EditPage;
EditPage.prototype = {
  bind() {
    this.dropzone.on('success', this.onDropzoneSuccess.bind(this));
    this.$titleInput.on('input propertychange paste', this.onTitleInputChange.bind(this));
    // this.$deleteButton.on('click', this.onDeleteClick.bind(this));
    this.$deleteButton.hide();
  },

  // Handle the event when the user successfully uploads a file via Dropzone
  onDropzoneSuccess(file, responseText) {
    // console.log(responseText); // console should show the ID you pointed to
    // read the upload path from the elements data-upload attribute.
    const uploadPath = $(this.dropzone.element).data('upload') + responseText;
    let linkToUploadedFile = `(${uploadPath})`;
    if (file.type.startsWith('image/')) {
      linkToUploadedFile = `![]${linkToUploadedFile}`;
    } else {
      linkToUploadedFile = `[${responseText}]${linkToUploadedFile}`;
    }
    this.simplemde.value(`${this.simplemde.value()}\n${linkToUploadedFile}\n`);
  },

  // Handle the event when the user changes the title input
  onTitleInputChange(_event) {
    const slug = this.titleToSlug(this.$titleInput.val());
    this.$form.prop('action', `${slug}/save`);
  },

  // Handle the event when the user clicks the delete button
  onDeleteClick(event) {
    if (!confirm('Are you sure you want to delete this document?')) {
      event.preventDefault();
    }
  },

  // Converts the given title string into a URL safe slug.
  titleToSlug(title) {
    return url_slug(title, { limit: 100 });
  },
};

$(() => {
  const page = new EditPage($('.js-editPage'));
});
