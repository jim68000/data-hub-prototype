'use strict';

const $ = require('jquery');

class Edit {

  constructor(element) {
    this.cacheEls(element);
    this.bindEvents();
    this.showDataView();
  }

  cacheEls(element) {
    this.wrapper = $(element);
    this.dataView = this.wrapper.find('.js-view-data');
    this.editView = this.wrapper.find('.js-view-edit');
    this.editbutton = this.wrapper.find('.js-button-edit');
    this.cancelButton = this.wrapper.find('.js-button-cancel');
  }

  bindEvents() {
    this.editbutton.on('click', this.showEditView);
    this.cancelButton.on('click', this.showDataView);
  }

  showDataView = (event) => {
    if (event) event.preventDefault();
    this.editView.hide();
    this.dataView.show();
    $('html, body').scrollTop(0);
  }

  showEditView = (event) => {
    if (event) event.preventDefault();
    this.dataView.hide();
    this.editView.show();
    this.editView.find('.form-control:first').focus();
  }

}

exports .Edit = {
  el: '.js-hidden-edit',

  init: function() {
    $(this.el).each((index, element) => {
      new Edit(element);
    });
  }
};
