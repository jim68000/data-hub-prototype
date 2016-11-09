var regularExp1 = '(\\s|^)',
  regularExp2 = '(\\s|$)';

export function addClass(element, className) {
  if (isNodeList(element)) {
    for (var pos = element.length - 1; pos > -1; pos -= 1) {
      addClass(element[pos], className);
    }
  } else if (element.classList) {
    element.classList.add(className);
  } else if (!hasClass(element, className)) {
    element.className += ' ' + className;
  }
}

export function removeClass(element, className) {
  if (isNodeList(element)) {
    for (var pos = element.length - 1; pos > -1; pos -= 1) {
      removeClass(element[pos], className);
    }
  } else if (element.classList) {
    element.classList.remove(className);
  } else if (hasClass(element, className)) {
    const regClass = new RegExp(regularExp1 + className + regularExp2);
    element.className = element.className.replace(regClass, ' ');
  }
}

export function hasClass(element, className) {
  if (element.classList) {
    return element.classList.contains(className);
  }
  return element.className.match(new RegExp(regularExp1 + className + regularExp2));
}

export function toggleClass(element, className) {
  if (isNodeList(element)) {
    for (var pos = element.length - 1; pos > -1; pos -= 1) {
      toggleClass(element[pos], className);
    }
  } else if (hasClass(element, className)) {
    removeClass(element, className);
  } else {
    addClass(element, className);
  }
}

  function isNodeList(el) {
  return (typeof el === 'object' && typeof el.length === 'number');
}
