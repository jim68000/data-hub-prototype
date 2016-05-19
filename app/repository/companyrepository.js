'use strict';

const contactsData = require('../../data/fakenames.json');
let data = {};

function getCompany(id) {
  return data[id];
}

function addCompany(company) {
  if (!company.id && company.company_number) {
    company.id = company.company_number;
  }
  if (!company.contacts || company.contacts.length === 0) {
    addRandomPeople(company);
  }
  data[company.id] = company;
  return company;
}

function updateCompany(company) {
  data[company.id] = company;
}

function addRandomPeople(company) {
  company.contacts = [];
  for(let pos = 5; pos > 0; pos -= 1) {
    const randindex = Math.round(Math.random() * (contactsData.length - 1));
    company.contacts.push(contactsData[randindex]);
  }
}

function getCompanyContact(companyId, contactId) {
  let company = getCompany(companyId);

  let contacts = company.contacts;
  for (let pos = contacts.length -1; pos ; pos -= 1 ) {
    if (contacts[pos].id === contactId) {
      let contact = contacts[pos];
      contact.company = company;
      return contact;
    }
  }
}

module.exports = {
  getCompany,
  addCompany,
  updateCompany,
  getCompanyContact
};
