'use strict';
const authorisedRequest = require('../lib/authorisedRequest');
const config = require('../../config');

const fakeServceDeliveryInteractions = {};
const fakeCompanyServiceDeliveryInteractions = {};

const requiredFields = [
  'interaction_type',
  'service_delivery_type',
  'service_delivery_status',
  'subject',
  'notes',
  'contact',
  'date_of_interaction',
  'dit_advisor',
  'dit_team',
  'primary_sector'
];

function generateId(){
  return Math.floor( Math.random() * Date.now() );
}

function validate( interaction ){

  let field;
  let errors = {};

  for( field of requiredFields ){

    if( interaction[ field ] === null ){
      errors[ field ] = [ 'This field may not be null.' ];
    }
  }

  return { error: errors };
}

function isServiceDelivery( interaction ){

  const type = ( interaction && interaction.interaction_type );
  const name = ( type.toLowerCase() );

  return ( name === 'service-del-test' );
}

function createFakeServiceDelivery( interaction ){

  const companyId = interaction.company.id;
  interaction.id = generateId();
  fakeServceDeliveryInteractions[ interaction.id ] = interaction;

  fakeCompanyServiceDeliveryInteractions[ companyId ] = ( fakeCompanyServiceDeliveryInteractions[ companyId ] || [] );
  fakeCompanyServiceDeliveryInteractions[ companyId ].push( interaction.id );
}

function updateFakeServiceDelivery( interaction ){

  fakeServceDeliveryInteractions[ interaction.id ] = interaction;
}

function handleFakeInteraction( interaction, rawInteraction ){

  const fakeInteraction = Object.assign( {}, rawInteraction, {
      archived: false,
      archived_on: null,
      archived_reason: null,
      created_on: '2016-11-09T04:57:39.948000',
      modified_on: '2016-11-09T04:57:39.948000',
      archived_by: null
    } );

  return new Promise( ( resolve, reject ) => {

    const errors = validate( interaction );

    if( Object.keys( errors.error ).length ){

      reject( errors );

    } else {

      if (fakeInteraction.id && fakeInteraction.id.length > 0) {

        updateFakeServiceDelivery( fakeInteraction );

      } else {

        createFakeServiceDelivery( fakeInteraction );
      }

      resolve( fakeInteraction );
    }
  } );
}


function getInteraction(token, interactionId) {

  const fakeServiceDelivery = fakeServceDeliveryInteractions[ interactionId ];

  if( fakeServiceDelivery ){

    return new Promise( ( resolve ) => {

      resolve( fakeServiceDelivery );
    } );

  } else {

    return authorisedRequest(token, {
      url: `${config.apiRoot}/interaction/${interactionId}/`,
      json: true
    });
  }
}

function saveInteraction(token, interaction, rawInteraction) {

  console.dir( interaction );

  if( isServiceDelivery( interaction ) ){

    return handleFakeInteraction( interaction, rawInteraction );

  } else {

    let options = {
      json: true,
      body: interaction
    };

    if (interaction.id && interaction.id.length > 0) {
      // update
      options.url = `${config.apiRoot}/interaction/${interaction.id}/`;
      options.method = 'PUT';
    } else {
      options.url = `${config.apiRoot}/interaction/`;
      options.method = 'POST';
    }

    return authorisedRequest(token, options);
  }
}


module.exports = {
  saveInteraction,
  getInteraction,
  getFakeCompanyInteractions: function( companyId ){

    const interactionIds = fakeCompanyServiceDeliveryInteractions[ companyId ] || [];

    return interactionIds.map( ( id ) => { return { id }; } );
  }
};
