/* eslint new-cap: 0 */
'use strict';

const express = require('express');
const router = express.Router();
const postcodeService = require('../lib/postcodeservice');
const searchService = require('../lib/searchservice');
const companyRepository = require('../repository/companyrepository');
const metadata = require('../lib/metadata');
const rp = require('request-promise');
const config = require('../../config');
const authorisedRequest = require( '../lib/authorisedRequest' );

function postcodelookup(req, res) {
  let postcode = req.params.postcode;

  postcodeService.lookupAddress(postcode)
    .then((addresses) => {
      res.json(addresses);
    })
    .catch((error) => {
      res.json({error});
    });
}

function companySuggest(req, res) {
  searchService.suggestCompany(req.session.token, req.query.term, req.query.type)
    .then((result) => {
      res.json(result);
    })
    .catch(() => {
      res.json([]);
    });
}

function countryLookup(req, res) {

  if (!req.query.country || req.query.country.length === 0) {
    res.json([]);
    return;
  }

  const countryParam = req.query.country.toLocaleLowerCase();
  const results = metadata.COUNTRYS.filter((country) => {
    return country.name.length >= countryParam.length &&
           country.name.substr(0, countryParam.length).toLocaleLowerCase() === countryParam;
  });

  res.json(results);
}

function accountManagerLookup(req, res) {

  if (!req.query.term || req.query.term.length === 0) {
    res.json([]);
    return;
  }

  const param = req.query.term.toLocaleLowerCase();

  authorisedRequest(req.session.token, {
    url: `${config.apiRoot}/advisor/`,
    json: true
  })
  .then((data) => {
    const results = data.results.filter((advisor) => {
      return advisor.name.length >= param.length &&
        advisor.name.substr(0, param.length).toLocaleLowerCase() === param;
    });

    res.json(results);
  });
}

function getMetadata(req, res) {

  const metaName = req.params.metaName;
  let result;

  switch (metaName) {
    case 'typesofbusiness':
      result = metadata.TYPES_OF_BUSINESS;
      break;
    case 'typesofinteraction':
      rp({
        url: `${config.apiRoot}/metadata/interaction-type/`,
        json: true
      })
        .then((response) => {
          res.json(response);
        });
      return;
    case 'sector':
      result = metadata.SECTOR_OPTIONS;
      break;
    case 'countries':
      result = metadata.COUNTRYS;
      break;
    case 'region':
      result = metadata.REGION_OPTIONS;
      break;
    case 'employee_range':
      result = metadata.EMPLOYEE_OPTIONS;
      break;
    case 'turnover_range':
      result = metadata.TURNOVER_OPTIONS;
      break;
    case 'primary_sectors':
      result = metadata.PRIMARY_SECTORS;
      break;
    case 'subsectors':
      result = metadata.SUBSECTORS;
      break;
    case 'role':
      rp({
        url: `${config.apiRoot}/metadata/role/`,
        json: true
      })
        .then((response) => {
          res.json(response);
        });
      return;
    case 'title':
      rp({
        url: `${config.apiRoot}/metadata/title/`,
        json: true
      })
        .then((response) => {
          res.json(response);
        });
      return;
    case 'advisors':
      authorisedRequest(req.session.token, {
        url: `${config.apiRoot}/advisor/`,
        json: true
      })
        .then((response) => {
          res.json(response.results);
        });
      return;
    case 'service':
      rp({
        url: `${config.apiRoot}/metadata/service/`,
        json: true
      })
        .then((response) => {
          res.json(response);
        });
      return;
    default:
      result = [];
  }

  res.json(result);
}

function contactLookup(req, res) {

  if (!req.query.company || req.query.company.length === 0
    || !req.query.contact || req.query.contact.length === 0)
  {
    res.json([]);
    return;
  }

  const companyParam = req.query.company.toLocaleLowerCase();
  const contactParam = req.query.contact.toLocaleLowerCase();
  const contactParamLength = contactParam.length;

  companyRepository.getDitCompany(req.session.token, companyParam)
    .then(company => {
      const results = company.contacts
        .map(({id, first_name, last_name}) => {
          return {
            id,
            name: `${first_name} ${last_name}`
          };
        })
        .filter(({name}) => name.substr(0, contactParamLength).toLocaleLowerCase() === contactParam);

      res.json(results);
    });
}

function teamLookup(req, res) {

  if (!req.query.term || req.query.term.length === 0)
  {
    res.json([]);
    return;
  }

  const teamParam = req.query.term.toLocaleLowerCase();
  const teamParamLength = teamParam.length;
  const teams = metadata.TEAMS;

  let results = teams.filter(team => {
    return team.name.substr(0, teamParamLength).toLocaleLowerCase() === teamParam;
  });

  if (results.length > 10) {
    results = results.splice(0, 10);
  }
  res.json(results);
}

function getServiceDeliveryStatuses( req, res ){

  metadata.getServiceDeliveryStatuses().then( ( statuses ) => {

    res.json( statuses );
  } );
}


function getSubsectors( req, res ){

  const sectorId = req.params.sectorId;
  let term = req.query.term;
  const termLength = term && term.length;
  let subsectors = metadata.SUBSECTORS[ sectorId ];

  if( termLength ){

    term = term.toLocaleLowerCase();

    subsectors = subsectors.filter( ( subsector ) => {
      return !!~subsector.name.toLocaleLowerCase().indexOf( term );
    } );
  }

  res.json( subsectors );
}

function createIndexofFilter( metadataKey, propName ){

  return function( req, res ){

    let term = req.query.term;
    const termLength = term && term.length;
    let data = metadata[ metadataKey ];

    if( termLength ){

      term = term.toLocaleLowerCase();

      data = data.filter( ( dataItem ) => {

        return !!~dataItem[ propName ].toLocaleLowerCase().indexOf( term );
      } );
    }

    res.json( data );
  };
}


router.get('/suggest', companySuggest);
router.get('/countrylookup', countryLookup);
router.get('/accountmanagerlookup', accountManagerLookup);
router.get('/contactlookup', contactLookup);
router.get('/teamlookup', teamLookup);
router.get('/meta/:metaName', getMetadata);
router.get('/postcodelookup/:postcode', postcodelookup);
router.get('/servicedeliverystatuses', getServiceDeliveryStatuses);
router.get('/primarysector', createIndexofFilter( 'PRIMARY_SECTORS', 'name' ) );
router.get('/subsectors/:sectorId', getSubsectors);
router.get('/country', createIndexofFilter( 'COUNTRYS', 'name' ) );
router.get('/ukregion', createIndexofFilter( 'REGION_OPTIONS', 'name' ) );
router.get('/team', createIndexofFilter( 'TEAMS', 'name' ) );


module.exports = {
  postcodelookup,
  companySuggest,
  countryLookup,
  accountManagerLookup,
  contactLookup,
  getMetadata,
  teamLookup,
  router
};

