import React, { Component } from 'react';

export class InlineRadioComponent extends Component {

  constructor( props ){
    super( props );
    this.state = { value: props.value };
  }

  onChange = ( update ) => {
    this.setState({value: update.value});
    this.props.onChange(update);
  };

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

      const id = `${ props.name }-${ option.id }-id`;
      const checked = (option.id === state.value.id);
      const className = checked ? 'block-label selected' : 'block-label'

      return ( <label key={ index } className={className} htmlFor={ id }>
        <input id={ id }
               type="radio"
               name={ props.name }
               value={ option.id }
               onChange={ () => {
                 this.onChange({
                   name: props.name,
                   value: option
                 });
               }}
               checked={checked}/>
        { option.name }
      </label>
      );
    });

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
