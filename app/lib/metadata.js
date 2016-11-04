'use strict';

const request = require('request-promise');
const config = require('../../config');

function getMetadata( path, key ){

  let url = `${config.apiRoot}/metadata/${ path }`;

  return request({
    url,
    json: true
  })
  .then((data) => {

    module.exports[ key ] = data;

  }).catch( ( err ) => {

    console.error( 'Error fetching metadata for url: %s', url );
    throw err;
  } );
}

const metadataItems = [
  [ 'sector/', 'SECTOR_OPTIONS' ],
  [ 'turnover', 'TURNOVER_OPTIONS' ],
  [ 'uk-region', 'REGION_OPTIONS' ],
  [ 'country', 'COUNTRYS' ],
  [ 'employee-range', 'EMPLOYEE_OPTIONS' ],
  [ 'business-type', 'TYPES_OF_BUSINESS' ],
  [ 'team', 'TEAMS' ]
];

function getInteractionTypes(){

  return new Promise( ( resolve, reject ) => {

    request({
      url: `${config.apiRoot}/metadata/interaction-type/`,
      json: true
    }).then( ( types ) => {

      //add my new fake type for now
      types.push( {
        id: 'service-del-test',
        name: 'Service delivery'
      } );

      resolve( types );

    } ).catch( reject );
  } );
}


module.exports.getInteractionTypes = getInteractionTypes;

module.exports.getInteractionType = function( id ){

  return new Promise( ( resolve, reject ) => {

    getInteractionTypes().then( ( types ) => {

      let type;

      for( type of types ){
        if( type.id === id ){
          return resolve( type );
        }
      }

      reject();

    } ).catch( reject );
  } );
};

module.exports.getServiceDeliveryStatuses = function(){

  return new Promise( ( resolve/* , reject */ ) => {

    resolve([
      { id: 0, name: 'Completed' },
      { id: 1, name: 'Current' },
      { id: 2, name: 'Offered' },
      { id: 3, name: 'On hold' },
      { id: 4, name: 'UKEF - In discussion - Application likely' },
      { id: 5, name: 'Withdrawn' }
    ]);
  } );
};

module.exports.fetchAll = function( cb ){

  let caughtErrors;
  let totalRequests = 0;
  let completeRequests = 0;

  function checkResults(){

    completeRequests++;

    if( completeRequests === totalRequests ){
      console.log( 'All metadata requests complete' );
      cb( caughtErrors );
    }
  }

  for( let item of metadataItems ){

    totalRequests++;

    getMetadata( item[ 0 ], item[ 1 ] ).then( checkResults ).catch( ( err ) => {

      caughtErrors = caughtErrors || [];
      caughtErrors.push( err );
      checkResults();
    } );
  }
};

module.exports.REASONS_FOR_ARCHIVE = [
  'Company is dissolved',
  'Other'
];
