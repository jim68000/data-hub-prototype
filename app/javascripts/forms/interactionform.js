import React from 'react';
import axios from 'axios';
import {BaseForm} from './baseform';
import {AutosuggestComponent as Autosuggest} from '../components/autosuggest.component';
import {RadioWithIdComponent as RadioWithId} from '../components/radiowithid.component';
import {InlineRadioComponent as InlineRadio} from '../components/inlineradio.component';
import {DateInputComponent as DateInput} from '../components/dateinput.component';

import {inputTextComponent as InputText} from '../components/inputtext.component';
import {errorListComponent as ErrorList} from '../components/errorlist.component';


const LABELS = {
  'company': 'Company',
  'contact': 'Company contact',
  'dit_advisor': 'DIT advisor',
  'interaction_type': 'Interaction type',
  'subject': 'Subject',
  'notes': 'Interaction notes',
  'data_of_interaction': 'Date of interaction',
  'service': 'Service offer (optional)',
  'dit_team': 'Service provider (optional)',
  service_delivery_type: 'Service delivery type',
  service_delivery_status: 'Status',
  service_delivery_date: 'Service delivery start date',
  service_delivery_dit_team: 'DIT Team',
  service_delivery_uk_region: 'UK region',
  service_delivery_primary_sector: 'Primary sector'
};

const defaultInteraction = {
  company: {
    id: '',
    name: ''
  },
  contact: {
    id: '',
    name: ''
  },
  dit_advisor: {
    id: '',
    name: ''
  },
  interaction_type: {
    id: '',
    name: ''
  },
  service_delivery_type: '',
  service_delivery_status: '',
  uk_region: {
    id: '',
    name: ''
  },
  subject: '',
  notes: '',
  date_of_interaction: '',
  service: {
    id: '',
    name: ''
  },
  dit_team: {
    id: '',
    name: ''
  }
};

export class InteractionForm extends BaseForm {

  constructor(props) {
    super(props);

    let state = {
      saving: false,
      showCompanyField: true,
      showContactField: true
    };

    this.changeTypeUrl = props.changeType;
    this.serviceDeliveryTypes = [
      { value: 0, title: 'Significant assistance' },
      { value: 1, title: 'Event assistance' }
    ];

    if( props.type ){

      defaultInteraction.interaction_type = props.type;

      // TODO: need to figure out how to do this with real data
      state.isServiceDelivery = ( props.type.name.toLowerCase() === 'service delivery' );
    }

    if (props.interaction) {
      state.formData = props.interaction;
      state.showCompanyField = false;
      state.showContactField = false;
    } else if (props.contact) {
      state.formData = {
        company: props.contact.company,
        contact: props.contact
      };
      state.showCompanyField = false;
      state.showContactField = false;
    } else if (props.company) {
      state.formData = {
        company: props.company,
      };
      state.showCompanyField = false;
    } else {
      state.formData = {};
    }

    this.setDefaults(state.formData, defaultInteraction);

    this.state = state;
  }

  save = () => {

    axios.post('/interaction/', { interaction: this.state.formData })
      .then((response) => {
        window.location.href = `/interaction/${response.data.id}/view`;
      })
      .catch((error) => {
        this.setState({
          errors: error.response.data.errors,
          saving: false
        });
      });
  };

  lookupContacts = (term) => {
    return axios.get(`/api/contactlookup?company=${this.state.formData.company.id}&contact=${term}`)
      .then(response => {
        return response.data.map(({id, first_name, last_name}) => {
          return {
            id,
            name: `${first_name} ${last_name}`
          };
        });
      });
  };

  getBackUrl() {
    if (this.props.interaction) {
      return `/interaction/${this.props.interaction.id}/view`;
    } else if (this.props.contact) {
      return `/contact/${this.props.contact.id}/view#interactions`;
    } else if (this.props.company) {
      return `/company/${this.props.company.id}#interactions`;
    }

    return '/';
  }

  render() {

    const formData = this.state.formData;

    let backUrl = this.getBackUrl();
    let changeTypeUrl = this.changeTypeUrl;

    return (
      <div>
        { this.state.errors &&
        <ErrorList labels={LABELS} errors={this.state.errors}/>
        }

        { this.state.showCompanyField ?
          <Autosuggest
            label={LABELS.company}
            lookupUrl='/api/suggest'
            onChange={this.updateField}
            errors={this.getErrors('title')}
            name="company"
            value={formData.company}
          />
          :
          <div className="form-group">
            <div className="form-label">Company</div>
            <strong>{ formData.company.name }</strong>
          </div>
        }

        <div className="form-group">
          <div className="form-label">{ LABELS.interaction_type }</div>
          <strong>{ formData.interaction_type.name }</strong> <a className="change-type" href={ changeTypeUrl }>change</a>
        </div>

        { this.state.isServiceDelivery && <InlineRadio
          options={ this.serviceDeliveryTypes }
          name="service_delivery_type"
          onChange={ this.updateField }
          errors={ this.getErrors( 'service_delivery_type' ) }
          value={ formData.service_delivery_type }
          label={ LABELS.service_delivery_type }/>}

        { this.state.isServiceDelivery && <RadioWithId
          url='/api/servicedeliverystatuses'
          label={ LABELS.service_delivery_status }
          name='service_delivery_status'
          onChange={ this.updateField }
          />}

        <InputText
          label={LABELS.subject}
          name="subject"
          value={formData.subject}
          onChange={this.updateField}
          errors={this.getErrors('subject')}
        />

        <div className="form-group ">
          <label className="form-label" htmlFor="description">{LABELS.notes}</label>
          <textarea
            id="notes"
            className="form-control"
            name="notes"
            rows="5"
            onChange={this.updateField}
            value={formData.notes}/>
        </div>

        { this.state.showContactField ?
          <Autosuggest
            label={LABELS.contact}
            fetchSuggestions={this.lookupContacts}
            onChange={this.updateField}
            errors={this.getErrors('contact')}
            name="contact"
            value={formData.contact}
          />
          :
          <div className="form-group">
            <div className="form-label">{LABELS.contact}</div>
            <strong>{ formData.contact.first_name } { formData.contact.last_name }</strong>
          </div>
        }

        <DateInput
          label={ this.state.isServiceDelivery ? LABELS.service_delivery_date : "Date of interaction" }
          name="date_of_interaction"
          value={formData.date_of_interaction}
          onChange={this.updateField}
          errors={this.getErrors('date_of_interaction')}
        />

        <Autosuggest
          label={LABELS.dit_advisor}
          lookupUrl='/api/accountmanagerlookup'
          onChange={this.updateField}
          errors={this.getErrors('dit_advisor')}
          name="dit_advisor"
          value={formData.dit_advisor}
        />

        { this.state.isServiceDelivery && <Autosuggest
          label={LABELS.service_delivery_dit_team}
          lookupUrl='/api/teamlookup'
          onChange={this.updateField}
          errors={this.getErrors('dit_team')}
          name="dit_team"
          value={formData.dit_team}
          /> }

        { this.state.isServiceDelivery && <Autosuggest
          label={ LABELS.service_delivery_uk_region }
          lookupUrl='/api/meta/region'
          onChange={ this.updateField }
          errors={ this.getErrors( 'uk_region' ) }
          name='uk_region'
          value={ formData.uk_region }
          /> }

        { this.state.isServiceDelivery && <Autosuggest
          label={ LABELS.service_delivery_primary_sector }
          lookupUrl='/api/meta/sector'
          onChange={ this.updateField }
          errors={ this.getErrors( 'primary_sector' ) }
          name='primary_sector'
          value={ formData.primary_sector }
          /> }

        { !this.state.isServiceDelivery && <Autosuggest
          label={LABELS.service}
          suggestionUrl='/api/meta/service'
          onChange={this.updateField}
          errors={this.getErrors('service')}
          name="service"
          value={formData.service}
        /> }

        { !this.state.isServiceDelivery && <Autosuggest
          label={LABELS.dit_team}
          lookupUrl='/api/teamlookup'
          onChange={this.updateField}
          errors={this.getErrors('dit_team')}
          name="dit_team"
          value={formData.dit_team}
        /> }

        <div className="button-bar">
          <button className="button button--save" type="button" onClick={this.save}>Save</button>
          <a className="button-link button--cancel js-button-cancel" href={backUrl}>Cancel</a>
        </div>
      </div>

    );
  }

}
