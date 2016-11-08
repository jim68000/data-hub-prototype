import React, { Component } from 'react';
import Highlight from 'react-highlighter';
import axios from 'axios';
import debounce from 'lodash/debounce';


export class AutosuggestComponent extends Component {

  // Component lifecycle

  constructor(props) {
    super(props);

    let state = {
      value: {id: '', name: ''},
      highlightedIndex: null,
      suggestions: [],
      options: [],
      invalidValue: false,
      hasFocus: false,
      changed: false
    };

    if (props.options) {
      state.options = props.options;
    }

    if (props.value) {
      state.value = props.value;
    }

    this.state = state;

    if (this.props.fetchSuggestions) {
      this.fetcher = this.fetchSuggestionsFromProps;
    } else if (this.props.lookupUrl) {
      this.fetcher = debounce(this.fetchSuggestionsFromServer, 200);
    } else {
      this.fetcher = this.fetchSuggestionsFromLocalOptions;
    }
  }

  componentDidMount() {

    document.addEventListener('mousedown', this.onDocumentMouseDown);

    if (this.props.optionsUrl && this.props.optionsUrl.length > 0) {
      axios.get(this.props.optionsUrl)
        .then((result) => {
          this.setState({options: result.data});
        });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onDocumentMouseDown);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.options) {
      this.setState({options: nextProps.options});
    }
  }


  // event handlers

  // Listen for clicks on the document.
  // If the user clicks outside the autosuggest then clear it
  // otherwise the user clicked on the field or a suggestion, so
  // keep focus on the field.
  onDocumentMouseDown = event => {
    let node = event.detail && event.detail.target || event.target;

    do {
      if (node === this.container) {
        return;
      }
      node = node.parentNode;
    } while (node !== null && node !== document);

    // Must have been outside the control, so clear the suggestions
    this.leaveField();
  };

  // When the user types, change any currently selcted value
  // and set the value to just be the text entered
  // reset all the checks then go look for suggestions
  onChange = (event) => {
    const newValue = event.target.value;

    this.setState({
      value: {
        id: null,
        name: newValue
      },
      highlightedIndex: null,
      invalidValue: false,
      changed: true
    });

    this.props.onChange({
      name: this.props.name,
      value: {
        id: null,
        name: newValue
      }
    });

    this.fetchSuggestions(newValue);
  };


  // Need to use a combination of keydown and keyup to get
  // keyboard navigation events.
  keydown = (event) => {
    // Tab
    if (event.keyCode === 9) {
      this.leaveField();
    }
  };
  keyup = (event) => {
    event.preventDefault();
    event.stopPropagation();

    switch (event.keyCode) {
      case 13: // enter
        this.selectSuggestion();
        break;

      case 27: // escape
        this.clearSuggestions();
        break;

      case 38: // up arrow
        this.prev();
        break;

      case 40: // down arrow
        this.next();
        break;
    }
  };

  // Set a var to say if we currently have focus.
  // If the user types something in and moves off the field
  // before the results come back then this helps decide
  // to throw them away as we are no longer using the field.
  focus = () => {
    this.setState({hasFocus: true});
  };



  // Calculate suggestions

  // Decides how to get suggestions, local, remotely or via a provided function
  fetchSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    if (inputLength === 0) {
      this.setState({ suggestions: [] });
      return;
    }

    this.fetcher(inputValue);
  };

  fetchSuggestionsFromLocalOptions = (value) => {
    const suggestions = this.state.options.filter(suggestion =>
      suggestion.name.toLowerCase().slice(0, value.length) === value
    );

    this.setState({ suggestions });
  };

  fetchSuggestionsFromServer = (value) => {
    let url;

    if (typeof this.props.lookupUrl === 'function') {
      url = this.props.lookupUrl(value);
    } else {
      url = `${this.props.lookupUrl}?term=${value}`;
    }

    axios.get(url)
      .then(response => {
        if (this.state.hasFocus) {
          this.setState({suggestions: response.data});
        }
      });
  };

  fetchSuggestionsFromProps = (value) => {
    this.props.fetchSuggestions(value)
      .then(suggestions => {
        if (this.state.hasFocus) {
          this.setState({ suggestions });
        }
      });
  };

  clearSuggestions = () => {
    this.setState({ suggestions: [], highlightedIndex: null });
  };


  // Navigate suggestions

  leaveField() {
    // If the current field value exactly matches the first suggestion
    // then select that
    if (this.state.suggestions.length > 0) {
      const currentValue = this.state.value.name.toLocaleLowerCase();
      const firstSuggestion = this.state.suggestions[0].name.toLocaleLowerCase();

      if (currentValue === firstSuggestion) {
        this.setState({value: this.state.suggestions[0]});
        this.props.onChange({
          name: this.props.name,
          value: this.state.suggestions[0]
        });
        this.clearSuggestions();
        return;
      }
    }

    if (!this.props.allowOwnValue && !this.state.value.id && this.state.changed) {
      this.setState({invalidValue: true});
    }

    this.clearSuggestions();
  }

  next() {
    const length = this.state.suggestions.length - 1;
    if (this.state.highlightedIndex === null || this.state.highlightedIndex === length) {
      this.setState({ highlightedIndex: 0 });
    } else {
      this.setState({ highlightedIndex: (this.state.highlightedIndex + 1) });
    }
  }

  prev() {
    const length = this.state.suggestions.length - 1;
    if (!this.state.highlightedIndex || this.state.highlightedIndex === 0) {
      this.setState({ highlightedIndex: length });
    } else {
      this.setState({ highlightedIndex: this.state.highlightedIndex - 1 });
    }
  }

  selectSuggestion(suggestion) {

    let selectedSuggestion;

    if (suggestion) {
      selectedSuggestion = suggestion;
    } else if (this.state.highlightedIndex !== null) {
      selectedSuggestion = this.state.suggestions[this.state.highlightedIndex];
    }

    if (selectedSuggestion) {
      this.setState({ value: selectedSuggestion, changed: true });
      this.props.onChange({name: this.props.name, value: selectedSuggestion});
    }

    this.clearSuggestions();
    this.textInput.focus();
  }


  // Render markup

  renderSuggestion = (suggestion, key) => {

    let className = 'autosuggest__suggestion';
    if (key === this.state.highlightedIndex) {
      className += ' autosuggest__suggestion--active';
    }

    return (
      <li key={key} className={className}>
        <a onClick={() => { this.selectSuggestion(suggestion); }}>
          <Highlight search={this.state.value.name}>{suggestion.name}</Highlight>
        </a>
      </li>
    );
  };

  renderSuggestions(suggestions) {

    if (!suggestions || suggestions.length === 0) return null;

    const suggestionsMarkup = suggestions.map((suggestion, index) => {
      return this.renderSuggestion(suggestion, index);
    });

    return (
      <ul className="autosuggest__suggestions">
        {suggestionsMarkup}
      </ul>
    );
  }

  render() {
    const { value } = this.state;
    const suggestions = this.renderSuggestions(this.state.suggestions);
    let className = 'form-group autosuggest__container';

    let error;
    if (this.props.errors && this.props.errors.length > 0) {
      error = this.props.errors[0];
      className += ' error';
    } else if (this.state.invalidValue) {
      className += ' error';
      error = 'Invalid selection';
    }

    return (
      <div className={className} onClick={this.test} ref={(div) => {this.container = div;}}>
        { this.props.label &&
          <label className="form-label">
            {this.props.label}
            {error &&
              <span className="error-message">{error}</span>
            }
          </label>
        }
        <input
          className="form-control"
          name={this.props.name}
          value={value.name}
          onChange={this.onChange}
          onKeyPress={this.keypress}
          onKeyDown={this.keydown}
          onKeyUp={this.keyup}
          onFocus={this.focus}
          autoComplete="off"
          ref={(input) => {this.textInput = input;}}
        />
        { suggestions }
      </div>
    );
  }

}


AutosuggestComponent.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  label: React.PropTypes.string.isRequired,
  options: React.PropTypes.array,
  optionsUrl: React.PropTypes.string,
  fetchSuggestions: React.PropTypes.func,
  lookupUrl: React.PropTypes.any,
  value: React.PropTypes.shape({
    id: React.PropTypes.string,
    name: React.PropTypes.string
  }),
  name: React.PropTypes.string.isRequired,
  allowOwnValue: React.PropTypes.bool,
  errors: React.PropTypes.array
};
