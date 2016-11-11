'use strict';

import * as classUtils from '../utils/elementstuff';

const HIDE = 'hide';
const SHOW = 'show';
const HIDDEN_CLASS = 'clipped-hide';

class ClippedList {

  constructor( element, showMessage, hideMessage, itemsToShow = 5 ){

    if( !element ){ return; }

    this.items = element.getElementsByTagName( 'li' );

    if( this.items.length > itemsToShow ){

      this.element = element;
      this.itemsToShow = itemsToShow;
      this.showMessage = showMessage;
      this.hideMessage = hideMessage;
      this.control = this.createControl();

      this.setState( HIDE );

    } else {

      this.items = null;
    }
  }

  hideItems( setHidden ){

    let i = this.itemsToShow;
    let l = this.items.length;

    const action = ( setHidden ? 'addClass' : 'removeClass' );

    for( ; i < l; i++ ){

      classUtils[ action ]( this.items[ i ], HIDDEN_CLASS );
    }
  }

  hideExtraItems(){

    this.hideItems( true );
    this.updateControl( this.showMessage );
  }

  showExtraItems(){

    this.hideItems( false );
    this.updateControl( this.hideMessage );
  }

  updateControl( text ){

    this.control.innerHTML = text;
  }

  createControl(){

    const control = document.createElement( 'a' );

    control.className = 'clipped-list-control';
    control.onclick = this.toggleState;
    control.href = '#';

    this.element.parentNode.insertBefore( control, this.element.nextSibling );

    return control;
  }

  toggleState = ( e ) => {

    e.target && ( typeof e.target.blur === 'function' ) && e.target.blur();

    this.setState( this.state === HIDE ? SHOW : HIDE );
  }

  setState( state ){

    this.state = state;

    switch( state ){

      case HIDE:

        this.hideExtraItems();
      break;

      case SHOW:

        this.showExtraItems();
      break;
    }
  }
}

export default ClippedList;
