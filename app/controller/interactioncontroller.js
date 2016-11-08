/* eslint new-cap: 0 */

'use strict';
const express = require('express');
const router = express.Router();
const interactionRepository = require('../repository/interactionrepository');
const contactRepository = require('../repository/contactrepository');
const companyRepository = require('../repository/companyrepository');
let metadata = require('../lib/metadata');

const controllerUtils = require('../lib/controllerutils');

function view(req, res) {
  let interaction_id = req.params.interaction_id;

  if (!interaction_id) {
    res.redirect('/');
  }

  interactionRepository.getInteraction(req.session.token, interaction_id)
    .then((interaction) => {
      res.render('interaction/interaction-details', {
        interaction
      });

    })
    .catch((error) => {
      res.render('error', {error});
    });

}

function edit(req, res) {
  let interactionId = req.params.interaction_id || null;

  interactionRepository.getInteraction(req.session.token, interactionId)
    .then((interaction) => {
      res.render('interaction/interaction-edit', {
        company: null,
        contact: null,
        interaction
      });
    });
}

function createChooseTypeUrl( opts ){

  opts = opts || {};

  let params = [];
  let url = '/interaction/type';

  if( opts.typeId ){ params.push( `type_id=${ opts.typeId }` ); }
  if( opts.companyId ){ params.push( `company_id=${ opts.companyId }` ); }
  if( opts.contactId ){ params.push( `contact_id=${ opts.contactId }` ); }

  if( params.length ){

    url += ( '?' + params.join( '&' ) );
  }

  return url;
}

function add(req, res) {

  const companyId = req.query.company_id;
  const contactId = req.query.contact_id;
  const typeId = req.query.type;
  let viewModel = {
    type: null,
    company: null,
    contact: null,
    interactionId: null
  };

  function backToHome( e ){

    if( e ){ console.log( e ); }
    res.redirect( '/' );
  }

  function render(){
    res.render('interaction/interaction-edit', viewModel);
  }

  if( !typeId ){

    res.redirect( createChooseTypeUrl( { companyId, contactId } ) );

  } else {

    metadata.getInteractionType( typeId ).then( ( type ) => {

      viewModel.type = type;

      if (contactId && contactId.length > 0) {

        contactRepository.getContact(req.session.token, contactId)
          .then((contact) => {

              viewModel.changeTypeUrl = createChooseTypeUrl( { contactId, typeId } );
              viewModel.company = contact.company;
              viewModel.contact = contact;
              render();

          }).catch( backToHome );

      } else if (companyId && companyId.length > 0) {

        companyRepository.getDitCompany(req.session.token, companyId)
          .then((company) => {

              viewModel.changeTypeUrl = createChooseTypeUrl( { companyId, typeId } );
              viewModel.company = company;
              render();

          }).catch( backToHome );

      } else {

        backToHome();
      }
    } ).catch( backToHome );
  }
}

function post(req, res) {

  let interaction = Object.assign({}, req.body.interaction);

  controllerUtils.flattenIdFields(interaction);
  controllerUtils.nullEmptyFields(interaction);

  interactionRepository.saveInteraction(req.session.token, interaction)
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      let errors = error.error;
      res.status(400).json({errors});
    });
}

function chooseType( req, res ){

  metadata.getInteractionTypes().then( (types) => {

    types = types.map( ( type ) => {
      return {
        value: type.id,
        title: type.name
      };
    } );

    res.render( 'interaction/choose-type', {
      action: '/interaction/add',
      contact_id: req.query.contact_id,
      company_id: req.query.company_id,
      type_id: req.query.type_id,
      types
    } );
  } );
}

router.get('/type', chooseType);
router.get('/add?', add);
router.get('/:interaction_id/edit', edit);
router.get('/:interaction_id/view', view);
router.post('/', post);

module.exports = {
  view,
  edit,
  post,
  router
};
