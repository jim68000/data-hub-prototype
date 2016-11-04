/* eslint-disable max-len */

import React from 'react';
import ReactDOM from 'react-dom';
import {InteractionForm} from '../forms/interactionform';

const editElement = document.getElementById('interaction-form');
const changeType = editElement.getAttribute('data-change-type').length > 0 ? editElement.getAttribute('data-change-type') : null;
const type = editElement.getAttribute('data-type').length > 0 ? JSON.parse(editElement.getAttribute('data-type')) : null;
const contact = editElement.getAttribute('data-contact').length > 0 ? JSON.parse(editElement.getAttribute('data-contact')) : null;
const company = editElement.getAttribute('data-company').length > 0 ? JSON.parse(editElement.getAttribute('data-company')) : null;
const interaction = editElement.getAttribute('data-interaction').length > 0 ? JSON.parse(editElement.getAttribute('data-interaction')) : null;
let backUrl, backTitle, title;

if (contact) {
  backUrl = `/contact/${contact.id}/view#interactions`;
  backTitle = 'contact';
  title = 'Add new interaction';
} else if (company) {
  backUrl = `/company/company_company/${company.id}#interactions`;
  backTitle = 'company';
  title = 'Add new interaction';
} else if (interaction) {
  backUrl = `/interaction/${interaction.id}/view`;
  backTitle = 'interaction';
  title = 'Edit interaction';
} else {
  backUrl = '/';
  backTitle = 'home';
  title = 'Add contact';
}

ReactDOM.render(
  <div>
    <a className="back-link" href={backUrl}>Back to {backTitle}</a>
    <h1 className="heading-xlarge">{title}</h1>
    <InteractionForm
      changeType={changeType}
      type={type}
      company={company}
      contact={contact}
      interaction={interaction}
    />
  </div>,
  editElement
);
