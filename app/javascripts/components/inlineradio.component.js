import React, { Component } from 'react';

export class InlineRadioComponent extends Component {

  constructor( props ){
    super( props );

    this.state = { value: props.value };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.value) {
      this.setState({value: nextProps.value});
    }
  }

  onChange = ( event ) => {
    this.setState({value: event.target.value});
    this.props.onChange( event );
  }

  render() {

    let state = this.state;
    let props = this.props;

    let groupClass = 'form-group';
    let error;

    if (props.errors && props.errors.length > 0) {
      error = props.errors[0];
      groupClass += ' error';
    }

    let inputs = props.options.map( ( option, index ) => {

      let id = `${ props.name }-${ option.value }-id`;

      return ( <label key={ index } className="block-label" htmlFor={ id }>
        <input id={ id }
               type="radio"
               name={ props.name }
               value={ option.value }
               onChange={ this.onChange }
               checked={ option.value == state.value }/>
        { option.title }
      </label> );
    } );

    return ( <fieldset className={ groupClass + ' inline form-group__checkbox-group' } id={ props.name + '-wrapper' }>
      <legend className="form-label">{ props.label }</legend>
        {error &&
          <span className="error-message">{error}</span>
        }
        { inputs }
    </fieldset> );
  }
}

InlineRadioComponent.propTypes = {
  name: React.PropTypes.string.isRequired,
  label: React.PropTypes.string.isRequired,
  value: React.PropTypes.string,
  options: React.PropTypes.array.isRequired,
  onChange: React.PropTypes.func.isRequired,
  errors: React.PropTypes.array
};
