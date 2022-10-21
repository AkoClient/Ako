/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/adblockpluscore/lib/common.js":
/*!****************************************************!*\
  !*** ./node_modules/adblockpluscore/lib/common.js ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



let textToRegExp =
/**
 * Converts raw text into a regular expression string
 * @param {string} text the string to convert
 * @return {string} regular expression representation of the text
 * @package
 */
exports.textToRegExp = text => text.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

const regexpRegexp = /^\/(.*)\/([imu]*)$/;

/**
 * Make a regular expression from a text argument.
 *
 * If it can be parsed as a regular expression, parse it and the flags.
 *
 * @param {string} text the text argument.
 *
 * @return {?RegExp} a RegExp object or null in case of error.
 */
exports.makeRegExpParameter = function makeRegExpParameter(text) {
  let [, source, flags] = regexpRegexp.exec(text) || [null, textToRegExp(text)];

  try {
    return new RegExp(source, flags);
  }
  catch (e) {
    return null;
  }
};

let splitSelector = exports.splitSelector = function splitSelector(selector) {
  if (!selector.includes(","))
    return [selector];

  let selectors = [];
  let start = 0;
  let level = 0;
  let sep = "";

  for (let i = 0; i < selector.length; i++) {
    let chr = selector[i];

    // ignore escaped characters
    if (chr == "\\") {
      i++;
    }
    // don't split within quoted text
    else if (chr == sep) {
      sep = "";             // e.g. [attr=","]
    }
    else if (sep == "") {
      if (chr == '"' || chr == "'") {
        sep = chr;
      }
      // don't split between parentheses
      else if (chr == "(") {
        level++;            // e.g. :matches(div,span)
      }
      else if (chr == ")") {
        level = Math.max(0, level - 1);
      }
      else if (chr == "," && level == 0) {
        selectors.push(selector.substring(start, i));
        start = i + 1;
      }
    }
  }

  selectors.push(selector.substring(start));
  return selectors;
};

function findTargetSelectorIndex(selector) {
  let index = 0;
  let whitespace = 0;
  let scope = [];

  // Start from the end of the string and go character by character, where each
  // character is a Unicode code point.
  for (let character of [...selector].reverse()) {
    let currentScope = scope[scope.length - 1];

    if (character == "'" || character == "\"") {
      // If we're already within the same type of quote, close the scope;
      // otherwise open a new scope.
      if (currentScope == character)
        scope.pop();
      else
        scope.push(character);
    }
    else if (character == "]" || character == ")") {
      // For closing brackets and parentheses, open a new scope only if we're
      // not within a quote. Within quotes these characters should have no
      // meaning.
      if (currentScope != "'" && currentScope != "\"")
        scope.push(character);
    }
    else if (character == "[") {
      // If we're already within a bracket, close the scope.
      if (currentScope == "]")
        scope.pop();
    }
    else if (character == "(") {
      // If we're already within a parenthesis, close the scope.
      if (currentScope == ")")
        scope.pop();
    }
    else if (!currentScope) {
      // At the top level (not within any scope), count the whitespace if we've
      // encountered it. Otherwise if we've hit one of the combinators,
      // terminate here; otherwise if we've hit a non-colon character,
      // terminate here.
      if (/\s/.test(character))
        whitespace++;
      else if ((character == ">" || character == "+" || character == "~") ||
               (whitespace > 0 && character != ":"))
        break;
    }

    // Zero out the whitespace count if we've entered a scope.
    if (scope.length > 0)
      whitespace = 0;

    // Increment the index by the size of the character. Note that for Unicode
    // composite characters (like emoji) this will be more than one.
    index += character.length;
  }

  return selector.length - index + whitespace;
}

/**
 * Qualifies a CSS selector with a qualifier, which may be another CSS selector
 * or an empty string. For example, given the selector "div.bar" and the
 * qualifier "#foo", this function returns "div#foo.bar".
 * @param {string} selector The selector to qualify.
 * @param {string} qualifier The qualifier with which to qualify the selector.
 * @returns {string} The qualified selector.
 * @package
 */
exports.qualifySelector = function qualifySelector(selector, qualifier) {
  let qualifiedSelector = "";

  let qualifierTargetSelectorIndex = findTargetSelectorIndex(qualifier);
  let [, qualifierType = ""] =
    /^([a-z][a-z-]*)?/i.exec(qualifier.substring(qualifierTargetSelectorIndex));

  for (let sub of splitSelector(selector)) {
    sub = sub.trim();

    qualifiedSelector += ", ";

    let index = findTargetSelectorIndex(sub);

    // Note that the first group in the regular expression is optional. If it
    // doesn't match (e.g. "#foo::nth-child(1)"), type will be an empty string.
    let [, type = "", rest] =
      /^([a-z][a-z-]*)?\*?(.*)/i.exec(sub.substring(index));

    if (type == qualifierType)
      type = "";

    // If the qualifier ends in a combinator (e.g. "body #foo>"), we put the
    // type and the rest of the selector after the qualifier
    // (e.g. "body #foo>div.bar"); otherwise (e.g. "body #foo") we merge the
    // type into the qualifier (e.g. "body div#foo.bar").
    if (/[\s>+~]$/.test(qualifier))
      qualifiedSelector += sub.substring(0, index) + qualifier + type + rest;
    else
      qualifiedSelector += sub.substring(0, index) + type + qualifier + rest;
  }

  // Remove the initial comma and space.
  return qualifiedSelector.substring(2);
};


/***/ }),

/***/ "./node_modules/adblockpluscore/lib/content/elemHideEmulation.js":
/*!***********************************************************************!*\
  !*** ./node_modules/adblockpluscore/lib/content/elemHideEmulation.js ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



const {makeRegExpParameter, splitSelector,
       qualifySelector} = __webpack_require__(/*! ../common */ "./node_modules/adblockpluscore/lib/common.js");
const {filterToRegExp} = __webpack_require__(/*! ../patterns */ "./node_modules/adblockpluscore/lib/patterns.js");

const DEFAULT_MIN_INVOCATION_INTERVAL = 3000;
let minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
const DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME = 50;
let maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;

let abpSelectorRegexp = /:(-abp-[\w-]+|has|has-text|xpath|not)\(/;

let testInfo = null;

function toCSSStyleDeclaration(value) {
  return Object.assign(document.createElement("test"), {style: value}).style;
}

/**
 * Enables test mode, which tracks additional metadata about the inner
 * workings for test purposes. This also allows overriding internal
 * configuration.
 *
 * @param {object} options
 * @param {number} options.minInvocationInterval Overrides how long
 *   must be waited between filter processing runs
 * @param {number} options.maxSynchronousProcessingTime Overrides how
 *   long the thread may spend processing filters before it must yield
 *   its thread
 */
exports.setTestMode = function setTestMode(options) {
  if (typeof options.minInvocationInterval !== "undefined")
    minInvocationInterval = options.minInvocationInterval;
  if (typeof options.maxSynchronousProcessingTime !== "undefined")
    maxSynchronousProcessingTime = options.maxSynchronousProcessingTime;

  testInfo = {
    lastProcessedElements: new Set(),
    failedAssertions: []
  };
};

exports.getTestInfo = function getTestInfo() {
  return testInfo;
};

exports.clearTestMode = function() {
  minInvocationInterval = DEFAULT_MIN_INVOCATION_INTERVAL;
  maxSynchronousProcessingTime = DEFAULT_MAX_SYCHRONOUS_PROCESSING_TIME;
  testInfo = null;
};

/**
 * Creates a new IdleDeadline.
 *
 * Note: This function is synchronous and does NOT request an idle
 * callback.
 *
 * See {@link https://developer.mozilla.org/en-US/docs/Web/API/IdleDeadline}.
 * @return {IdleDeadline}
 */
function newIdleDeadline() {
  let startTime = performance.now();
  return {
    didTimeout: false,
    timeRemaining() {
      let elapsed = performance.now() - startTime;
      let remaining = maxSynchronousProcessingTime - elapsed;
      return Math.max(0, remaining);
    }
  };
}

/**
 * Returns a promise that is resolved when the browser is next idle.
 *
 * This is intended to be used for long running tasks on the UI thread
 * to allow other UI events to process.
 *
 * @return {Promise.<IdleDeadline>}
 *    A promise that is fulfilled when you can continue processing
 */
function yieldThread() {
  return new Promise(resolve => {
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(resolve);
    }
    else {
      setTimeout(() => {
        resolve(newIdleDeadline());
      }, 0);
    }
  });
}


function getCachedPropertyValue(object, name, defaultValueFunc = () => {}) {
  let value = object[name];
  if (typeof value == "undefined")
    Object.defineProperty(object, name, {value: value = defaultValueFunc()});
  return value;
}

/**
 * Return position of node from parent.
 * @param {Node} node the node to find the position of.
 * @return {number} One-based index like for :nth-child(), or 0 on error.
 */
function positionInParent(node) {
  let index = 0;
  for (let child of node.parentNode.children) {
    if (child == node)
      return index + 1;

    index++;
  }

  return 0;
}

function makeSelector(node, selector = "") {
  if (node == null)
    return null;
  if (!node.parentElement) {
    let newSelector = ":root";
    if (selector)
      newSelector += " > " + selector;
    return newSelector;
  }
  let idx = positionInParent(node);
  if (idx > 0) {
    let newSelector = `${node.tagName}:nth-child(${idx})`;
    if (selector)
      newSelector += " > " + selector;
    return makeSelector(node.parentElement, newSelector);
  }

  return selector;
}

function parseSelectorContent(content, startIndex) {
  let parens = 1;
  let quote = null;
  let i = startIndex;
  for (; i < content.length; i++) {
    let c = content[i];
    if (c == "\\") {
      // Ignore escaped characters
      i++;
    }
    else if (quote) {
      if (c == quote)
        quote = null;
    }
    else if (c == "'" || c == '"') {
      quote = c;
    }
    else if (c == "(") {
      parens++;
    }
    else if (c == ")") {
      parens--;
      if (parens == 0)
        break;
    }
  }

  if (parens > 0)
    return null;
  return {text: content.substring(startIndex, i), end: i};
}

/**
 * Stringified style objects
 * @typedef {Object} StringifiedStyle
 * @property {string} style CSS style represented by a string.
 * @property {string[]} subSelectors selectors the CSS properties apply to.
 */

/**
 * Produce a string representation of the stylesheet entry.
 * @param {CSSStyleRule} rule the CSS style rule.
 * @return {StringifiedStyle} the stringified style.
 */
function stringifyStyle(rule) {
  let styles = [];
  for (let i = 0; i < rule.style.length; i++) {
    let property = rule.style.item(i);
    let value = rule.style.getPropertyValue(property);
    let priority = rule.style.getPropertyPriority(property);
    styles.push(`${property}: ${value}${priority ? " !" + priority : ""};`);
  }
  styles.sort();
  return {
    style: styles.join(" "),
    subSelectors: splitSelector(rule.selectorText)
  };
}

let scopeSupported = null;

function tryQuerySelector(subtree, selector, all) {
  let elements = null;
  try {
    elements = all ? subtree.querySelectorAll(selector) :
      subtree.querySelector(selector);
    scopeSupported = true;
  }
  catch (e) {
    // Edge doesn't support ":scope"
    scopeSupported = false;
  }
  return elements;
}

/**
 * Query selector.
 *
 * If it is relative, will try :scope.
 *
 * @param {Node} subtree the element to query selector
 * @param {string} selector the selector to query
 * @param {bool} [all=false] true to perform querySelectorAll()
 *
 * @returns {?(Node|NodeList)} result of the query. null in case of error.
 */
function scopedQuerySelector(subtree, selector, all) {
  if (selector[0] == ">") {
    selector = ":scope" + selector;
    if (scopeSupported) {
      return all ? subtree.querySelectorAll(selector) :
        subtree.querySelector(selector);
    }
    if (scopeSupported == null)
      return tryQuerySelector(subtree, selector, all);
    return null;
  }
  return all ? subtree.querySelectorAll(selector) :
    subtree.querySelector(selector);
}

function scopedQuerySelectorAll(subtree, selector) {
  return scopedQuerySelector(subtree, selector, true);
}

class PlainSelector {
  constructor(selector) {
    this._selector = selector;
    this.maybeDependsOnAttributes = /[#.:]|\[.+\]/.test(selector);
    this.maybeContainsSiblingCombinators = /[~+]/.test(selector);
  }

  /**
   * Generator function returning a pair of selector string and subtree.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getSelectors(prefix, subtree, targets) {
    yield [prefix + this._selector, subtree];
  }
}

const incompletePrefixRegexp = /[\s>+~]$/;

class NotSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        if (!this._innerPattern.matches(element, subtree))
          yield element;

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class HasSelector {
  constructor(selectors) {
    this._innerPattern = new Pattern(selectors);
  }

  get dependsOnStyles() {
    return this._innerPattern.dependsOnStyles;
  }

  get dependsOnCharacterData() {
    return this._innerPattern.dependsOnCharacterData;
  }

  get maybeDependsOnAttributes() {
    return this._innerPattern.maybeDependsOnAttributes;
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  /**
   * Generator function returning selected elements.
   * @param {string} prefix the prefix for the selector.
   * @param {Node} subtree the subtree we work on.
   * @param {Node[]} [targets] the nodes we are interested in.
   */
  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;
    let elements = scopedQuerySelectorAll(subtree, actualPrefix);
    if (elements) {
      for (let element of elements) {
        // If the element is neither an ancestor nor a descendant of one of the
        // targets, we can skip it.
        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        for (let selector of this._innerPattern.evaluate(element, targets)) {
          if (selector == null)
            yield null;
          else if (scopedQuerySelector(element, selector))
            yield element;
        }

        yield null;
      }
    }
  }

  setStyles(styles) {
    this._innerPattern.setStyles(styles);
  }
}

class XPathSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;
    this.maybeDependsOnAttributes = true;

    let evaluator = new XPathEvaluator();
    this._expression = evaluator.createExpression(textContent, null);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), element];
  }

  *getElements(prefix, subtree, targets) {
    let {ORDERED_NODE_SNAPSHOT_TYPE: flag} = XPathResult;
    let elements = prefix ? scopedQuerySelectorAll(subtree, prefix) : [subtree];
    for (let parent of elements) {
      let result = this._expression.evaluate(parent, flag, null);
      for (let i = 0, {snapshotLength} = result; i < snapshotLength; i++)
        yield result.snapshotItem(i);
    }
  }
}

class ContainsSelector {
  constructor(textContent) {
    this.dependsOnCharacterData = true;

    this._regexp = makeRegExpParameter(textContent);
  }

  *getSelectors(prefix, subtree, targets) {
    for (let element of this.getElements(prefix, subtree, targets))
      yield [makeSelector(element), subtree];
  }

  *getElements(prefix, subtree, targets) {
    let actualPrefix = (!prefix || incompletePrefixRegexp.test(prefix)) ?
      prefix + "*" : prefix;

    let elements = scopedQuerySelectorAll(subtree, actualPrefix);

    if (elements) {
      let lastRoot = null;
      for (let element of elements) {
        // For a filter like div:-abp-contains(Hello) and a subtree like
        // <div id="a"><div id="b"><div id="c">Hello</div></div></div>
        // we're only interested in div#a
        if (lastRoot && lastRoot.contains(element)) {
          yield null;
          continue;
        }

        lastRoot = element;

        if (targets && !targets.some(target => element.contains(target) ||
                                               target.contains(element))) {
          yield null;
          continue;
        }

        if (testInfo)
          testInfo.lastProcessedElements.add(element);

        if (this._regexp && this._regexp.test(element.textContent))
          yield element;
        else
          yield null;
      }
    }
  }
}

class PropsSelector {
  constructor(propertyExpression) {
    this.dependsOnStyles = true;
    this.maybeDependsOnAttributes = true;

    let regexpString;
    if (propertyExpression.length >= 2 && propertyExpression[0] == "/" &&
        propertyExpression[propertyExpression.length - 1] == "/")
      regexpString = propertyExpression.slice(1, -1);
    else
      regexpString = filterToRegExp(propertyExpression);

    this._regexp = new RegExp(regexpString, "i");

    this._subSelectors = [];
  }

  *getSelectors(prefix, subtree, targets) {
    for (let subSelector of this._subSelectors) {
      if (subSelector.startsWith("*") &&
          !incompletePrefixRegexp.test(prefix))
        subSelector = subSelector.substring(1);

      yield [qualifySelector(subSelector, prefix), subtree];
    }
  }

  setStyles(styles) {
    this._subSelectors = [];
    for (let style of styles) {
      if (this._regexp.test(style.style)) {
        for (let subSelector of style.subSelectors) {
          let idx = subSelector.lastIndexOf("::");
          if (idx != -1)
            subSelector = subSelector.substring(0, idx);

          this._subSelectors.push(subSelector);
        }
      }
    }
  }
}

class Pattern {
  constructor(selectors, text) {
    this.selectors = selectors;
    this.text = text;
  }

  get dependsOnStyles() {
    return getCachedPropertyValue(
      this, "_dependsOnStyles", () => this.selectors.some(
        selector => selector.dependsOnStyles
      )
    );
  }

  get maybeDependsOnAttributes() {
    // Observe changes to attributes if either there's a plain selector that
    // looks like an ID selector, class selector, or attribute selector in one
    // of the patterns (e.g. "a[href='https://example.com/']")
    // or there's a properties selector nested inside a has selector
    // (e.g. "div:-abp-has(:-abp-properties(color: blue))")
    return getCachedPropertyValue(
      this, "_maybeDependsOnAttributes", () => this.selectors.some(
        selector => selector.maybeDependsOnAttributes ||
                    (selector instanceof HasSelector &&
                     selector.dependsOnStyles)
      )
    );
  }

  get dependsOnCharacterData() {
    // Observe changes to character data only if there's a contains selector in
    // one of the patterns.
    return getCachedPropertyValue(
      this, "_dependsOnCharacterData", () => this.selectors.some(
        selector => selector.dependsOnCharacterData
      )
    );
  }

  get maybeContainsSiblingCombinators() {
    return getCachedPropertyValue(
      this, "_maybeContainsSiblingCombinators", () => this.selectors.some(
        selector => selector.maybeContainsSiblingCombinators
      )
    );
  }

  matchesMutationTypes(mutationTypes) {
    let mutationTypeMatchMap = getCachedPropertyValue(
      this, "_mutationTypeMatchMap", () => new Map([
        // All types of DOM-dependent patterns are affected by mutations of
        // type "childList".
        ["childList", true],
        ["attributes", this.maybeDependsOnAttributes],
        ["characterData", this.dependsOnCharacterData]
      ])
    );

    for (let mutationType of mutationTypes) {
      if (mutationTypeMatchMap.get(mutationType))
        return true;
    }

    return false;
  }

  /**
   * Generator function returning CSS selectors for all elements that
   * match the pattern.
   *
   * This allows transforming from selectors that may contain custom
   * :-abp- selectors to pure CSS selectors that can be used to select
   * elements.
   *
   * The selectors returned from this function may be invalidated by DOM
   * mutations.
   *
   * @param {Node} subtree the subtree we work on
   * @param {Node[]} [targets] the nodes we are interested in. May be
   * used to optimize search.
   */
  *evaluate(subtree, targets) {
    let selectors = this.selectors;
    function* evaluateInner(index, prefix, currentSubtree) {
      if (index >= selectors.length) {
        yield prefix;
        return;
      }
      for (let [selector, element] of selectors[index].getSelectors(
        prefix, currentSubtree, targets
      )) {
        if (selector == null)
          yield null;
        else
          yield* evaluateInner(index + 1, selector, element);
      }
      // Just in case the getSelectors() generator above had to run some heavy
      // document.querySelectorAll() call which didn't produce any results, make
      // sure there is at least one point where execution can pause.
      yield null;
    }
    yield* evaluateInner(0, "", subtree);
  }

  /**
   * Checks if a pattern matches a specific element
   * @param {Node} [target] the element we're interested in checking for
   * matches on.
   * @param {Node} subtree the subtree we work on
   * @return {bool}
   */
  matches(target, subtree) {
    let targetFilter = [target];
    if (this.maybeContainsSiblingCombinators)
      targetFilter = null;

    let selectorGenerator = this.evaluate(subtree, targetFilter);
    for (let selector of selectorGenerator) {
      if (selector && target.matches(selector))
        return true;
    }
    return false;
  }

  setStyles(styles) {
    for (let selector of this.selectors) {
      if (selector.dependsOnStyles)
        selector.setStyles(styles);
    }
  }
}

function extractMutationTypes(mutations) {
  let types = new Set();

  for (let mutation of mutations) {
    types.add(mutation.type);

    // There are only 3 types of mutations: "attributes", "characterData", and
    // "childList".
    if (types.size == 3)
      break;
  }

  return types;
}

function extractMutationTargets(mutations) {
  if (!mutations)
    return null;

  let targets = new Set();

  for (let mutation of mutations) {
    if (mutation.type == "childList") {
      // When new nodes are added, we're interested in the added nodes rather
      // than the parent.
      for (let node of mutation.addedNodes)
        targets.add(node);
      if (mutation.removedNodes.length > 0)
        targets.add(mutation.target);
    }
    else {
      targets.add(mutation.target);
    }
  }

  return [...targets];
}

function filterPatterns(patterns, {stylesheets, mutations}) {
  if (!stylesheets && !mutations)
    return patterns.slice();

  let mutationTypes = mutations ? extractMutationTypes(mutations) : null;

  return patterns.filter(
    pattern => (stylesheets && pattern.dependsOnStyles) ||
               (mutations && pattern.matchesMutationTypes(mutationTypes))
  );
}

function shouldObserveAttributes(patterns) {
  return patterns.some(pattern => pattern.maybeDependsOnAttributes);
}

function shouldObserveCharacterData(patterns) {
  return patterns.some(pattern => pattern.dependsOnCharacterData);
}

function shouldObserveStyles(patterns) {
  return patterns.some(pattern => pattern.dependsOnStyles);
}

/**
 * @callback hideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 * @param {string[]} elementFilters
 *   The filter text that caused the elements to be hidden
 */

/**
 * @callback unhideElemsFunc
 * @param {Node[]} elements Elements on the page that should be hidden
 */


/**
 * Manages the front-end processing of element hiding emulation filters.
 */
exports.ElemHideEmulation = class ElemHideEmulation {
  /**
   * @param {module:content/elemHideEmulation~hideElemsFunc} hideElemsFunc
   *   A callback that should be provided to do the actual element hiding.
   * @param {module:content/elemHideEmulation~unhideElemsFunc} unhideElemsFunc
   *   A callback that should be provided to unhide previously hidden elements.
   */
  constructor(hideElemsFunc = () => {}, unhideElemsFunc = () => {}) {
    this._filteringInProgress = false;
    this._nextFilteringScheduled = false;
    this._lastInvocation = -minInvocationInterval;
    this._scheduledProcessing = null;

    this.document = document;
    this.hideElemsFunc = hideElemsFunc;
    this.unhideElemsFunc = unhideElemsFunc;
    this.observer = new MutationObserver(this.observe.bind(this));
    this.hiddenElements = new Set();
  }

  isSameOrigin(stylesheet) {
    try {
      return new URL(stylesheet.href).origin == this.document.location.origin;
    }
    catch (e) {
      // Invalid URL, assume that it is first-party.
      return true;
    }
  }

  /**
   * Parse the selector
   * @param {string} selector the selector to parse
   * @return {Array} selectors is an array of objects,
   * or null in case of errors.
   */
  parseSelector(selector) {
    if (selector.length == 0)
      return [];

    let match = abpSelectorRegexp.exec(selector);
    if (!match)
      return [new PlainSelector(selector)];

    let selectors = [];
    if (match.index > 0)
      selectors.push(new PlainSelector(selector.substring(0, match.index)));

    let startIndex = match.index + match[0].length;
    let content = parseSelectorContent(selector, startIndex);
    if (!content) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector} ` +
                                   "due to unmatched parentheses."));
      return null;
    }
    if (match[1] == "-abp-properties") {
      selectors.push(new PropsSelector(content.text));
    }
    else if (match[1] == "-abp-has" || match[1] == "has") {
      let hasSelectors = this.parseSelector(content.text);
      if (hasSelectors == null)
        return null;
      selectors.push(new HasSelector(hasSelectors));
    }
    else if (match[1] == "-abp-contains" || match[1] == "has-text") {
      selectors.push(new ContainsSelector(content.text));
    }
    else if (match[1] === "xpath") {
      try {
        selectors.push(new XPathSelector(content.text));
      }
      catch ({message}) {
        console.warn(
          new SyntaxError(
            "Failed to parse Adblock Plus " +
            `selector ${selector}, invalid ` +
            `xpath: ${content.text} ` +
            `error: ${message}.`
          )
        );

        return null;
      }
    }
    else if (match[1] == "not") {
      let notSelectors = this.parseSelector(content.text);
      if (notSelectors == null)
        return null;

      // if all of the inner selectors are PlainSelectors, then we
      // don't actually need to use our selector at all. We're better
      // off delegating to the browser :not implementation.
      if (notSelectors.every(s => s instanceof PlainSelector))
        selectors.push(new PlainSelector(`:not(${content.text})`));
      else
        selectors.push(new NotSelector(notSelectors));
    }
    else {
      // this is an error, can't parse selector.
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, invalid ` +
                                   `pseudo-class :${match[1]}().`));
      return null;
    }

    let suffix = this.parseSelector(selector.substring(content.end + 1));
    if (suffix == null)
      return null;

    selectors.push(...suffix);

    if (selectors.length == 1 && selectors[0] instanceof ContainsSelector) {
      console.warn(new SyntaxError("Failed to parse Adblock Plus " +
                                   `selector ${selector}, can't ` +
                                   "have a lonely :-abp-contains()."));
      return null;
    }
    return selectors;
  }

  /**
   * Reads the rules out of CSS stylesheets
   * @param {CSSStyleSheet[]} [stylesheets] The list of stylesheets to
   * read.
   * @return {CSSStyleRule[]}
   */
  _readCssRules(stylesheets) {
    let cssStyles = [];

    for (let stylesheet of stylesheets || []) {
      // Explicitly ignore third-party stylesheets to ensure consistent behavior
      // between Firefox and Chrome.
      if (!this.isSameOrigin(stylesheet))
        continue;

      let rules;
      try {
        rules = stylesheet.cssRules;
      }
      catch (e) {
        // On Firefox, there is a chance that an InvalidAccessError
        // get thrown when accessing cssRules. Just skip the stylesheet
        // in that case.
        // See https://searchfox.org/mozilla-central/rev/f65d7528e34ef1a7665b4a1a7b7cdb1388fcd3aa/layout/style/StyleSheet.cpp#699
        continue;
      }

      if (!rules)
        continue;

      for (let rule of rules) {
        if (rule.type != rule.STYLE_RULE)
          continue;

        cssStyles.push(stringifyStyle(rule));
      }
    }
    return cssStyles;
  }

  /**
   * Processes the current document and applies all rules to it.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    The list of new stylesheets that have been added to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, all of document's stylesheets will be considered
   *    then and all rules, including the ones not dependent on styles.
   * @param {MutationRecord[]} [mutations]
   *    The list of DOM mutations that have been applied to the document and
   *    made reprocessing necessary. This parameter shouldn't be passed in for
   *    the initial processing, the entire document will be considered
   *    then and all rules, including the ones not dependent on the DOM.
   * @return {Promise}
   *    A promise that is fulfilled once all filtering is completed
   */
  async _addSelectors(stylesheets, mutations) {
    if (testInfo)
      testInfo.lastProcessedElements.clear();

    let deadline = newIdleDeadline();

    if (shouldObserveStyles(this.patterns))
      this._refreshPatternStyles();

    let patternsToCheck = filterPatterns(
      this.patterns, {stylesheets, mutations}
    );

    let targets = extractMutationTargets(mutations);

    let elementsToHide = [];
    let elementFilters = [];
    let elementsToUnhide = new Set(this.hiddenElements);

    for (let pattern of patternsToCheck) {
      let evaluationTargets = targets;

      // If the pattern appears to contain any sibling combinators, we can't
      // easily optimize based on the mutation targets. Since this is a
      // special case, skip the optimization. By setting it to null here we
      // make sure we process the entire DOM.
      if (pattern.maybeContainsSiblingCombinators)
        evaluationTargets = null;

      let generator = pattern.evaluate(this.document, evaluationTargets);
      for (let selector of generator) {
        if (selector != null) {
          for (let element of this.document.querySelectorAll(selector)) {
            if (!this.hiddenElements.has(element)) {
              elementsToHide.push(element);
              elementFilters.push(pattern.text);
            }
            else {
              elementsToUnhide.delete(element);
            }
          }
        }

        if (deadline.timeRemaining() <= 0)
          deadline = await yieldThread();
      }
    }
    this._hideElems(elementsToHide, elementFilters);

    // The search for elements to hide it optimized to find new things
    // to hide quickly, by not checking all patterns and not checking
    // the full DOM. That's why we need to do a more thorough check
    // for each remaining element that might need to be unhidden,
    // checking all patterns.
    for (let elem of elementsToUnhide) {
      if (!elem.isConnected) {
        // elements that are no longer in the DOM should be unhidden
        // in case they're ever readded, and then forgotten about so
        // we don't cause a memory leak.
        continue;
      }
      let matchesAny = this.patterns.some(pattern => pattern.matches(
        elem, this.document
      ));
      if (matchesAny)
        elementsToUnhide.delete(elem);

      if (deadline.timeRemaining() <= 0)
        deadline = await yieldThread();
    }
    this._unhideElems(Array.from(elementsToUnhide));
  }

  _hideElems(elementsToHide, elementFilters) {
    if (elementsToHide.length > 0) {
      this.hideElemsFunc(elementsToHide, elementFilters);
      for (let elem of elementsToHide)
        this.hiddenElements.add(elem);
    }
  }

  _unhideElems(elementsToUnhide) {
    if (elementsToUnhide.length > 0) {
      this.unhideElemsFunc(elementsToUnhide);
      for (let elem of elementsToUnhide)
        this.hiddenElements.delete(elem);
    }
  }

  /**
   * Performed any scheduled processing.
   *
   * This function is asyncronous, and should not be run multiple
   * times in parallel. The flag `_filteringInProgress` is set and
   * unset so you can check if it's already running.
   * @return {Promise}
   *  A promise that is fulfilled once all filtering is completed
   */
  async _processFiltering() {
    if (this._filteringInProgress) {
      console.warn("ElemHideEmulation scheduling error: " +
                   "Tried to process filtering in parallel.");
      if (testInfo) {
        testInfo.failedAssertions.push(
          "Tried to process filtering in parallel"
        );
      }
      return;
    }
    let params = this._scheduledProcessing || {};
    this._scheduledProcessing = null;
    this._filteringInProgress = true;
    this._nextFilteringScheduled = false;
    await this._addSelectors(
      params.stylesheets,
      params.mutations
    );
    this._lastInvocation = performance.now();
    this._filteringInProgress = false;
    if (this._scheduledProcessing)
      this._scheduleNextFiltering();
  }

  /**
   * Appends new changes to the list of filters for the next time
   * filtering is run.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  _appendScheduledProcessing(stylesheets, mutations) {
    if (!this._scheduledProcessing) {
      // There isn't anything scheduled yet. Make the schedule.
      this._scheduledProcessing = {stylesheets, mutations};
    }
    else if (!stylesheets && !mutations) {
      // The new request was to reprocess everything, and so any
      // previous filters are irrelevant.
      this._scheduledProcessing = {};
    }
    else if (this._scheduledProcessing.stylesheets ||
             this._scheduledProcessing.mutations) {
      // The previous filters are not to filter everything, so the new
      // parameters matter. Push them onto the appropriate lists.
      if (stylesheets) {
        if (!this._scheduledProcessing.stylesheets)
          this._scheduledProcessing.stylesheets = [];
        this._scheduledProcessing.stylesheets.push(...stylesheets);
      }
      if (mutations) {
        if (!this._scheduledProcessing.mutations)
          this._scheduledProcessing.mutations = [];
        this._scheduledProcessing.mutations.push(...mutations);
      }
    }
    else {
      // this._scheduledProcessing is already going to recheck
      // everything, so no need to do anything here.
    }
  }

  /**
   * Schedule filtering to be processed in the future, or start
   * processing immediately.
   *
   * If processing is already scheduled, this does nothing.
   */
  _scheduleNextFiltering() {
    if (this._nextFilteringScheduled || this._filteringInProgress) {
      // The next one has already been scheduled. Our new events are
      // on the queue, so nothing more to do.
      return;
    }

    if (this.document.readyState === "loading") {
      // Document isn't fully loaded yet, so schedule our first
      // filtering as soon as that's done.
      this.document.addEventListener(
        "DOMContentLoaded",
        () => this._processFiltering(),
        {once: true}
      );
      this._nextFilteringScheduled = true;
    }
    else if (performance.now() - this._lastInvocation <
             minInvocationInterval) {
      // It hasn't been long enough since our last filter. Set the
      // timeout for when it's time for that.
      setTimeout(
        () => this._processFiltering(),
        minInvocationInterval - (performance.now() - this._lastInvocation)
      );
      this._nextFilteringScheduled = true;
    }
    else {
      // We can actually just start filtering immediately!
      this._processFiltering();
    }
  }

  /**
   * Re-run filtering either immediately or queued.
   * @param {CSSStyleSheet[]} [stylesheets]
   *    new stylesheets to be processed. This parameter should be omitted
   *    for full reprocessing.
   * @param {MutationRecord[]} [mutations]
   *    new DOM mutations to be processed. This parameter should be omitted
   *    for full reprocessing.
   */
  queueFiltering(stylesheets, mutations) {
    this._appendScheduledProcessing(stylesheets, mutations);
    this._scheduleNextFiltering();
  }

  _refreshPatternStyles(stylesheet) {
    let allCssRules = this._readCssRules(this.document.styleSheets);
    for (let pattern of this.patterns)
      pattern.setStyles(allCssRules);
  }

  onLoad(event) {
    let stylesheet = event.target.sheet;
    if (stylesheet)
      this.queueFiltering([stylesheet]);
  }

  observe(mutations) {
    if (testInfo) {
      // In test mode, filter out any mutations likely done by us
      // (i.e. style="display: none !important"). This makes it easier to
      // observe how the code responds to DOM mutations.
      mutations = mutations.filter(
        ({type, attributeName, target: {style: newValue}, oldValue}) =>
          !(type == "attributes" && attributeName == "style" &&
            newValue.display == "none" &&
            toCSSStyleDeclaration(oldValue).display != "none")
      );

      if (mutations.length == 0)
        return;
    }

    this.queueFiltering(null, mutations);
  }

  apply(patterns) {
    this.patterns = [];
    for (let pattern of patterns) {
      let selectors = this.parseSelector(pattern.selector);
      if (selectors != null && selectors.length > 0)
        this.patterns.push(new Pattern(selectors, pattern.text));
    }

    if (this.patterns.length > 0) {
      this.queueFiltering();

      let attributes = shouldObserveAttributes(this.patterns);
      this.observer.observe(
        this.document,
        {
          childList: true,
          attributes,
          attributeOldValue: attributes && !!testInfo,
          characterData: shouldObserveCharacterData(this.patterns),
          subtree: true
        }
      );
      if (shouldObserveStyles(this.patterns)) {
        let onLoad = this.onLoad.bind(this);
        if (this.document.readyState === "loading")
          this.document.addEventListener("DOMContentLoaded", onLoad, true);
        this.document.addEventListener("load", onLoad, true);
      }
    }
  }
};


/***/ }),

/***/ "./node_modules/adblockpluscore/lib/patterns.js":
/*!******************************************************!*\
  !*** ./node_modules/adblockpluscore/lib/patterns.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";
/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

/** @module */



/**
 * The maximum number of patterns that
 * `{@link module:patterns.compilePatterns compilePatterns()}` will compile
 * into regular expressions.
 * @type {number}
 */
const COMPILE_PATTERNS_MAX = 100;

/**
 * Regular expression used to match the `^` suffix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let separatorRegExp = /[\x00-\x24\x26-\x2C\x2F\x3A-\x40\x5B-\x5E\x60\x7B-\x7F]/;

let filterToRegExp =
/**
 * Converts filter text into regular expression string
 * @param {string} text as in Filter()
 * @return {string} regular expression representation of filter text
 * @package
 */
exports.filterToRegExp = function filterToRegExp(text) {
  // remove multiple wildcards
  text = text.replace(/\*+/g, "*");

  // remove leading wildcard
  if (text[0] == "*")
    text = text.substring(1);

  // remove trailing wildcard
  if (text[text.length - 1] == "*")
    text = text.substring(0, text.length - 1);

  return text
    // remove anchors following separator placeholder
    .replace(/\^\|$/, "^")
    // escape special symbols
    .replace(/\W/g, "\\$&")
    // replace wildcards by .*
    .replace(/\\\*/g, ".*")
    // process separator placeholders (all ANSI characters but alphanumeric
    // characters and _%.-)
    .replace(/\\\^/g, `(?:${separatorRegExp.source}|$)`)
    // process extended anchor at expression start
    .replace(/^\\\|\\\|/, "^[\\w\\-]+:\\/+(?:[^\\/]+\\.)?")
    // process anchor at expression start
    .replace(/^\\\|/, "^")
    // process anchor at expression end
    .replace(/\\\|$/, "$");
};

/**
 * Regular expression used to match the `||` prefix in an otherwise literal
 * pattern.
 * @type {RegExp}
 */
let extendedAnchorRegExp = new RegExp(filterToRegExp("||") + "$");

/**
 * Regular expression for matching a keyword in a filter.
 * @type {RegExp}
 */
let keywordRegExp = /[^a-z0-9%*][a-z0-9%]{2,}(?=[^a-z0-9%*])/;

/**
 * Regular expression for matching all keywords in a filter.
 * @type {RegExp}
 */
let allKeywordsRegExp = new RegExp(keywordRegExp, "g");

/**
 * A `CompiledPatterns` object represents the compiled version of multiple URL
 * request patterns. It is returned by
 * `{@link module:patterns.compilePatterns compilePatterns()}`.
 */
class CompiledPatterns {
  /**
   * Creates an object with the given regular expressions for case-sensitive
   * and case-insensitive matching respectively.
   * @param {?RegExp} [caseSensitive]
   * @param {?RegExp} [caseInsensitive]
   * @private
   */
  constructor(caseSensitive, caseInsensitive) {
    this._caseSensitive = caseSensitive;
    this._caseInsensitive = caseInsensitive;
  }

  /**
   * Tests whether the given URL request matches the patterns used to create
   * this object.
   * @param {module:url.URLRequest} request
   * @returns {boolean}
   */
  test(request) {
    return ((this._caseSensitive &&
             this._caseSensitive.test(request.href)) ||
            (this._caseInsensitive &&
             this._caseInsensitive.test(request.lowerCaseHref)));
  }
}

/**
 * Compiles patterns from the given filters into a single
 * `{@link module:patterns~CompiledPatterns CompiledPatterns}` object.
 *
 * @param {module:filterClasses.URLFilter|
 *         Set.<module:filterClasses.URLFilter>} filters
 *   The filters. If the number of filters exceeds
 *   `{@link module:patterns~COMPILE_PATTERNS_MAX COMPILE_PATTERNS_MAX}`, the
 *   function returns `null`.
 *
 * @returns {?module:patterns~CompiledPatterns}
 *
 * @package
 */
exports.compilePatterns = function compilePatterns(filters) {
  let list = Array.isArray(filters) ? filters : [filters];

  // If the number of filters is too large, it may choke especially on low-end
  // platforms. As a precaution, we refuse to compile. Ideally we would check
  // the length of the regular expression source rather than the number of
  // filters, but this is far more straightforward and practical.
  if (list.length > COMPILE_PATTERNS_MAX)
    return null;

  let caseSensitive = "";
  let caseInsensitive = "";

  for (let filter of filters) {
    let source = filter.urlPattern.regexpSource;

    if (filter.matchCase)
      caseSensitive += source + "|";
    else
      caseInsensitive += source + "|";
  }

  let caseSensitiveRegExp = null;
  let caseInsensitiveRegExp = null;

  try {
    if (caseSensitive)
      caseSensitiveRegExp = new RegExp(caseSensitive.slice(0, -1));

    if (caseInsensitive)
      caseInsensitiveRegExp = new RegExp(caseInsensitive.slice(0, -1));
  }
  catch (error) {
    // It is possible in theory for the regular expression to be too large
    // despite COMPILE_PATTERNS_MAX
    return null;
  }

  return new CompiledPatterns(caseSensitiveRegExp, caseInsensitiveRegExp);
};

/**
 * Patterns for matching against URLs.
 *
 * Internally, this may be a RegExp or match directly against the
 * pattern for simple literal patterns.
 */
exports.Pattern = class Pattern {
  /**
   * @param {string} pattern pattern that requests URLs should be
   * matched against in filter text notation
   * @param {bool} matchCase `true` if comparisons must be case
   * sensitive
   */
  constructor(pattern, matchCase) {
    this.matchCase = matchCase || false;

    if (!this.matchCase)
      pattern = pattern.toLowerCase();

    if (pattern.length >= 2 &&
        pattern[0] == "/" &&
        pattern[pattern.length - 1] == "/") {
      // The filter is a regular expression - convert it immediately to
      // catch syntax errors
      pattern = pattern.substring(1, pattern.length - 1);
      this._regexp = new RegExp(pattern);
    }
    else {
      // Patterns like /foo/bar/* exist so that they are not treated as regular
      // expressions. We drop any superfluous wildcards here so our
      // optimizations can kick in.
      pattern = pattern.replace(/^\*+/, "").replace(/\*+$/, "");

      // No need to convert this filter to regular expression yet, do it on
      // demand
      this.pattern = pattern;
    }
  }

  /**
   * Checks whether the pattern is a string of literal characters with
   * no wildcards or any other special characters.
   *
   * If the pattern is prefixed with a `||` or suffixed with a `^` but otherwise
   * contains no special characters, it is still considered to be a literal
   * pattern.
   *
   * @returns {boolean}
   */
  isLiteralPattern() {
    return typeof this.pattern !== "undefined" &&
      !/[*^|]/.test(this.pattern.replace(/^\|{1,2}/, "").replace(/[|^]$/, ""));
  }

  /**
   * Regular expression to be used when testing against this pattern.
   *
   * null if the pattern is matched without using regular expressions.
   * @type {RegExp}
   */
  get regexp() {
    if (typeof this._regexp == "undefined") {
      this._regexp = this.isLiteralPattern() ?
        null : new RegExp(filterToRegExp(this.pattern));
    }
    return this._regexp;
  }

  /**
   * Pattern in regular expression notation. This will have a value
   * even if `regexp` returns null.
   * @type {string}
   */
  get regexpSource() {
    return this._regexp ? this._regexp.source : filterToRegExp(this.pattern);
  }

  /**
   * Checks whether the given URL request matches this filter's pattern.
   * @param {module:url.URLRequest} request The URL request to check.
   * @returns {boolean} `true` if the URL request matches.
   */
  matchesLocation(request) {
    let location = this.matchCase ? request.href : request.lowerCaseHref;
    let regexp = this.regexp;
    if (regexp)
      return regexp.test(location);

    let pattern = this.pattern;
    let startsWithAnchor = pattern[0] == "|";
    let startsWithExtendedAnchor = startsWithAnchor && pattern[1] == "|";
    let endsWithSeparator = pattern[pattern.length - 1] == "^";
    let endsWithAnchor = !endsWithSeparator &&
        pattern[pattern.length - 1] == "|";

    if (startsWithExtendedAnchor)
      pattern = pattern.substr(2);
    else if (startsWithAnchor)
      pattern = pattern.substr(1);

    if (endsWithSeparator || endsWithAnchor)
      pattern = pattern.slice(0, -1);

    let index = location.indexOf(pattern);

    while (index != -1) {
      // The "||" prefix requires that the text that follows does not start
      // with a forward slash.
      if ((startsWithExtendedAnchor ?
           location[index] != "/" &&
           extendedAnchorRegExp.test(location.substring(0, index)) :
           startsWithAnchor ?
           index == 0 :
           true) &&
          (endsWithSeparator ?
           !location[index + pattern.length] ||
           separatorRegExp.test(location[index + pattern.length]) :
           endsWithAnchor ?
           index == location.length - pattern.length :
           true))
        return true;

      if (pattern == "")
        return true;

      index = location.indexOf(pattern, index + 1);
    }

    return false;
  }

  /**
   * Checks whether the pattern has keywords
   * @returns {boolean}
   */
  hasKeywords() {
    return this.pattern && keywordRegExp.test(this.pattern);
  }

  /**
   * Finds all keywords that could be associated with this pattern
   * @returns {string[]}
   */
  keywordCandidates() {
    if (!this.pattern)
      return null;
    return this.pattern.toLowerCase().match(allKeywordsRegExp);
  }
};


/***/ }),

/***/ "./node_modules/webextension-polyfill/dist/browser-polyfill.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webextension-polyfill/dist/browser-polyfill.js ***!
  \*********************************************************************/
/***/ (function(module, exports) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
		__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
		(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else { var mod; }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (module) {
  /* webextension-polyfill - v0.8.0 - Tue Apr 20 2021 11:27:38 */

  /* -*- Mode: indent-tabs-mode: nil; js-indent-level: 2 -*- */

  /* vim: set sts=2 sw=2 et tw=80: */

  /* This Source Code Form is subject to the terms of the Mozilla Public
   * License, v. 2.0. If a copy of the MPL was not distributed with this
   * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
  "use strict";

  if (typeof browser === "undefined" || Object.getPrototypeOf(browser) !== Object.prototype) {
    const CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE = "The message port closed before a response was received.";
    const SEND_RESPONSE_DEPRECATION_WARNING = "Returning a Promise is the preferred way to send a reply from an onMessage/onMessageExternal listener, as the sendResponse will be removed from the specs (See https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage)"; // Wrapping the bulk of this polyfill in a one-time-use function is a minor
    // optimization for Firefox. Since Spidermonkey does not fully parse the
    // contents of a function until the first time it's called, and since it will
    // never actually need to be called, this allows the polyfill to be included
    // in Firefox nearly for free.

    const wrapAPIs = extensionAPIs => {
      // NOTE: apiMetadata is associated to the content of the api-metadata.json file
      // at build time by replacing the following "include" with the content of the
      // JSON file.
      const apiMetadata = {
        "alarms": {
          "clear": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "clearAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "get": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "bookmarks": {
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getChildren": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getRecent": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getSubTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTree": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeTree": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "browserAction": {
          "disable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "enable": {
            "minArgs": 0,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "getBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getBadgeText": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "openPopup": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setBadgeBackgroundColor": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setBadgeText": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "browsingData": {
          "remove": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "removeCache": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCookies": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeDownloads": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFormData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeHistory": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeLocalStorage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePasswords": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removePluginData": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "settings": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "commands": {
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "contextMenus": {
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "cookies": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAllCookieStores": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "set": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "devtools": {
          "inspectedWindow": {
            "eval": {
              "minArgs": 1,
              "maxArgs": 2,
              "singleCallbackArg": false
            }
          },
          "panels": {
            "create": {
              "minArgs": 3,
              "maxArgs": 3,
              "singleCallbackArg": true
            },
            "elements": {
              "createSidebarPane": {
                "minArgs": 1,
                "maxArgs": 1
              }
            }
          }
        },
        "downloads": {
          "cancel": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "download": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "erase": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFileIcon": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "open": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "pause": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeFile": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "resume": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "extension": {
          "isAllowedFileSchemeAccess": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "isAllowedIncognitoAccess": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "history": {
          "addUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "deleteRange": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "deleteUrl": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getVisits": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "search": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "i18n": {
          "detectLanguage": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAcceptLanguages": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "identity": {
          "launchWebAuthFlow": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "idle": {
          "queryState": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "management": {
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getSelf": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "setEnabled": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "uninstallSelf": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "notifications": {
          "clear": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPermissionLevel": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        },
        "pageAction": {
          "getPopup": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getTitle": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "hide": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setIcon": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "setPopup": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "setTitle": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          },
          "show": {
            "minArgs": 1,
            "maxArgs": 1,
            "fallbackToNoCallback": true
          }
        },
        "permissions": {
          "contains": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "request": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "runtime": {
          "getBackgroundPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getPlatformInfo": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "openOptionsPage": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "requestUpdateCheck": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "sendMessage": {
            "minArgs": 1,
            "maxArgs": 3
          },
          "sendNativeMessage": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "setUninstallURL": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "sessions": {
          "getDevices": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getRecentlyClosed": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "restore": {
            "minArgs": 0,
            "maxArgs": 1
          }
        },
        "storage": {
          "local": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          },
          "managed": {
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            }
          },
          "sync": {
            "clear": {
              "minArgs": 0,
              "maxArgs": 0
            },
            "get": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "getBytesInUse": {
              "minArgs": 0,
              "maxArgs": 1
            },
            "remove": {
              "minArgs": 1,
              "maxArgs": 1
            },
            "set": {
              "minArgs": 1,
              "maxArgs": 1
            }
          }
        },
        "tabs": {
          "captureVisibleTab": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "create": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "detectLanguage": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "discard": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "duplicate": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "executeScript": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 0
          },
          "getZoom": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getZoomSettings": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goBack": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "goForward": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "highlight": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "insertCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "move": {
            "minArgs": 2,
            "maxArgs": 2
          },
          "query": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "reload": {
            "minArgs": 0,
            "maxArgs": 2
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "removeCSS": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "sendMessage": {
            "minArgs": 2,
            "maxArgs": 3
          },
          "setZoom": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "setZoomSettings": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "update": {
            "minArgs": 1,
            "maxArgs": 2
          }
        },
        "topSites": {
          "get": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "webNavigation": {
          "getAllFrames": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "getFrame": {
            "minArgs": 1,
            "maxArgs": 1
          }
        },
        "webRequest": {
          "handlerBehaviorChanged": {
            "minArgs": 0,
            "maxArgs": 0
          }
        },
        "windows": {
          "create": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "get": {
            "minArgs": 1,
            "maxArgs": 2
          },
          "getAll": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getCurrent": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "getLastFocused": {
            "minArgs": 0,
            "maxArgs": 1
          },
          "remove": {
            "minArgs": 1,
            "maxArgs": 1
          },
          "update": {
            "minArgs": 2,
            "maxArgs": 2
          }
        }
      };

      if (Object.keys(apiMetadata).length === 0) {
        throw new Error("api-metadata.json has not been included in browser-polyfill");
      }
      /**
       * A WeakMap subclass which creates and stores a value for any key which does
       * not exist when accessed, but behaves exactly as an ordinary WeakMap
       * otherwise.
       *
       * @param {function} createItem
       *        A function which will be called in order to create the value for any
       *        key which does not exist, the first time it is accessed. The
       *        function receives, as its only argument, the key being created.
       */


      class DefaultWeakMap extends WeakMap {
        constructor(createItem, items = undefined) {
          super(items);
          this.createItem = createItem;
        }

        get(key) {
          if (!this.has(key)) {
            this.set(key, this.createItem(key));
          }

          return super.get(key);
        }

      }
      /**
       * Returns true if the given object is an object with a `then` method, and can
       * therefore be assumed to behave as a Promise.
       *
       * @param {*} value The value to test.
       * @returns {boolean} True if the value is thenable.
       */


      const isThenable = value => {
        return value && typeof value === "object" && typeof value.then === "function";
      };
      /**
       * Creates and returns a function which, when called, will resolve or reject
       * the given promise based on how it is called:
       *
       * - If, when called, `chrome.runtime.lastError` contains a non-null object,
       *   the promise is rejected with that value.
       * - If the function is called with exactly one argument, the promise is
       *   resolved to that value.
       * - Otherwise, the promise is resolved to an array containing all of the
       *   function's arguments.
       *
       * @param {object} promise
       *        An object containing the resolution and rejection functions of a
       *        promise.
       * @param {function} promise.resolve
       *        The promise's resolution function.
       * @param {function} promise.reject
       *        The promise's rejection function.
       * @param {object} metadata
       *        Metadata about the wrapped method which has created the callback.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function}
       *        The generated callback function.
       */


      const makeCallback = (promise, metadata) => {
        return (...callbackArgs) => {
          if (extensionAPIs.runtime.lastError) {
            promise.reject(new Error(extensionAPIs.runtime.lastError.message));
          } else if (metadata.singleCallbackArg || callbackArgs.length <= 1 && metadata.singleCallbackArg !== false) {
            promise.resolve(callbackArgs[0]);
          } else {
            promise.resolve(callbackArgs);
          }
        };
      };

      const pluralizeArguments = numArgs => numArgs == 1 ? "argument" : "arguments";
      /**
       * Creates a wrapper function for a method with the given name and metadata.
       *
       * @param {string} name
       *        The name of the method which is being wrapped.
       * @param {object} metadata
       *        Metadata about the method being wrapped.
       * @param {integer} metadata.minArgs
       *        The minimum number of arguments which must be passed to the
       *        function. If called with fewer than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {integer} metadata.maxArgs
       *        The maximum number of arguments which may be passed to the
       *        function. If called with more than this number of arguments, the
       *        wrapper will raise an exception.
       * @param {boolean} metadata.singleCallbackArg
       *        Whether or not the promise is resolved with only the first
       *        argument of the callback, alternatively an array of all the
       *        callback arguments is resolved. By default, if the callback
       *        function is invoked with only a single argument, that will be
       *        resolved to the promise, while all arguments will be resolved as
       *        an array if multiple are given.
       *
       * @returns {function(object, ...*)}
       *       The generated wrapper function.
       */


      const wrapAsyncFunction = (name, metadata) => {
        return function asyncFunctionWrapper(target, ...args) {
          if (args.length < metadata.minArgs) {
            throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
          }

          if (args.length > metadata.maxArgs) {
            throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
          }

          return new Promise((resolve, reject) => {
            if (metadata.fallbackToNoCallback) {
              // This API method has currently no callback on Chrome, but it return a promise on Firefox,
              // and so the polyfill will try to call it with a callback first, and it will fallback
              // to not passing the callback if the first call fails.
              try {
                target[name](...args, makeCallback({
                  resolve,
                  reject
                }, metadata));
              } catch (cbError) {
                console.warn(`${name} API method doesn't seem to support the callback parameter, ` + "falling back to call it without a callback: ", cbError);
                target[name](...args); // Update the API method metadata, so that the next API calls will not try to
                // use the unsupported callback anymore.

                metadata.fallbackToNoCallback = false;
                metadata.noCallback = true;
                resolve();
              }
            } else if (metadata.noCallback) {
              target[name](...args);
              resolve();
            } else {
              target[name](...args, makeCallback({
                resolve,
                reject
              }, metadata));
            }
          });
        };
      };
      /**
       * Wraps an existing method of the target object, so that calls to it are
       * intercepted by the given wrapper function. The wrapper function receives,
       * as its first argument, the original `target` object, followed by each of
       * the arguments passed to the original method.
       *
       * @param {object} target
       *        The original target object that the wrapped method belongs to.
       * @param {function} method
       *        The method being wrapped. This is used as the target of the Proxy
       *        object which is created to wrap the method.
       * @param {function} wrapper
       *        The wrapper function which is called in place of a direct invocation
       *        of the wrapped method.
       *
       * @returns {Proxy<function>}
       *        A Proxy object for the given method, which invokes the given wrapper
       *        method in its place.
       */


      const wrapMethod = (target, method, wrapper) => {
        return new Proxy(method, {
          apply(targetMethod, thisObj, args) {
            return wrapper.call(thisObj, target, ...args);
          }

        });
      };

      let hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
      /**
       * Wraps an object in a Proxy which intercepts and wraps certain methods
       * based on the given `wrappers` and `metadata` objects.
       *
       * @param {object} target
       *        The target object to wrap.
       *
       * @param {object} [wrappers = {}]
       *        An object tree containing wrapper functions for special cases. Any
       *        function present in this object tree is called in place of the
       *        method in the same location in the `target` object tree. These
       *        wrapper methods are invoked as described in {@see wrapMethod}.
       *
       * @param {object} [metadata = {}]
       *        An object tree containing metadata used to automatically generate
       *        Promise-based wrapper functions for asynchronous. Any function in
       *        the `target` object tree which has a corresponding metadata object
       *        in the same location in the `metadata` tree is replaced with an
       *        automatically-generated wrapper function, as described in
       *        {@see wrapAsyncFunction}
       *
       * @returns {Proxy<object>}
       */

      const wrapObject = (target, wrappers = {}, metadata = {}) => {
        let cache = Object.create(null);
        let handlers = {
          has(proxyTarget, prop) {
            return prop in target || prop in cache;
          },

          get(proxyTarget, prop, receiver) {
            if (prop in cache) {
              return cache[prop];
            }

            if (!(prop in target)) {
              return undefined;
            }

            let value = target[prop];

            if (typeof value === "function") {
              // This is a method on the underlying object. Check if we need to do
              // any wrapping.
              if (typeof wrappers[prop] === "function") {
                // We have a special-case wrapper for this method.
                value = wrapMethod(target, target[prop], wrappers[prop]);
              } else if (hasOwnProperty(metadata, prop)) {
                // This is an async method that we have metadata for. Create a
                // Promise wrapper for it.
                let wrapper = wrapAsyncFunction(prop, metadata[prop]);
                value = wrapMethod(target, target[prop], wrapper);
              } else {
                // This is a method that we don't know or care about. Return the
                // original method, bound to the underlying object.
                value = value.bind(target);
              }
            } else if (typeof value === "object" && value !== null && (hasOwnProperty(wrappers, prop) || hasOwnProperty(metadata, prop))) {
              // This is an object that we need to do some wrapping for the children
              // of. Create a sub-object wrapper for it with the appropriate child
              // metadata.
              value = wrapObject(value, wrappers[prop], metadata[prop]);
            } else if (hasOwnProperty(metadata, "*")) {
              // Wrap all properties in * namespace.
              value = wrapObject(value, wrappers[prop], metadata["*"]);
            } else {
              // We don't need to do any wrapping for this property,
              // so just forward all access to the underlying object.
              Object.defineProperty(cache, prop, {
                configurable: true,
                enumerable: true,

                get() {
                  return target[prop];
                },

                set(value) {
                  target[prop] = value;
                }

              });
              return value;
            }

            cache[prop] = value;
            return value;
          },

          set(proxyTarget, prop, value, receiver) {
            if (prop in cache) {
              cache[prop] = value;
            } else {
              target[prop] = value;
            }

            return true;
          },

          defineProperty(proxyTarget, prop, desc) {
            return Reflect.defineProperty(cache, prop, desc);
          },

          deleteProperty(proxyTarget, prop) {
            return Reflect.deleteProperty(cache, prop);
          }

        }; // Per contract of the Proxy API, the "get" proxy handler must return the
        // original value of the target if that value is declared read-only and
        // non-configurable. For this reason, we create an object with the
        // prototype set to `target` instead of using `target` directly.
        // Otherwise we cannot return a custom object for APIs that
        // are declared read-only and non-configurable, such as `chrome.devtools`.
        //
        // The proxy handlers themselves will still use the original `target`
        // instead of the `proxyTarget`, so that the methods and properties are
        // dereferenced via the original targets.

        let proxyTarget = Object.create(target);
        return new Proxy(proxyTarget, handlers);
      };
      /**
       * Creates a set of wrapper functions for an event object, which handles
       * wrapping of listener functions that those messages are passed.
       *
       * A single wrapper is created for each listener function, and stored in a
       * map. Subsequent calls to `addListener`, `hasListener`, or `removeListener`
       * retrieve the original wrapper, so that  attempts to remove a
       * previously-added listener work as expected.
       *
       * @param {DefaultWeakMap<function, function>} wrapperMap
       *        A DefaultWeakMap object which will create the appropriate wrapper
       *        for a given listener function when one does not exist, and retrieve
       *        an existing one when it does.
       *
       * @returns {object}
       */


      const wrapEvent = wrapperMap => ({
        addListener(target, listener, ...args) {
          target.addListener(wrapperMap.get(listener), ...args);
        },

        hasListener(target, listener) {
          return target.hasListener(wrapperMap.get(listener));
        },

        removeListener(target, listener) {
          target.removeListener(wrapperMap.get(listener));
        }

      });

      const onRequestFinishedWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps an onRequestFinished listener function so that it will return a
         * `getContent()` property which returns a `Promise` rather than using a
         * callback API.
         *
         * @param {object} req
         *        The HAR entry object representing the network request.
         */


        return function onRequestFinished(req) {
          const wrappedReq = wrapObject(req, {}
          /* wrappers */
          , {
            getContent: {
              minArgs: 0,
              maxArgs: 0
            }
          });
          listener(wrappedReq);
        };
      }); // Keep track if the deprecation warning has been logged at least once.

      let loggedSendResponseDeprecationWarning = false;
      const onMessageWrappers = new DefaultWeakMap(listener => {
        if (typeof listener !== "function") {
          return listener;
        }
        /**
         * Wraps a message listener function so that it may send responses based on
         * its return value, rather than by returning a sentinel value and calling a
         * callback. If the listener function returns a Promise, the response is
         * sent when the promise either resolves or rejects.
         *
         * @param {*} message
         *        The message sent by the other end of the channel.
         * @param {object} sender
         *        Details about the sender of the message.
         * @param {function(*)} sendResponse
         *        A callback which, when called with an arbitrary argument, sends
         *        that value as a response.
         * @returns {boolean}
         *        True if the wrapped listener returned a Promise, which will later
         *        yield a response. False otherwise.
         */


        return function onMessage(message, sender, sendResponse) {
          let didCallSendResponse = false;
          let wrappedSendResponse;
          let sendResponsePromise = new Promise(resolve => {
            wrappedSendResponse = function (response) {
              if (!loggedSendResponseDeprecationWarning) {
                console.warn(SEND_RESPONSE_DEPRECATION_WARNING, new Error().stack);
                loggedSendResponseDeprecationWarning = true;
              }

              didCallSendResponse = true;
              resolve(response);
            };
          });
          let result;

          try {
            result = listener(message, sender, wrappedSendResponse);
          } catch (err) {
            result = Promise.reject(err);
          }

          const isResultThenable = result !== true && isThenable(result); // If the listener didn't returned true or a Promise, or called
          // wrappedSendResponse synchronously, we can exit earlier
          // because there will be no response sent from this listener.

          if (result !== true && !isResultThenable && !didCallSendResponse) {
            return false;
          } // A small helper to send the message if the promise resolves
          // and an error if the promise rejects (a wrapped sendMessage has
          // to translate the message into a resolved promise or a rejected
          // promise).


          const sendPromisedResult = promise => {
            promise.then(msg => {
              // send the message value.
              sendResponse(msg);
            }, error => {
              // Send a JSON representation of the error if the rejected value
              // is an instance of error, or the object itself otherwise.
              let message;

              if (error && (error instanceof Error || typeof error.message === "string")) {
                message = error.message;
              } else {
                message = "An unexpected error occurred";
              }

              sendResponse({
                __mozWebExtensionPolyfillReject__: true,
                message
              });
            }).catch(err => {
              // Print an error on the console if unable to send the response.
              console.error("Failed to send onMessage rejected reply", err);
            });
          }; // If the listener returned a Promise, send the resolved value as a
          // result, otherwise wait the promise related to the wrappedSendResponse
          // callback to resolve and send it as a response.


          if (isResultThenable) {
            sendPromisedResult(result);
          } else {
            sendPromisedResult(sendResponsePromise);
          } // Let Chrome know that the listener is replying.


          return true;
        };
      });

      const wrappedSendMessageCallback = ({
        reject,
        resolve
      }, reply) => {
        if (extensionAPIs.runtime.lastError) {
          // Detect when none of the listeners replied to the sendMessage call and resolve
          // the promise to undefined as in Firefox.
          // See https://github.com/mozilla/webextension-polyfill/issues/130
          if (extensionAPIs.runtime.lastError.message === CHROME_SEND_MESSAGE_CALLBACK_NO_RESPONSE_MESSAGE) {
            resolve();
          } else {
            reject(new Error(extensionAPIs.runtime.lastError.message));
          }
        } else if (reply && reply.__mozWebExtensionPolyfillReject__) {
          // Convert back the JSON representation of the error into
          // an Error instance.
          reject(new Error(reply.message));
        } else {
          resolve(reply);
        }
      };

      const wrappedSendMessage = (name, metadata, apiNamespaceObj, ...args) => {
        if (args.length < metadata.minArgs) {
          throw new Error(`Expected at least ${metadata.minArgs} ${pluralizeArguments(metadata.minArgs)} for ${name}(), got ${args.length}`);
        }

        if (args.length > metadata.maxArgs) {
          throw new Error(`Expected at most ${metadata.maxArgs} ${pluralizeArguments(metadata.maxArgs)} for ${name}(), got ${args.length}`);
        }

        return new Promise((resolve, reject) => {
          const wrappedCb = wrappedSendMessageCallback.bind(null, {
            resolve,
            reject
          });
          args.push(wrappedCb);
          apiNamespaceObj.sendMessage(...args);
        });
      };

      const staticWrappers = {
        devtools: {
          network: {
            onRequestFinished: wrapEvent(onRequestFinishedWrappers)
          }
        },
        runtime: {
          onMessage: wrapEvent(onMessageWrappers),
          onMessageExternal: wrapEvent(onMessageWrappers),
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 1,
            maxArgs: 3
          })
        },
        tabs: {
          sendMessage: wrappedSendMessage.bind(null, "sendMessage", {
            minArgs: 2,
            maxArgs: 3
          })
        }
      };
      const settingMetadata = {
        clear: {
          minArgs: 1,
          maxArgs: 1
        },
        get: {
          minArgs: 1,
          maxArgs: 1
        },
        set: {
          minArgs: 1,
          maxArgs: 1
        }
      };
      apiMetadata.privacy = {
        network: {
          "*": settingMetadata
        },
        services: {
          "*": settingMetadata
        },
        websites: {
          "*": settingMetadata
        }
      };
      return wrapObject(extensionAPIs, staticWrappers, apiMetadata);
    };

    if (typeof chrome != "object" || !chrome || !chrome.runtime || !chrome.runtime.id) {
      throw new Error("This script should only be loaded in a browser extension.");
    } // The build process adds a UMD wrapper around this file, which makes the
    // `module` variable available.


    module.exports = wrapAPIs(chrome);
  } else {
    module.exports = browser;
  }
});


/***/ }),

/***/ "./sdk/content/allowlisting.js":
/*!*************************************!*\
  !*** ./sdk/content/allowlisting.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "stopOneClickAllowlisting": () => (/* binding */ stopOneClickAllowlisting),
/* harmony export */   "startOneClickAllowlisting": () => (/* binding */ startOneClickAllowlisting)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




const MAX_ERROR_THRESHOLD = 30;
const MAX_QUEUED_EVENTS = 20;
const EVENT_INTERVAL_MS = 100;

let errorCount = 0;
let eventProcessingInterval = null;
let eventQueue = [];

function isEventTrusted(event) {
  return Object.getPrototypeOf(event) === CustomEvent.prototype &&
    !Object.hasOwnProperty.call(event, "detail");
}

async function allowlistDomain(event) {
  if (!isEventTrusted(event))
    return false;

  return (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({
      type: "ewe:allowlist-page",
      timestamp: event.detail.timestamp,
      signature: event.detail.signature
    })
  );
}

async function processNextEvent() {
  let event = eventQueue.shift();
  if (event) {
    try {
      let allowlistingResult = await allowlistDomain(event);
      if (allowlistingResult === true) {
        document.dispatchEvent(new Event("domain_allowlisting_success"));
        stopOneClickAllowlisting();
      }
      else {
        throw new Error("Domain allowlisting rejected");
      }
    }
    catch (e) {
      errorCount++;
      if (errorCount >= MAX_ERROR_THRESHOLD)
        stopOneClickAllowlisting();
    }
  }

  if (!eventQueue.length)
    stopProcessingInterval();
}

function onDomainAllowlistingRequest(event) {
  if (eventQueue.length >= MAX_QUEUED_EVENTS)
    return;

  eventQueue.push(event);
  startProcessingInterval();
}

function startProcessingInterval() {
  if (!eventProcessingInterval) {
    processNextEvent();
    eventProcessingInterval = setInterval(processNextEvent, EVENT_INTERVAL_MS);
  }
}

function stopProcessingInterval() {
  clearInterval(eventProcessingInterval);
  eventProcessingInterval = null;
}

function stopOneClickAllowlisting() {
  document.removeEventListener("domain_allowlisting_request",
                               onDomainAllowlistingRequest, true);
  eventQueue = [];
  stopProcessingInterval();
}

function startOneClickAllowlisting() {
  document.addEventListener("domain_allowlisting_request",
                            onDomainAllowlistingRequest, true);
}


/***/ }),

/***/ "./sdk/content/element-collapsing.js":
/*!*******************************************!*\
  !*** ./sdk/content/element-collapsing.js ***!
  \*******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "hideElement": () => (/* binding */ hideElement),
/* harmony export */   "unhideElement": () => (/* binding */ unhideElement),
/* harmony export */   "startElementCollapsing": () => (/* binding */ startElementCollapsing)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




let collapsedSelectors = new Set();
let observers = new WeakMap();

function getURLFromElement(element) {
  if (element.localName == "object") {
    if (element.data)
      return element.data;

    for (let child of element.children) {
      if (child.localName == "param" && child.name == "movie" && child.value)
        return new URL(child.value, document.baseURI).href;
    }

    return null;
  }

  return element.currentSrc || element.src;
}

function getSelectorForBlockedElement(element) {
  // Setting the "display" CSS property to "none" doesn't have any effect on
  // <frame> elements (in framesets). So we have to hide it inline through
  // the "visibility" CSS property.
  if (element.localName == "frame")
    return null;

  // If the <video> or <audio> element contains any <source> children,
  // we cannot address it in CSS by the source URL; in that case we
  // don't "collapse" it using a CSS selector but rather hide it directly by
  // setting the style="..." attribute.
  if (element.localName == "video" || element.localName == "audio") {
    for (let child of element.children) {
      if (child.localName == "source")
        return null;
    }
  }

  let selector = "";
  for (let attr of ["src", "srcset"]) {
    let value = element.getAttribute(attr);
    if (value && attr in element)
      selector += "[" + attr + "=" + CSS.escape(value) + "]";
  }

  return selector ? element.localName + selector : null;
}

function hideElement(element, properties) {
  let {style} = element;

  if (!properties) {
    if (element.localName == "frame")
      properties = [["visibility", "hidden"]];
    else
      properties = [["display", "none"]];
  }

  for (let [key, value] of properties)
    style.setProperty(key, value, "important");

  if (observers.has(element))
    observers.get(element).disconnect();

  let observer = new MutationObserver(() => {
    for (let [key, value] of properties) {
      if (style.getPropertyValue(key) != value ||
          style.getPropertyPriority(key) != "important")
        style.setProperty(key, value, "important");
    }
  });
  observer.observe(
    element, {
      attributes: true,
      attributeFilter: ["style"]
    }
  );
  observers.set(element, observer);
}

function unhideElement(element) {
  let observer = observers.get(element);
  if (observer) {
    observer.disconnect();
    observers.delete(element);
  }

  let property = element.localName == "frame" ? "visibility" : "display";
  element.style.removeProperty(property);
}

function collapseElement(element) {
  let selector = getSelectorForBlockedElement(element);
  if (!selector) {
    hideElement(element);
    return;
  }

  if (!collapsedSelectors.has(selector)) {
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
      webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({
        type: "ewe:inject-css",
        selector
      })
    );
    collapsedSelectors.add(selector);
  }
}

function hideInAboutBlankFrames(selector, urls) {
  // Resources (e.g. images) loaded into about:blank frames
  // are (sometimes) loaded with the frameId of the main_frame.
  for (let frame of document.querySelectorAll("iframe[src='about:blank']")) {
    if (!frame.contentDocument)
      continue;

    for (let element of frame.contentDocument.querySelectorAll(selector)) {
      // Use hideElement, because we don't have the correct frameId
      // for the "ewe:inject-css" message.
      if (urls.has(getURLFromElement(element)))
        hideElement(element);
    }
  }
}

function startElementCollapsing() {
  let deferred = null;

  webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.onMessage.addListener((message, sender) => {
    if (!message || message.type != "ewe:collapse")
      return false;

    if (document.readyState == "loading") {
      if (!deferred) {
        deferred = new Map();
        document.addEventListener("DOMContentLoaded", () => {
          for (let [selector, urls] of deferred) {
            for (let element of document.querySelectorAll(selector)) {
              if (urls.has(getURLFromElement(element)))
                collapseElement(element);
            }

            hideInAboutBlankFrames(selector, urls);
          }

          deferred = null;
        });
      }

      let urls = deferred.get(message.selector) || new Set();
      deferred.set(message.selector, urls);
      urls.add(message.url);
    }
    else {
      for (let element of document.querySelectorAll(message.selector)) {
        if (getURLFromElement(element) == message.url)
          collapseElement(element);
      }

      hideInAboutBlankFrames(message.selector, new Set([message.url]));
    }
    return true;
  });
}


/***/ }),

/***/ "./sdk/content/element-hiding-tracer.js":
/*!**********************************************!*\
  !*** ./sdk/content/element-hiding-tracer.js ***!
  \**********************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ElementHidingTracer": () => (/* binding */ ElementHidingTracer)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




class ElementHidingTracer {
  constructor(selectors) {
    this.selectors = new Map(selectors);

    this.observer = new MutationObserver(() => {
      this.observer.disconnect();
      setTimeout(() => this.trace(), 1000);
    });

    if (document.readyState == "loading")
      document.addEventListener("DOMContentLoaded", () => this.trace());
    else
      this.trace();
  }

  log(filters, selectors = []) {
    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage(
      {type: "ewe:trace-elem-hide", filters, selectors}
    ));
  }

  trace() {
    let filters = [];
    let selectors = [];

    for (let [selector, filter] of this.selectors) {
      if (document.querySelector(selector)) {
        this.selectors.delete(selector);
        if (filter)
          filters.push(filter);
        else
          selectors.push(selector);
      }
    }

    if (filters.length > 0 || selectors.length > 0)
      this.log(filters, selectors);

    this.observer.observe(document, {childList: true,
                                     attributes: true,
                                     subtree: true});
  }
}


/***/ }),

/***/ "./sdk/content/subscribe-links.js":
/*!****************************************!*\
  !*** ./sdk/content/subscribe-links.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "handleSubscribeLinks": () => (/* binding */ handleSubscribeLinks)
/* harmony export */ });
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */




function handleSubscribeLinks() {
  document.addEventListener("click", event => {
    if (event.button == 2 || !event.isTrusted)
      return;

    let link = event.target;
    while (!(link instanceof HTMLAnchorElement)) {
      link = link.parentNode;

      if (!link)
        return;
    }

    let queryString = null;
    if (link.protocol == "http:" || link.protocol == "https:") {
      if (link.host == "subscribe.adblockplus.org" && link.pathname == "/")
        queryString = link.search.substr(1);
    }
    else {
      // Firefox doesn't seem to populate the "search" property for
      // links with non-standard URL schemes so we need to extract the query
      // string manually.
      let match = /^abp:\/*subscribe\/*\?(.*)/i.exec(link.href);
      if (match)
        queryString = match[1];
    }

    if (!queryString)
      return;

    let title = null;
    let url = null;
    for (let param of queryString.split("&")) {
      let parts = param.split("=", 2);
      if (parts.length != 2 || !/\S/.test(parts[1]))
        continue;
      switch (parts[0]) {
        case "title":
          title = decodeURIComponent(parts[1]);
          break;
        case "location":
          url = decodeURIComponent(parts[1]);
          break;
      }
    }
    if (!url)
      return;

    if (!title)
      title = url;

    title = title.trim();
    url = url.trim();
    if (!/^(https?|ftp):/.test(url))
      return;

    (0,_errors_js__WEBPACK_IMPORTED_MODULE_1__.ignoreNoConnectionError)(
      webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({type: "ewe:subscribe-link-clicked",
                                   title, url})
    );

    event.preventDefault();
    event.stopPropagation();
  }, true);
}


/***/ }),

/***/ "./sdk/errors.js":
/*!***********************!*\
  !*** ./sdk/errors.js ***!
  \***********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ERROR_DUPLICATE_FILTERS": () => (/* binding */ ERROR_DUPLICATE_FILTERS),
/* harmony export */   "ERROR_FILTER_NOT_FOUND": () => (/* binding */ ERROR_FILTER_NOT_FOUND),
/* harmony export */   "ignoreNoConnectionError": () => (/* binding */ ignoreNoConnectionError)
/* harmony export */ });
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */

const ERROR_NO_CONNECTION = "Could not establish connection. " +
      "Receiving end does not exist.";
const ERROR_CLOSED_CONNECTION = "A listener indicated an asynchronous " +
      "response by returning true, but the message channel closed before a " +
      "response was received";

const ERROR_DUPLICATE_FILTERS = "storage_duplicate_filters";
const ERROR_FILTER_NOT_FOUND = "filter_not_found";

function ignoreNoConnectionError(promise) {
  return promise.catch(error => {
    if (typeof error == "object" &&
        (error.message == ERROR_NO_CONNECTION ||
         error.message == ERROR_CLOSED_CONNECTION))
      return;

    throw error;
  });
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!******************************!*\
  !*** ./sdk/content/index.js ***!
  \******************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webextension-polyfill */ "./node_modules/webextension-polyfill/dist/browser-polyfill.js");
/* harmony import */ var adblockpluscore_lib_content_elemHideEmulation_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! adblockpluscore/lib/content/elemHideEmulation.js */ "./node_modules/adblockpluscore/lib/content/elemHideEmulation.js");
/* harmony import */ var _errors_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../errors.js */ "./sdk/errors.js");
/* harmony import */ var _element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./element-collapsing.js */ "./sdk/content/element-collapsing.js");
/* harmony import */ var _allowlisting_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./allowlisting.js */ "./sdk/content/allowlisting.js");
/* harmony import */ var _element_hiding_tracer_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./element-hiding-tracer.js */ "./sdk/content/element-hiding-tracer.js");
/* harmony import */ var _subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./subscribe-links.js */ "./sdk/content/subscribe-links.js");
/*
 * This file is part of eyeo's Web Extension Ad Blocking Toolkit (EWE),
 * Copyright (C) 2006-present eyeo GmbH
 *
 * EWE is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * EWE is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EWE.  If not, see <http://www.gnu.org/licenses/>.
 */











async function initContentFeatures() {
  let response = await (0,_errors_js__WEBPACK_IMPORTED_MODULE_2__.ignoreNoConnectionError)(
    webextension_polyfill__WEBPACK_IMPORTED_MODULE_0__.runtime.sendMessage({type: "ewe:content-hello"})
  );

  if (!response)
    return;

  let tracer;
  if (response.tracedSelectors)
    tracer = new _element_hiding_tracer_js__WEBPACK_IMPORTED_MODULE_5__.ElementHidingTracer(response.tracedSelectors);

  if (response.emulatedPatterns.length > 0) {
    let elemHideEmulation = new adblockpluscore_lib_content_elemHideEmulation_js__WEBPACK_IMPORTED_MODULE_1__.ElemHideEmulation((elements, filters) => {
      for (let element of elements)
        (0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.hideElement)(element, response.cssProperties);

      if (tracer)
        tracer.log(filters);
    }, elements => {
      for (let element of elements)
        (0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.unhideElement)(element);
    });
    elemHideEmulation.apply(response.emulatedPatterns);
  }

  if (response.subscribeLinks)
    (0,_subscribe_links_js__WEBPACK_IMPORTED_MODULE_6__.handleSubscribeLinks)();
}

(0,_element_collapsing_js__WEBPACK_IMPORTED_MODULE_3__.startElementCollapsing)();
(0,_allowlisting_js__WEBPACK_IMPORTED_MODULE_4__.startOneClickAllowlisting)();
initContentFeatures();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vbm9kZV9tb2R1bGVzL2FkYmxvY2twbHVzY29yZS9saWIvY29tbW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9ub2RlX21vZHVsZXMvYWRibG9ja3BsdXNjb3JlL2xpYi9jb250ZW50L2VsZW1IaWRlRW11bGF0aW9uLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9ub2RlX21vZHVsZXMvYWRibG9ja3BsdXNjb3JlL2xpYi9wYXR0ZXJucy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vbm9kZV9tb2R1bGVzL3dlYmV4dGVuc2lvbi1wb2x5ZmlsbC9kaXN0L2Jyb3dzZXItcG9seWZpbGwuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L2FsbG93bGlzdGluZy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vc2RrL2NvbnRlbnQvZWxlbWVudC1jb2xsYXBzaW5nLmpzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvLi9zZGsvY29udGVudC9lbGVtZW50LWhpZGluZy10cmFjZXIuanMiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L3N1YnNjcmliZS1saW5rcy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrLy4vc2RrL2Vycm9ycy5qcyIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL0BleWVvL3dlYmV4dC1zZGsvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9AZXllby93ZWJleHQtc2RrL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vQGV5ZW8vd2ViZXh0LXNkay8uL3Nkay9jb250ZW50L2luZGV4LmpzIl0sIm5hbWVzIjpbImJyb3dzZXIiLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsInByb3RvdHlwZSIsIkNIUk9NRV9TRU5EX01FU1NBR0VfQ0FMTEJBQ0tfTk9fUkVTUE9OU0VfTUVTU0FHRSIsIlNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORyIsIndyYXBBUElzIiwiZXh0ZW5zaW9uQVBJcyIsImFwaU1ldGFkYXRhIiwia2V5cyIsImxlbmd0aCIsIkVycm9yIiwiRGVmYXVsdFdlYWtNYXAiLCJXZWFrTWFwIiwiY29uc3RydWN0b3IiLCJjcmVhdGVJdGVtIiwiaXRlbXMiLCJ1bmRlZmluZWQiLCJnZXQiLCJrZXkiLCJoYXMiLCJzZXQiLCJpc1RoZW5hYmxlIiwidmFsdWUiLCJ0aGVuIiwibWFrZUNhbGxiYWNrIiwicHJvbWlzZSIsIm1ldGFkYXRhIiwiY2FsbGJhY2tBcmdzIiwicnVudGltZSIsImxhc3RFcnJvciIsInJlamVjdCIsIm1lc3NhZ2UiLCJzaW5nbGVDYWxsYmFja0FyZyIsInJlc29sdmUiLCJwbHVyYWxpemVBcmd1bWVudHMiLCJudW1BcmdzIiwid3JhcEFzeW5jRnVuY3Rpb24iLCJuYW1lIiwiYXN5bmNGdW5jdGlvbldyYXBwZXIiLCJ0YXJnZXQiLCJhcmdzIiwibWluQXJncyIsIm1heEFyZ3MiLCJQcm9taXNlIiwiZmFsbGJhY2tUb05vQ2FsbGJhY2siLCJjYkVycm9yIiwiY29uc29sZSIsIndhcm4iLCJub0NhbGxiYWNrIiwid3JhcE1ldGhvZCIsIm1ldGhvZCIsIndyYXBwZXIiLCJQcm94eSIsImFwcGx5IiwidGFyZ2V0TWV0aG9kIiwidGhpc09iaiIsImNhbGwiLCJoYXNPd25Qcm9wZXJ0eSIsIkZ1bmN0aW9uIiwiYmluZCIsIndyYXBPYmplY3QiLCJ3cmFwcGVycyIsImNhY2hlIiwiY3JlYXRlIiwiaGFuZGxlcnMiLCJwcm94eVRhcmdldCIsInByb3AiLCJyZWNlaXZlciIsImRlZmluZVByb3BlcnR5IiwiY29uZmlndXJhYmxlIiwiZW51bWVyYWJsZSIsImRlc2MiLCJSZWZsZWN0IiwiZGVsZXRlUHJvcGVydHkiLCJ3cmFwRXZlbnQiLCJ3cmFwcGVyTWFwIiwiYWRkTGlzdGVuZXIiLCJsaXN0ZW5lciIsImhhc0xpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzIiwib25SZXF1ZXN0RmluaXNoZWQiLCJyZXEiLCJ3cmFwcGVkUmVxIiwiZ2V0Q29udGVudCIsImxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZyIsIm9uTWVzc2FnZVdyYXBwZXJzIiwib25NZXNzYWdlIiwic2VuZGVyIiwic2VuZFJlc3BvbnNlIiwiZGlkQ2FsbFNlbmRSZXNwb25zZSIsIndyYXBwZWRTZW5kUmVzcG9uc2UiLCJzZW5kUmVzcG9uc2VQcm9taXNlIiwicmVzcG9uc2UiLCJzdGFjayIsInJlc3VsdCIsImVyciIsImlzUmVzdWx0VGhlbmFibGUiLCJzZW5kUHJvbWlzZWRSZXN1bHQiLCJtc2ciLCJlcnJvciIsIl9fbW96V2ViRXh0ZW5zaW9uUG9seWZpbGxSZWplY3RfXyIsImNhdGNoIiwid3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2siLCJyZXBseSIsIndyYXBwZWRTZW5kTWVzc2FnZSIsImFwaU5hbWVzcGFjZU9iaiIsIndyYXBwZWRDYiIsInB1c2giLCJzZW5kTWVzc2FnZSIsInN0YXRpY1dyYXBwZXJzIiwiZGV2dG9vbHMiLCJuZXR3b3JrIiwib25NZXNzYWdlRXh0ZXJuYWwiLCJ0YWJzIiwic2V0dGluZ01ldGFkYXRhIiwiY2xlYXIiLCJwcml2YWN5Iiwic2VydmljZXMiLCJ3ZWJzaXRlcyIsImNocm9tZSIsImlkIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FB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QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsS0FBSztBQUNsQixhQUFhLE9BQU87QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhLEtBQUs7QUFDbEI7QUFDQSxhQUFhLEtBQUs7QUFDbEIsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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QWM7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QjtBQUM1QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRTRDOztBQUdjOztBQUVMO0FBRXBCO0FBQzJCO0FBQ0c7QUFDTDs7QUFFMUQ7QUFDQSx1QkFBdUIsbUVBQXVCO0FBQzlDLElBQUksc0VBQTJCLEVBQUUsMEJBQTBCO0FBQzNEOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQiwwRUFBbUI7O0FBRXBDO0FBQ0EsZ0NBQWdDLCtGQUFpQjtBQUNqRDtBQUNBLFFBQVEsbUVBQVc7O0FBRW5CO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxRQUFRLHFFQUFhO0FBQ3JCLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0EsSUFBSSx5RUFBb0I7QUFDeEI7O0FBRUEsOEVBQXNCO0FBQ3RCLDJFQUF5QjtBQUN6QiIsImZpbGUiOiJld2UtY29udGVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBBZGJsb2NrIFBsdXMgPGh0dHBzOi8vYWRibG9ja3BsdXMub3JnLz4sXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggQWRibG9jayBQbHVzLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qKiBAbW9kdWxlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG5sZXQgdGV4dFRvUmVnRXhwID1cbi8qKlxuICogQ29udmVydHMgcmF3IHRleHQgaW50byBhIHJlZ3VsYXIgZXhwcmVzc2lvbiBzdHJpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IHRoZSBzdHJpbmcgdG8gY29udmVydFxuICogQHJldHVybiB7c3RyaW5nfSByZWd1bGFyIGV4cHJlc3Npb24gcmVwcmVzZW50YXRpb24gb2YgdGhlIHRleHRcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMudGV4dFRvUmVnRXhwID0gdGV4dCA9PiB0ZXh0LnJlcGxhY2UoL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csIFwiXFxcXCQmXCIpO1xuXG5jb25zdCByZWdleHBSZWdleHAgPSAvXlxcLyguKilcXC8oW2ltdV0qKSQvO1xuXG4vKipcbiAqIE1ha2UgYSByZWd1bGFyIGV4cHJlc3Npb24gZnJvbSBhIHRleHQgYXJndW1lbnQuXG4gKlxuICogSWYgaXQgY2FuIGJlIHBhcnNlZCBhcyBhIHJlZ3VsYXIgZXhwcmVzc2lvbiwgcGFyc2UgaXQgYW5kIHRoZSBmbGFncy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCB0aGUgdGV4dCBhcmd1bWVudC5cbiAqXG4gKiBAcmV0dXJuIHs/UmVnRXhwfSBhIFJlZ0V4cCBvYmplY3Qgb3IgbnVsbCBpbiBjYXNlIG9mIGVycm9yLlxuICovXG5leHBvcnRzLm1ha2VSZWdFeHBQYXJhbWV0ZXIgPSBmdW5jdGlvbiBtYWtlUmVnRXhwUGFyYW1ldGVyKHRleHQpIHtcbiAgbGV0IFssIHNvdXJjZSwgZmxhZ3NdID0gcmVnZXhwUmVnZXhwLmV4ZWModGV4dCkgfHwgW251bGwsIHRleHRUb1JlZ0V4cCh0ZXh0KV07XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFJlZ0V4cChzb3VyY2UsIGZsYWdzKTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59O1xuXG5sZXQgc3BsaXRTZWxlY3RvciA9IGV4cG9ydHMuc3BsaXRTZWxlY3RvciA9IGZ1bmN0aW9uIHNwbGl0U2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgaWYgKCFzZWxlY3Rvci5pbmNsdWRlcyhcIixcIikpXG4gICAgcmV0dXJuIFtzZWxlY3Rvcl07XG5cbiAgbGV0IHNlbGVjdG9ycyA9IFtdO1xuICBsZXQgc3RhcnQgPSAwO1xuICBsZXQgbGV2ZWwgPSAwO1xuICBsZXQgc2VwID0gXCJcIjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNociA9IHNlbGVjdG9yW2ldO1xuXG4gICAgLy8gaWdub3JlIGVzY2FwZWQgY2hhcmFjdGVyc1xuICAgIGlmIChjaHIgPT0gXCJcXFxcXCIpIHtcbiAgICAgIGkrKztcbiAgICB9XG4gICAgLy8gZG9uJ3Qgc3BsaXQgd2l0aGluIHF1b3RlZCB0ZXh0XG4gICAgZWxzZSBpZiAoY2hyID09IHNlcCkge1xuICAgICAgc2VwID0gXCJcIjsgICAgICAgICAgICAgLy8gZS5nLiBbYXR0cj1cIixcIl1cbiAgICB9XG4gICAgZWxzZSBpZiAoc2VwID09IFwiXCIpIHtcbiAgICAgIGlmIChjaHIgPT0gJ1wiJyB8fCBjaHIgPT0gXCInXCIpIHtcbiAgICAgICAgc2VwID0gY2hyO1xuICAgICAgfVxuICAgICAgLy8gZG9uJ3Qgc3BsaXQgYmV0d2VlbiBwYXJlbnRoZXNlc1xuICAgICAgZWxzZSBpZiAoY2hyID09IFwiKFwiKSB7XG4gICAgICAgIGxldmVsKys7ICAgICAgICAgICAgLy8gZS5nLiA6bWF0Y2hlcyhkaXYsc3BhbilcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGNociA9PSBcIilcIikge1xuICAgICAgICBsZXZlbCA9IE1hdGgubWF4KDAsIGxldmVsIC0gMSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChjaHIgPT0gXCIsXCIgJiYgbGV2ZWwgPT0gMCkge1xuICAgICAgICBzZWxlY3RvcnMucHVzaChzZWxlY3Rvci5zdWJzdHJpbmcoc3RhcnQsIGkpKTtcbiAgICAgICAgc3RhcnQgPSBpICsgMTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZWxlY3RvcnMucHVzaChzZWxlY3Rvci5zdWJzdHJpbmcoc3RhcnQpKTtcbiAgcmV0dXJuIHNlbGVjdG9ycztcbn07XG5cbmZ1bmN0aW9uIGZpbmRUYXJnZXRTZWxlY3RvckluZGV4KHNlbGVjdG9yKSB7XG4gIGxldCBpbmRleCA9IDA7XG4gIGxldCB3aGl0ZXNwYWNlID0gMDtcbiAgbGV0IHNjb3BlID0gW107XG5cbiAgLy8gU3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBzdHJpbmcgYW5kIGdvIGNoYXJhY3RlciBieSBjaGFyYWN0ZXIsIHdoZXJlIGVhY2hcbiAgLy8gY2hhcmFjdGVyIGlzIGEgVW5pY29kZSBjb2RlIHBvaW50LlxuICBmb3IgKGxldCBjaGFyYWN0ZXIgb2YgWy4uLnNlbGVjdG9yXS5yZXZlcnNlKCkpIHtcbiAgICBsZXQgY3VycmVudFNjb3BlID0gc2NvcGVbc2NvcGUubGVuZ3RoIC0gMV07XG5cbiAgICBpZiAoY2hhcmFjdGVyID09IFwiJ1wiIHx8IGNoYXJhY3RlciA9PSBcIlxcXCJcIikge1xuICAgICAgLy8gSWYgd2UncmUgYWxyZWFkeSB3aXRoaW4gdGhlIHNhbWUgdHlwZSBvZiBxdW90ZSwgY2xvc2UgdGhlIHNjb3BlO1xuICAgICAgLy8gb3RoZXJ3aXNlIG9wZW4gYSBuZXcgc2NvcGUuXG4gICAgICBpZiAoY3VycmVudFNjb3BlID09IGNoYXJhY3RlcilcbiAgICAgICAgc2NvcGUucG9wKCk7XG4gICAgICBlbHNlXG4gICAgICAgIHNjb3BlLnB1c2goY2hhcmFjdGVyKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hhcmFjdGVyID09IFwiXVwiIHx8IGNoYXJhY3RlciA9PSBcIilcIikge1xuICAgICAgLy8gRm9yIGNsb3NpbmcgYnJhY2tldHMgYW5kIHBhcmVudGhlc2VzLCBvcGVuIGEgbmV3IHNjb3BlIG9ubHkgaWYgd2UncmVcbiAgICAgIC8vIG5vdCB3aXRoaW4gYSBxdW90ZS4gV2l0aGluIHF1b3RlcyB0aGVzZSBjaGFyYWN0ZXJzIHNob3VsZCBoYXZlIG5vXG4gICAgICAvLyBtZWFuaW5nLlxuICAgICAgaWYgKGN1cnJlbnRTY29wZSAhPSBcIidcIiAmJiBjdXJyZW50U2NvcGUgIT0gXCJcXFwiXCIpXG4gICAgICAgIHNjb3BlLnB1c2goY2hhcmFjdGVyKTtcbiAgICB9XG4gICAgZWxzZSBpZiAoY2hhcmFjdGVyID09IFwiW1wiKSB7XG4gICAgICAvLyBJZiB3ZSdyZSBhbHJlYWR5IHdpdGhpbiBhIGJyYWNrZXQsIGNsb3NlIHRoZSBzY29wZS5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgPT0gXCJdXCIpXG4gICAgICAgIHNjb3BlLnBvcCgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChjaGFyYWN0ZXIgPT0gXCIoXCIpIHtcbiAgICAgIC8vIElmIHdlJ3JlIGFscmVhZHkgd2l0aGluIGEgcGFyZW50aGVzaXMsIGNsb3NlIHRoZSBzY29wZS5cbiAgICAgIGlmIChjdXJyZW50U2NvcGUgPT0gXCIpXCIpXG4gICAgICAgIHNjb3BlLnBvcCgpO1xuICAgIH1cbiAgICBlbHNlIGlmICghY3VycmVudFNjb3BlKSB7XG4gICAgICAvLyBBdCB0aGUgdG9wIGxldmVsIChub3Qgd2l0aGluIGFueSBzY29wZSksIGNvdW50IHRoZSB3aGl0ZXNwYWNlIGlmIHdlJ3ZlXG4gICAgICAvLyBlbmNvdW50ZXJlZCBpdC4gT3RoZXJ3aXNlIGlmIHdlJ3ZlIGhpdCBvbmUgb2YgdGhlIGNvbWJpbmF0b3JzLFxuICAgICAgLy8gdGVybWluYXRlIGhlcmU7IG90aGVyd2lzZSBpZiB3ZSd2ZSBoaXQgYSBub24tY29sb24gY2hhcmFjdGVyLFxuICAgICAgLy8gdGVybWluYXRlIGhlcmUuXG4gICAgICBpZiAoL1xccy8udGVzdChjaGFyYWN0ZXIpKVxuICAgICAgICB3aGl0ZXNwYWNlKys7XG4gICAgICBlbHNlIGlmICgoY2hhcmFjdGVyID09IFwiPlwiIHx8IGNoYXJhY3RlciA9PSBcIitcIiB8fCBjaGFyYWN0ZXIgPT0gXCJ+XCIpIHx8XG4gICAgICAgICAgICAgICAod2hpdGVzcGFjZSA+IDAgJiYgY2hhcmFjdGVyICE9IFwiOlwiKSlcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgLy8gWmVybyBvdXQgdGhlIHdoaXRlc3BhY2UgY291bnQgaWYgd2UndmUgZW50ZXJlZCBhIHNjb3BlLlxuICAgIGlmIChzY29wZS5sZW5ndGggPiAwKVxuICAgICAgd2hpdGVzcGFjZSA9IDA7XG5cbiAgICAvLyBJbmNyZW1lbnQgdGhlIGluZGV4IGJ5IHRoZSBzaXplIG9mIHRoZSBjaGFyYWN0ZXIuIE5vdGUgdGhhdCBmb3IgVW5pY29kZVxuICAgIC8vIGNvbXBvc2l0ZSBjaGFyYWN0ZXJzIChsaWtlIGVtb2ppKSB0aGlzIHdpbGwgYmUgbW9yZSB0aGFuIG9uZS5cbiAgICBpbmRleCArPSBjaGFyYWN0ZXIubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIHNlbGVjdG9yLmxlbmd0aCAtIGluZGV4ICsgd2hpdGVzcGFjZTtcbn1cblxuLyoqXG4gKiBRdWFsaWZpZXMgYSBDU1Mgc2VsZWN0b3Igd2l0aCBhIHF1YWxpZmllciwgd2hpY2ggbWF5IGJlIGFub3RoZXIgQ1NTIHNlbGVjdG9yXG4gKiBvciBhbiBlbXB0eSBzdHJpbmcuIEZvciBleGFtcGxlLCBnaXZlbiB0aGUgc2VsZWN0b3IgXCJkaXYuYmFyXCIgYW5kIHRoZVxuICogcXVhbGlmaWVyIFwiI2Zvb1wiLCB0aGlzIGZ1bmN0aW9uIHJldHVybnMgXCJkaXYjZm9vLmJhclwiLlxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIFRoZSBzZWxlY3RvciB0byBxdWFsaWZ5LlxuICogQHBhcmFtIHtzdHJpbmd9IHF1YWxpZmllciBUaGUgcXVhbGlmaWVyIHdpdGggd2hpY2ggdG8gcXVhbGlmeSB0aGUgc2VsZWN0b3IuXG4gKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgcXVhbGlmaWVkIHNlbGVjdG9yLlxuICogQHBhY2thZ2VcbiAqL1xuZXhwb3J0cy5xdWFsaWZ5U2VsZWN0b3IgPSBmdW5jdGlvbiBxdWFsaWZ5U2VsZWN0b3Ioc2VsZWN0b3IsIHF1YWxpZmllcikge1xuICBsZXQgcXVhbGlmaWVkU2VsZWN0b3IgPSBcIlwiO1xuXG4gIGxldCBxdWFsaWZpZXJUYXJnZXRTZWxlY3RvckluZGV4ID0gZmluZFRhcmdldFNlbGVjdG9ySW5kZXgocXVhbGlmaWVyKTtcbiAgbGV0IFssIHF1YWxpZmllclR5cGUgPSBcIlwiXSA9XG4gICAgL14oW2Etel1bYS16LV0qKT8vaS5leGVjKHF1YWxpZmllci5zdWJzdHJpbmcocXVhbGlmaWVyVGFyZ2V0U2VsZWN0b3JJbmRleCkpO1xuXG4gIGZvciAobGV0IHN1YiBvZiBzcGxpdFNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgIHN1YiA9IHN1Yi50cmltKCk7XG5cbiAgICBxdWFsaWZpZWRTZWxlY3RvciArPSBcIiwgXCI7XG5cbiAgICBsZXQgaW5kZXggPSBmaW5kVGFyZ2V0U2VsZWN0b3JJbmRleChzdWIpO1xuXG4gICAgLy8gTm90ZSB0aGF0IHRoZSBmaXJzdCBncm91cCBpbiB0aGUgcmVndWxhciBleHByZXNzaW9uIGlzIG9wdGlvbmFsLiBJZiBpdFxuICAgIC8vIGRvZXNuJ3QgbWF0Y2ggKGUuZy4gXCIjZm9vOjpudGgtY2hpbGQoMSlcIiksIHR5cGUgd2lsbCBiZSBhbiBlbXB0eSBzdHJpbmcuXG4gICAgbGV0IFssIHR5cGUgPSBcIlwiLCByZXN0XSA9XG4gICAgICAvXihbYS16XVthLXotXSopP1xcKj8oLiopL2kuZXhlYyhzdWIuc3Vic3RyaW5nKGluZGV4KSk7XG5cbiAgICBpZiAodHlwZSA9PSBxdWFsaWZpZXJUeXBlKVxuICAgICAgdHlwZSA9IFwiXCI7XG5cbiAgICAvLyBJZiB0aGUgcXVhbGlmaWVyIGVuZHMgaW4gYSBjb21iaW5hdG9yIChlLmcuIFwiYm9keSAjZm9vPlwiKSwgd2UgcHV0IHRoZVxuICAgIC8vIHR5cGUgYW5kIHRoZSByZXN0IG9mIHRoZSBzZWxlY3RvciBhZnRlciB0aGUgcXVhbGlmaWVyXG4gICAgLy8gKGUuZy4gXCJib2R5ICNmb28+ZGl2LmJhclwiKTsgb3RoZXJ3aXNlIChlLmcuIFwiYm9keSAjZm9vXCIpIHdlIG1lcmdlIHRoZVxuICAgIC8vIHR5cGUgaW50byB0aGUgcXVhbGlmaWVyIChlLmcuIFwiYm9keSBkaXYjZm9vLmJhclwiKS5cbiAgICBpZiAoL1tcXHM+K35dJC8udGVzdChxdWFsaWZpZXIpKVxuICAgICAgcXVhbGlmaWVkU2VsZWN0b3IgKz0gc3ViLnN1YnN0cmluZygwLCBpbmRleCkgKyBxdWFsaWZpZXIgKyB0eXBlICsgcmVzdDtcbiAgICBlbHNlXG4gICAgICBxdWFsaWZpZWRTZWxlY3RvciArPSBzdWIuc3Vic3RyaW5nKDAsIGluZGV4KSArIHR5cGUgKyBxdWFsaWZpZXIgKyByZXN0O1xuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBpbml0aWFsIGNvbW1hIGFuZCBzcGFjZS5cbiAgcmV0dXJuIHF1YWxpZmllZFNlbGVjdG9yLnN1YnN0cmluZygyKTtcbn07XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgQWRibG9jayBQbHVzIDxodHRwczovL2FkYmxvY2twbHVzLm9yZy8+LFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogQWRibG9jayBQbHVzIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEFkYmxvY2sgUGx1cy4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG4vKiogQG1vZHVsZSAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuY29uc3Qge21ha2VSZWdFeHBQYXJhbWV0ZXIsIHNwbGl0U2VsZWN0b3IsXG4gICAgICAgcXVhbGlmeVNlbGVjdG9yfSA9IHJlcXVpcmUoXCIuLi9jb21tb25cIik7XG5jb25zdCB7ZmlsdGVyVG9SZWdFeHB9ID0gcmVxdWlyZShcIi4uL3BhdHRlcm5zXCIpO1xuXG5jb25zdCBERUZBVUxUX01JTl9JTlZPQ0FUSU9OX0lOVEVSVkFMID0gMzAwMDtcbmxldCBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgPSBERUZBVUxUX01JTl9JTlZPQ0FUSU9OX0lOVEVSVkFMO1xuY29uc3QgREVGQVVMVF9NQVhfU1lDSFJPTk9VU19QUk9DRVNTSU5HX1RJTUUgPSA1MDtcbmxldCBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lID0gREVGQVVMVF9NQVhfU1lDSFJPTk9VU19QUk9DRVNTSU5HX1RJTUU7XG5cbmxldCBhYnBTZWxlY3RvclJlZ2V4cCA9IC86KC1hYnAtW1xcdy1dK3xoYXN8aGFzLXRleHR8eHBhdGh8bm90KVxcKC87XG5cbmxldCB0ZXN0SW5mbyA9IG51bGw7XG5cbmZ1bmN0aW9uIHRvQ1NTU3R5bGVEZWNsYXJhdGlvbih2YWx1ZSkge1xuICByZXR1cm4gT2JqZWN0LmFzc2lnbihkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwidGVzdFwiKSwge3N0eWxlOiB2YWx1ZX0pLnN0eWxlO1xufVxuXG4vKipcbiAqIEVuYWJsZXMgdGVzdCBtb2RlLCB3aGljaCB0cmFja3MgYWRkaXRpb25hbCBtZXRhZGF0YSBhYm91dCB0aGUgaW5uZXJcbiAqIHdvcmtpbmdzIGZvciB0ZXN0IHB1cnBvc2VzLiBUaGlzIGFsc28gYWxsb3dzIG92ZXJyaWRpbmcgaW50ZXJuYWxcbiAqIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcbiAqIEBwYXJhbSB7bnVtYmVyfSBvcHRpb25zLm1pbkludm9jYXRpb25JbnRlcnZhbCBPdmVycmlkZXMgaG93IGxvbmdcbiAqICAgbXVzdCBiZSB3YWl0ZWQgYmV0d2VlbiBmaWx0ZXIgcHJvY2Vzc2luZyBydW5zXG4gKiBAcGFyYW0ge251bWJlcn0gb3B0aW9ucy5tYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lIE92ZXJyaWRlcyBob3dcbiAqICAgbG9uZyB0aGUgdGhyZWFkIG1heSBzcGVuZCBwcm9jZXNzaW5nIGZpbHRlcnMgYmVmb3JlIGl0IG11c3QgeWllbGRcbiAqICAgaXRzIHRocmVhZFxuICovXG5leHBvcnRzLnNldFRlc3RNb2RlID0gZnVuY3Rpb24gc2V0VGVzdE1vZGUob3B0aW9ucykge1xuICBpZiAodHlwZW9mIG9wdGlvbnMubWluSW52b2NhdGlvbkludGVydmFsICE9PSBcInVuZGVmaW5lZFwiKVxuICAgIG1pbkludm9jYXRpb25JbnRlcnZhbCA9IG9wdGlvbnMubWluSW52b2NhdGlvbkludGVydmFsO1xuICBpZiAodHlwZW9mIG9wdGlvbnMubWF4U3luY2hyb25vdXNQcm9jZXNzaW5nVGltZSAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lID0gb3B0aW9ucy5tYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lO1xuXG4gIHRlc3RJbmZvID0ge1xuICAgIGxhc3RQcm9jZXNzZWRFbGVtZW50czogbmV3IFNldCgpLFxuICAgIGZhaWxlZEFzc2VydGlvbnM6IFtdXG4gIH07XG59O1xuXG5leHBvcnRzLmdldFRlc3RJbmZvID0gZnVuY3Rpb24gZ2V0VGVzdEluZm8oKSB7XG4gIHJldHVybiB0ZXN0SW5mbztcbn07XG5cbmV4cG9ydHMuY2xlYXJUZXN0TW9kZSA9IGZ1bmN0aW9uKCkge1xuICBtaW5JbnZvY2F0aW9uSW50ZXJ2YWwgPSBERUZBVUxUX01JTl9JTlZPQ0FUSU9OX0lOVEVSVkFMO1xuICBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lID0gREVGQVVMVF9NQVhfU1lDSFJPTk9VU19QUk9DRVNTSU5HX1RJTUU7XG4gIHRlc3RJbmZvID0gbnVsbDtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBJZGxlRGVhZGxpbmUuXG4gKlxuICogTm90ZTogVGhpcyBmdW5jdGlvbiBpcyBzeW5jaHJvbm91cyBhbmQgZG9lcyBOT1QgcmVxdWVzdCBhbiBpZGxlXG4gKiBjYWxsYmFjay5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9JZGxlRGVhZGxpbmV9LlxuICogQHJldHVybiB7SWRsZURlYWRsaW5lfVxuICovXG5mdW5jdGlvbiBuZXdJZGxlRGVhZGxpbmUoKSB7XG4gIGxldCBzdGFydFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgcmV0dXJuIHtcbiAgICBkaWRUaW1lb3V0OiBmYWxzZSxcbiAgICB0aW1lUmVtYWluaW5nKCkge1xuICAgICAgbGV0IGVsYXBzZWQgPSBwZXJmb3JtYW5jZS5ub3coKSAtIHN0YXJ0VGltZTtcbiAgICAgIGxldCByZW1haW5pbmcgPSBtYXhTeW5jaHJvbm91c1Byb2Nlc3NpbmdUaW1lIC0gZWxhcHNlZDtcbiAgICAgIHJldHVybiBNYXRoLm1heCgwLCByZW1haW5pbmcpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGJyb3dzZXIgaXMgbmV4dCBpZGxlLlxuICpcbiAqIFRoaXMgaXMgaW50ZW5kZWQgdG8gYmUgdXNlZCBmb3IgbG9uZyBydW5uaW5nIHRhc2tzIG9uIHRoZSBVSSB0aHJlYWRcbiAqIHRvIGFsbG93IG90aGVyIFVJIGV2ZW50cyB0byBwcm9jZXNzLlxuICpcbiAqIEByZXR1cm4ge1Byb21pc2UuPElkbGVEZWFkbGluZT59XG4gKiAgICBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgd2hlbiB5b3UgY2FuIGNvbnRpbnVlIHByb2Nlc3NpbmdcbiAqL1xuZnVuY3Rpb24geWllbGRUaHJlYWQoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICBpZiAodHlwZW9mIHJlcXVlc3RJZGxlQ2FsbGJhY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgcmVxdWVzdElkbGVDYWxsYmFjayhyZXNvbHZlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcmVzb2x2ZShuZXdJZGxlRGVhZGxpbmUoKSk7XG4gICAgICB9LCAwKTtcbiAgICB9XG4gIH0pO1xufVxuXG5cbmZ1bmN0aW9uIGdldENhY2hlZFByb3BlcnR5VmFsdWUob2JqZWN0LCBuYW1lLCBkZWZhdWx0VmFsdWVGdW5jID0gKCkgPT4ge30pIHtcbiAgbGV0IHZhbHVlID0gb2JqZWN0W25hbWVdO1xuICBpZiAodHlwZW9mIHZhbHVlID09IFwidW5kZWZpbmVkXCIpXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iamVjdCwgbmFtZSwge3ZhbHVlOiB2YWx1ZSA9IGRlZmF1bHRWYWx1ZUZ1bmMoKX0pO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbi8qKlxuICogUmV0dXJuIHBvc2l0aW9uIG9mIG5vZGUgZnJvbSBwYXJlbnQuXG4gKiBAcGFyYW0ge05vZGV9IG5vZGUgdGhlIG5vZGUgdG8gZmluZCB0aGUgcG9zaXRpb24gb2YuXG4gKiBAcmV0dXJuIHtudW1iZXJ9IE9uZS1iYXNlZCBpbmRleCBsaWtlIGZvciA6bnRoLWNoaWxkKCksIG9yIDAgb24gZXJyb3IuXG4gKi9cbmZ1bmN0aW9uIHBvc2l0aW9uSW5QYXJlbnQobm9kZSkge1xuICBsZXQgaW5kZXggPSAwO1xuICBmb3IgKGxldCBjaGlsZCBvZiBub2RlLnBhcmVudE5vZGUuY2hpbGRyZW4pIHtcbiAgICBpZiAoY2hpbGQgPT0gbm9kZSlcbiAgICAgIHJldHVybiBpbmRleCArIDE7XG5cbiAgICBpbmRleCsrO1xuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbmZ1bmN0aW9uIG1ha2VTZWxlY3Rvcihub2RlLCBzZWxlY3RvciA9IFwiXCIpIHtcbiAgaWYgKG5vZGUgPT0gbnVsbClcbiAgICByZXR1cm4gbnVsbDtcbiAgaWYgKCFub2RlLnBhcmVudEVsZW1lbnQpIHtcbiAgICBsZXQgbmV3U2VsZWN0b3IgPSBcIjpyb290XCI7XG4gICAgaWYgKHNlbGVjdG9yKVxuICAgICAgbmV3U2VsZWN0b3IgKz0gXCIgPiBcIiArIHNlbGVjdG9yO1xuICAgIHJldHVybiBuZXdTZWxlY3RvcjtcbiAgfVxuICBsZXQgaWR4ID0gcG9zaXRpb25JblBhcmVudChub2RlKTtcbiAgaWYgKGlkeCA+IDApIHtcbiAgICBsZXQgbmV3U2VsZWN0b3IgPSBgJHtub2RlLnRhZ05hbWV9Om50aC1jaGlsZCgke2lkeH0pYDtcbiAgICBpZiAoc2VsZWN0b3IpXG4gICAgICBuZXdTZWxlY3RvciArPSBcIiA+IFwiICsgc2VsZWN0b3I7XG4gICAgcmV0dXJuIG1ha2VTZWxlY3Rvcihub2RlLnBhcmVudEVsZW1lbnQsIG5ld1NlbGVjdG9yKTtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3Rvcjtcbn1cblxuZnVuY3Rpb24gcGFyc2VTZWxlY3RvckNvbnRlbnQoY29udGVudCwgc3RhcnRJbmRleCkge1xuICBsZXQgcGFyZW5zID0gMTtcbiAgbGV0IHF1b3RlID0gbnVsbDtcbiAgbGV0IGkgPSBzdGFydEluZGV4O1xuICBmb3IgKDsgaSA8IGNvbnRlbnQubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgYyA9IGNvbnRlbnRbaV07XG4gICAgaWYgKGMgPT0gXCJcXFxcXCIpIHtcbiAgICAgIC8vIElnbm9yZSBlc2NhcGVkIGNoYXJhY3RlcnNcbiAgICAgIGkrKztcbiAgICB9XG4gICAgZWxzZSBpZiAocXVvdGUpIHtcbiAgICAgIGlmIChjID09IHF1b3RlKVxuICAgICAgICBxdW90ZSA9IG51bGw7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMgPT0gXCInXCIgfHwgYyA9PSAnXCInKSB7XG4gICAgICBxdW90ZSA9IGM7XG4gICAgfVxuICAgIGVsc2UgaWYgKGMgPT0gXCIoXCIpIHtcbiAgICAgIHBhcmVucysrO1xuICAgIH1cbiAgICBlbHNlIGlmIChjID09IFwiKVwiKSB7XG4gICAgICBwYXJlbnMtLTtcbiAgICAgIGlmIChwYXJlbnMgPT0gMClcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYgKHBhcmVucyA+IDApXG4gICAgcmV0dXJuIG51bGw7XG4gIHJldHVybiB7dGV4dDogY29udGVudC5zdWJzdHJpbmcoc3RhcnRJbmRleCwgaSksIGVuZDogaX07XG59XG5cbi8qKlxuICogU3RyaW5naWZpZWQgc3R5bGUgb2JqZWN0c1xuICogQHR5cGVkZWYge09iamVjdH0gU3RyaW5naWZpZWRTdHlsZVxuICogQHByb3BlcnR5IHtzdHJpbmd9IHN0eWxlIENTUyBzdHlsZSByZXByZXNlbnRlZCBieSBhIHN0cmluZy5cbiAqIEBwcm9wZXJ0eSB7c3RyaW5nW119IHN1YlNlbGVjdG9ycyBzZWxlY3RvcnMgdGhlIENTUyBwcm9wZXJ0aWVzIGFwcGx5IHRvLlxuICovXG5cbi8qKlxuICogUHJvZHVjZSBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgc3R5bGVzaGVldCBlbnRyeS5cbiAqIEBwYXJhbSB7Q1NTU3R5bGVSdWxlfSBydWxlIHRoZSBDU1Mgc3R5bGUgcnVsZS5cbiAqIEByZXR1cm4ge1N0cmluZ2lmaWVkU3R5bGV9IHRoZSBzdHJpbmdpZmllZCBzdHlsZS5cbiAqL1xuZnVuY3Rpb24gc3RyaW5naWZ5U3R5bGUocnVsZSkge1xuICBsZXQgc3R5bGVzID0gW107XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgcnVsZS5zdHlsZS5sZW5ndGg7IGkrKykge1xuICAgIGxldCBwcm9wZXJ0eSA9IHJ1bGUuc3R5bGUuaXRlbShpKTtcbiAgICBsZXQgdmFsdWUgPSBydWxlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUocHJvcGVydHkpO1xuICAgIGxldCBwcmlvcml0eSA9IHJ1bGUuc3R5bGUuZ2V0UHJvcGVydHlQcmlvcml0eShwcm9wZXJ0eSk7XG4gICAgc3R5bGVzLnB1c2goYCR7cHJvcGVydHl9OiAke3ZhbHVlfSR7cHJpb3JpdHkgPyBcIiAhXCIgKyBwcmlvcml0eSA6IFwiXCJ9O2ApO1xuICB9XG4gIHN0eWxlcy5zb3J0KCk7XG4gIHJldHVybiB7XG4gICAgc3R5bGU6IHN0eWxlcy5qb2luKFwiIFwiKSxcbiAgICBzdWJTZWxlY3RvcnM6IHNwbGl0U2VsZWN0b3IocnVsZS5zZWxlY3RvclRleHQpXG4gIH07XG59XG5cbmxldCBzY29wZVN1cHBvcnRlZCA9IG51bGw7XG5cbmZ1bmN0aW9uIHRyeVF1ZXJ5U2VsZWN0b3Ioc3VidHJlZSwgc2VsZWN0b3IsIGFsbCkge1xuICBsZXQgZWxlbWVudHMgPSBudWxsO1xuICB0cnkge1xuICAgIGVsZW1lbnRzID0gYWxsID8gc3VidHJlZS5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6XG4gICAgICBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIHNjb3BlU3VwcG9ydGVkID0gdHJ1ZTtcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIC8vIEVkZ2UgZG9lc24ndCBzdXBwb3J0IFwiOnNjb3BlXCJcbiAgICBzY29wZVN1cHBvcnRlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBlbGVtZW50cztcbn1cblxuLyoqXG4gKiBRdWVyeSBzZWxlY3Rvci5cbiAqXG4gKiBJZiBpdCBpcyByZWxhdGl2ZSwgd2lsbCB0cnkgOnNjb3BlLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgZWxlbWVudCB0byBxdWVyeSBzZWxlY3RvclxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yIHRoZSBzZWxlY3RvciB0byBxdWVyeVxuICogQHBhcmFtIHtib29sfSBbYWxsPWZhbHNlXSB0cnVlIHRvIHBlcmZvcm0gcXVlcnlTZWxlY3RvckFsbCgpXG4gKlxuICogQHJldHVybnMgez8oTm9kZXxOb2RlTGlzdCl9IHJlc3VsdCBvZiB0aGUgcXVlcnkuIG51bGwgaW4gY2FzZSBvZiBlcnJvci5cbiAqL1xuZnVuY3Rpb24gc2NvcGVkUXVlcnlTZWxlY3RvcihzdWJ0cmVlLCBzZWxlY3RvciwgYWxsKSB7XG4gIGlmIChzZWxlY3RvclswXSA9PSBcIj5cIikge1xuICAgIHNlbGVjdG9yID0gXCI6c2NvcGVcIiArIHNlbGVjdG9yO1xuICAgIGlmIChzY29wZVN1cHBvcnRlZCkge1xuICAgICAgcmV0dXJuIGFsbCA/IHN1YnRyZWUucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikgOlxuICAgICAgICBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIH1cbiAgICBpZiAoc2NvcGVTdXBwb3J0ZWQgPT0gbnVsbClcbiAgICAgIHJldHVybiB0cnlRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCBhbGwpO1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBhbGwgPyBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDpcbiAgICBzdWJ0cmVlLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xufVxuXG5mdW5jdGlvbiBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIHNlbGVjdG9yKSB7XG4gIHJldHVybiBzY29wZWRRdWVyeVNlbGVjdG9yKHN1YnRyZWUsIHNlbGVjdG9yLCB0cnVlKTtcbn1cblxuY2xhc3MgUGxhaW5TZWxlY3RvciB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9yKSB7XG4gICAgdGhpcy5fc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyA9IC9bIy46XXxcXFsuK1xcXS8udGVzdChzZWxlY3Rvcik7XG4gICAgdGhpcy5tYXliZUNvbnRhaW5zU2libGluZ0NvbWJpbmF0b3JzID0gL1t+K10vLnRlc3Qoc2VsZWN0b3IpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRvciBmdW5jdGlvbiByZXR1cm5pbmcgYSBwYWlyIG9mIHNlbGVjdG9yIHN0cmluZyBhbmQgc3VidHJlZS5cbiAgICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCB0aGUgcHJlZml4IGZvciB0aGUgc2VsZWN0b3IuXG4gICAqIEBwYXJhbSB7Tm9kZX0gc3VidHJlZSB0aGUgc3VidHJlZSB3ZSB3b3JrIG9uLlxuICAgKiBAcGFyYW0ge05vZGVbXX0gW3RhcmdldHNdIHRoZSBub2RlcyB3ZSBhcmUgaW50ZXJlc3RlZCBpbi5cbiAgICovXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgeWllbGQgW3ByZWZpeCArIHRoaXMuX3NlbGVjdG9yLCBzdWJ0cmVlXTtcbiAgfVxufVxuXG5jb25zdCBpbmNvbXBsZXRlUHJlZml4UmVnZXhwID0gL1tcXHM+K35dJC87XG5cbmNsYXNzIE5vdFNlbGVjdG9yIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgdGhpcy5faW5uZXJQYXR0ZXJuID0gbmV3IFBhdHRlcm4oc2VsZWN0b3JzKTtcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25TdHlsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25TdHlsZXM7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLmRlcGVuZHNPbkNoYXJhY3RlckRhdGE7XG4gIH1cblxuICBnZXQgbWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4ubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSlcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIGVsZW1lbnRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRvciBmdW5jdGlvbiByZXR1cm5pbmcgc2VsZWN0ZWQgZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdGhlIHByZWZpeCBmb3IgdGhlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvbi5cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICAqZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IGFjdHVhbFByZWZpeCA9ICghcHJlZml4IHx8IGluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKSA/XG4gICAgICBwcmVmaXggKyBcIipcIiA6IHByZWZpeDtcbiAgICBsZXQgZWxlbWVudHMgPSBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIGFjdHVhbFByZWZpeCk7XG4gICAgaWYgKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIG5laXRoZXIgYW4gYW5jZXN0b3Igbm9yIGEgZGVzY2VuZGFudCBvZiBvbmUgb2YgdGhlXG4gICAgICAgIC8vIHRhcmdldHMsIHdlIGNhbiBza2lwIGl0LlxuICAgICAgICBpZiAodGFyZ2V0cyAmJiAhdGFyZ2V0cy5zb21lKHRhcmdldCA9PiBlbGVtZW50LmNvbnRhaW5zKHRhcmdldCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNvbnRhaW5zKGVsZW1lbnQpKSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVzdEluZm8pXG4gICAgICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcblxuICAgICAgICBpZiAoIXRoaXMuX2lubmVyUGF0dGVybi5tYXRjaGVzKGVsZW1lbnQsIHN1YnRyZWUpKVxuICAgICAgICAgIHlpZWxkIGVsZW1lbnQ7XG5cbiAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgdGhpcy5faW5uZXJQYXR0ZXJuLnNldFN0eWxlcyhzdHlsZXMpO1xuICB9XG59XG5cbmNsYXNzIEhhc1NlbGVjdG9yIHtcbiAgY29uc3RydWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgdGhpcy5faW5uZXJQYXR0ZXJuID0gbmV3IFBhdHRlcm4oc2VsZWN0b3JzKTtcbiAgfVxuXG4gIGdldCBkZXBlbmRzT25TdHlsZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2lubmVyUGF0dGVybi5kZXBlbmRzT25TdHlsZXM7XG4gIH1cblxuICBnZXQgZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSgpIHtcbiAgICByZXR1cm4gdGhpcy5faW5uZXJQYXR0ZXJuLmRlcGVuZHNPbkNoYXJhY3RlckRhdGE7XG4gIH1cblxuICBnZXQgbWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzKCkge1xuICAgIHJldHVybiB0aGlzLl9pbm5lclBhdHRlcm4ubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzO1xuICB9XG5cbiAgKmdldFNlbGVjdG9ycyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpIHtcbiAgICBmb3IgKGxldCBlbGVtZW50IG9mIHRoaXMuZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSlcbiAgICAgIHlpZWxkIFttYWtlU2VsZWN0b3IoZWxlbWVudCksIGVsZW1lbnRdO1xuICB9XG5cbiAgLyoqXG4gICAqIEdlbmVyYXRvciBmdW5jdGlvbiByZXR1cm5pbmcgc2VsZWN0ZWQgZWxlbWVudHMuXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggdGhlIHByZWZpeCBmb3IgdGhlIHNlbGVjdG9yLlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvbi5cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uXG4gICAqL1xuICAqZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IGFjdHVhbFByZWZpeCA9ICghcHJlZml4IHx8IGluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKSA/XG4gICAgICBwcmVmaXggKyBcIipcIiA6IHByZWZpeDtcbiAgICBsZXQgZWxlbWVudHMgPSBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIGFjdHVhbFByZWZpeCk7XG4gICAgaWYgKGVsZW1lbnRzKSB7XG4gICAgICBmb3IgKGxldCBlbGVtZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICAgIC8vIElmIHRoZSBlbGVtZW50IGlzIG5laXRoZXIgYW4gYW5jZXN0b3Igbm9yIGEgZGVzY2VuZGFudCBvZiBvbmUgb2YgdGhlXG4gICAgICAgIC8vIHRhcmdldHMsIHdlIGNhbiBza2lwIGl0LlxuICAgICAgICBpZiAodGFyZ2V0cyAmJiAhdGFyZ2V0cy5zb21lKHRhcmdldCA9PiBlbGVtZW50LmNvbnRhaW5zKHRhcmdldCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNvbnRhaW5zKGVsZW1lbnQpKSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVzdEluZm8pXG4gICAgICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcblxuICAgICAgICBmb3IgKGxldCBzZWxlY3RvciBvZiB0aGlzLl9pbm5lclBhdHRlcm4uZXZhbHVhdGUoZWxlbWVudCwgdGFyZ2V0cykpIHtcbiAgICAgICAgICBpZiAoc2VsZWN0b3IgPT0gbnVsbClcbiAgICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgZWxzZSBpZiAoc2NvcGVkUXVlcnlTZWxlY3RvcihlbGVtZW50LCBzZWxlY3RvcikpXG4gICAgICAgICAgICB5aWVsZCBlbGVtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgdGhpcy5faW5uZXJQYXR0ZXJuLnNldFN0eWxlcyhzdHlsZXMpO1xuICB9XG59XG5cbmNsYXNzIFhQYXRoU2VsZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcih0ZXh0Q29udGVudCkge1xuICAgIHRoaXMuZGVwZW5kc09uQ2hhcmFjdGVyRGF0YSA9IHRydWU7XG4gICAgdGhpcy5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMgPSB0cnVlO1xuXG4gICAgbGV0IGV2YWx1YXRvciA9IG5ldyBYUGF0aEV2YWx1YXRvcigpO1xuICAgIHRoaXMuX2V4cHJlc3Npb24gPSBldmFsdWF0b3IuY3JlYXRlRXhwcmVzc2lvbih0ZXh0Q29udGVudCwgbnVsbCk7XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5nZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpKVxuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgZWxlbWVudF07XG4gIH1cblxuICAqZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IHtPUkRFUkVEX05PREVfU05BUFNIT1RfVFlQRTogZmxhZ30gPSBYUGF0aFJlc3VsdDtcbiAgICBsZXQgZWxlbWVudHMgPSBwcmVmaXggPyBzY29wZWRRdWVyeVNlbGVjdG9yQWxsKHN1YnRyZWUsIHByZWZpeCkgOiBbc3VidHJlZV07XG4gICAgZm9yIChsZXQgcGFyZW50IG9mIGVsZW1lbnRzKSB7XG4gICAgICBsZXQgcmVzdWx0ID0gdGhpcy5fZXhwcmVzc2lvbi5ldmFsdWF0ZShwYXJlbnQsIGZsYWcsIG51bGwpO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIHtzbmFwc2hvdExlbmd0aH0gPSByZXN1bHQ7IGkgPCBzbmFwc2hvdExlbmd0aDsgaSsrKVxuICAgICAgICB5aWVsZCByZXN1bHQuc25hcHNob3RJdGVtKGkpO1xuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBDb250YWluc1NlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IodGV4dENvbnRlbnQpIHtcbiAgICB0aGlzLmRlcGVuZHNPbkNoYXJhY3RlckRhdGEgPSB0cnVlO1xuXG4gICAgdGhpcy5fcmVnZXhwID0gbWFrZVJlZ0V4cFBhcmFtZXRlcih0ZXh0Q29udGVudCk7XG4gIH1cblxuICAqZ2V0U2VsZWN0b3JzKHByZWZpeCwgc3VidHJlZSwgdGFyZ2V0cykge1xuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgdGhpcy5nZXRFbGVtZW50cyhwcmVmaXgsIHN1YnRyZWUsIHRhcmdldHMpKVxuICAgICAgeWllbGQgW21ha2VTZWxlY3RvcihlbGVtZW50KSwgc3VidHJlZV07XG4gIH1cblxuICAqZ2V0RWxlbWVudHMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IGFjdHVhbFByZWZpeCA9ICghcHJlZml4IHx8IGluY29tcGxldGVQcmVmaXhSZWdleHAudGVzdChwcmVmaXgpKSA/XG4gICAgICBwcmVmaXggKyBcIipcIiA6IHByZWZpeDtcblxuICAgIGxldCBlbGVtZW50cyA9IHNjb3BlZFF1ZXJ5U2VsZWN0b3JBbGwoc3VidHJlZSwgYWN0dWFsUHJlZml4KTtcblxuICAgIGlmIChlbGVtZW50cykge1xuICAgICAgbGV0IGxhc3RSb290ID0gbnVsbDtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpIHtcbiAgICAgICAgLy8gRm9yIGEgZmlsdGVyIGxpa2UgZGl2Oi1hYnAtY29udGFpbnMoSGVsbG8pIGFuZCBhIHN1YnRyZWUgbGlrZVxuICAgICAgICAvLyA8ZGl2IGlkPVwiYVwiPjxkaXYgaWQ9XCJiXCI+PGRpdiBpZD1cImNcIj5IZWxsbzwvZGl2PjwvZGl2PjwvZGl2PlxuICAgICAgICAvLyB3ZSdyZSBvbmx5IGludGVyZXN0ZWQgaW4gZGl2I2FcbiAgICAgICAgaWYgKGxhc3RSb290ICYmIGxhc3RSb290LmNvbnRhaW5zKGVsZW1lbnQpKSB7XG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxhc3RSb290ID0gZWxlbWVudDtcblxuICAgICAgICBpZiAodGFyZ2V0cyAmJiAhdGFyZ2V0cy5zb21lKHRhcmdldCA9PiBlbGVtZW50LmNvbnRhaW5zKHRhcmdldCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LmNvbnRhaW5zKGVsZW1lbnQpKSkge1xuICAgICAgICAgIHlpZWxkIG51bGw7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVzdEluZm8pXG4gICAgICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmFkZChlbGVtZW50KTtcblxuICAgICAgICBpZiAodGhpcy5fcmVnZXhwICYmIHRoaXMuX3JlZ2V4cC50ZXN0KGVsZW1lbnQudGV4dENvbnRlbnQpKVxuICAgICAgICAgIHlpZWxkIGVsZW1lbnQ7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICB5aWVsZCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5jbGFzcyBQcm9wc1NlbGVjdG9yIHtcbiAgY29uc3RydWN0b3IocHJvcGVydHlFeHByZXNzaW9uKSB7XG4gICAgdGhpcy5kZXBlbmRzT25TdHlsZXMgPSB0cnVlO1xuICAgIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzID0gdHJ1ZTtcblxuICAgIGxldCByZWdleHBTdHJpbmc7XG4gICAgaWYgKHByb3BlcnR5RXhwcmVzc2lvbi5sZW5ndGggPj0gMiAmJiBwcm9wZXJ0eUV4cHJlc3Npb25bMF0gPT0gXCIvXCIgJiZcbiAgICAgICAgcHJvcGVydHlFeHByZXNzaW9uW3Byb3BlcnR5RXhwcmVzc2lvbi5sZW5ndGggLSAxXSA9PSBcIi9cIilcbiAgICAgIHJlZ2V4cFN0cmluZyA9IHByb3BlcnR5RXhwcmVzc2lvbi5zbGljZSgxLCAtMSk7XG4gICAgZWxzZVxuICAgICAgcmVnZXhwU3RyaW5nID0gZmlsdGVyVG9SZWdFeHAocHJvcGVydHlFeHByZXNzaW9uKTtcblxuICAgIHRoaXMuX3JlZ2V4cCA9IG5ldyBSZWdFeHAocmVnZXhwU3RyaW5nLCBcImlcIik7XG5cbiAgICB0aGlzLl9zdWJTZWxlY3RvcnMgPSBbXTtcbiAgfVxuXG4gICpnZXRTZWxlY3RvcnMocHJlZml4LCBzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgZm9yIChsZXQgc3ViU2VsZWN0b3Igb2YgdGhpcy5fc3ViU2VsZWN0b3JzKSB7XG4gICAgICBpZiAoc3ViU2VsZWN0b3Iuc3RhcnRzV2l0aChcIipcIikgJiZcbiAgICAgICAgICAhaW5jb21wbGV0ZVByZWZpeFJlZ2V4cC50ZXN0KHByZWZpeCkpXG4gICAgICAgIHN1YlNlbGVjdG9yID0gc3ViU2VsZWN0b3Iuc3Vic3RyaW5nKDEpO1xuXG4gICAgICB5aWVsZCBbcXVhbGlmeVNlbGVjdG9yKHN1YlNlbGVjdG9yLCBwcmVmaXgpLCBzdWJ0cmVlXTtcbiAgICB9XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgdGhpcy5fc3ViU2VsZWN0b3JzID0gW107XG4gICAgZm9yIChsZXQgc3R5bGUgb2Ygc3R5bGVzKSB7XG4gICAgICBpZiAodGhpcy5fcmVnZXhwLnRlc3Qoc3R5bGUuc3R5bGUpKSB7XG4gICAgICAgIGZvciAobGV0IHN1YlNlbGVjdG9yIG9mIHN0eWxlLnN1YlNlbGVjdG9ycykge1xuICAgICAgICAgIGxldCBpZHggPSBzdWJTZWxlY3Rvci5sYXN0SW5kZXhPZihcIjo6XCIpO1xuICAgICAgICAgIGlmIChpZHggIT0gLTEpXG4gICAgICAgICAgICBzdWJTZWxlY3RvciA9IHN1YlNlbGVjdG9yLnN1YnN0cmluZygwLCBpZHgpO1xuXG4gICAgICAgICAgdGhpcy5fc3ViU2VsZWN0b3JzLnB1c2goc3ViU2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIFBhdHRlcm4ge1xuICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMsIHRleHQpIHtcbiAgICB0aGlzLnNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPblN0eWxlcygpIHtcbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX2RlcGVuZHNPblN0eWxlc1wiLCAoKSA9PiB0aGlzLnNlbGVjdG9ycy5zb21lKFxuICAgICAgICBzZWxlY3RvciA9PiBzZWxlY3Rvci5kZXBlbmRzT25TdHlsZXNcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0IG1heWJlRGVwZW5kc09uQXR0cmlidXRlcygpIHtcbiAgICAvLyBPYnNlcnZlIGNoYW5nZXMgdG8gYXR0cmlidXRlcyBpZiBlaXRoZXIgdGhlcmUncyBhIHBsYWluIHNlbGVjdG9yIHRoYXRcbiAgICAvLyBsb29rcyBsaWtlIGFuIElEIHNlbGVjdG9yLCBjbGFzcyBzZWxlY3Rvciwgb3IgYXR0cmlidXRlIHNlbGVjdG9yIGluIG9uZVxuICAgIC8vIG9mIHRoZSBwYXR0ZXJucyAoZS5nLiBcImFbaHJlZj0naHR0cHM6Ly9leGFtcGxlLmNvbS8nXVwiKVxuICAgIC8vIG9yIHRoZXJlJ3MgYSBwcm9wZXJ0aWVzIHNlbGVjdG9yIG5lc3RlZCBpbnNpZGUgYSBoYXMgc2VsZWN0b3JcbiAgICAvLyAoZS5nLiBcImRpdjotYWJwLWhhcyg6LWFicC1wcm9wZXJ0aWVzKGNvbG9yOiBibHVlKSlcIilcbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX21heWJlRGVwZW5kc09uQXR0cmlidXRlc1wiLCAoKSA9PiB0aGlzLnNlbGVjdG9ycy5zb21lKFxuICAgICAgICBzZWxlY3RvciA9PiBzZWxlY3Rvci5tYXliZURlcGVuZHNPbkF0dHJpYnV0ZXMgfHxcbiAgICAgICAgICAgICAgICAgICAgKHNlbGVjdG9yIGluc3RhbmNlb2YgSGFzU2VsZWN0b3IgJiZcbiAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yLmRlcGVuZHNPblN0eWxlcylcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgZ2V0IGRlcGVuZHNPbkNoYXJhY3RlckRhdGEoKSB7XG4gICAgLy8gT2JzZXJ2ZSBjaGFuZ2VzIHRvIGNoYXJhY3RlciBkYXRhIG9ubHkgaWYgdGhlcmUncyBhIGNvbnRhaW5zIHNlbGVjdG9yIGluXG4gICAgLy8gb25lIG9mIHRoZSBwYXR0ZXJucy5cbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX2RlcGVuZHNPbkNoYXJhY3RlckRhdGFcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IuZGVwZW5kc09uQ2hhcmFjdGVyRGF0YVxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBnZXQgbWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycygpIHtcbiAgICByZXR1cm4gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX21heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnNcIiwgKCkgPT4gdGhpcy5zZWxlY3RvcnMuc29tZShcbiAgICAgICAgc2VsZWN0b3IgPT4gc2VsZWN0b3IubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9yc1xuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBtYXRjaGVzTXV0YXRpb25UeXBlcyhtdXRhdGlvblR5cGVzKSB7XG4gICAgbGV0IG11dGF0aW9uVHlwZU1hdGNoTWFwID0gZ2V0Q2FjaGVkUHJvcGVydHlWYWx1ZShcbiAgICAgIHRoaXMsIFwiX211dGF0aW9uVHlwZU1hdGNoTWFwXCIsICgpID0+IG5ldyBNYXAoW1xuICAgICAgICAvLyBBbGwgdHlwZXMgb2YgRE9NLWRlcGVuZGVudCBwYXR0ZXJucyBhcmUgYWZmZWN0ZWQgYnkgbXV0YXRpb25zIG9mXG4gICAgICAgIC8vIHR5cGUgXCJjaGlsZExpc3RcIi5cbiAgICAgICAgW1wiY2hpbGRMaXN0XCIsIHRydWVdLFxuICAgICAgICBbXCJhdHRyaWJ1dGVzXCIsIHRoaXMubWF5YmVEZXBlbmRzT25BdHRyaWJ1dGVzXSxcbiAgICAgICAgW1wiY2hhcmFjdGVyRGF0YVwiLCB0aGlzLmRlcGVuZHNPbkNoYXJhY3RlckRhdGFdXG4gICAgICBdKVxuICAgICk7XG5cbiAgICBmb3IgKGxldCBtdXRhdGlvblR5cGUgb2YgbXV0YXRpb25UeXBlcykge1xuICAgICAgaWYgKG11dGF0aW9uVHlwZU1hdGNoTWFwLmdldChtdXRhdGlvblR5cGUpKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvKipcbiAgICogR2VuZXJhdG9yIGZ1bmN0aW9uIHJldHVybmluZyBDU1Mgc2VsZWN0b3JzIGZvciBhbGwgZWxlbWVudHMgdGhhdFxuICAgKiBtYXRjaCB0aGUgcGF0dGVybi5cbiAgICpcbiAgICogVGhpcyBhbGxvd3MgdHJhbnNmb3JtaW5nIGZyb20gc2VsZWN0b3JzIHRoYXQgbWF5IGNvbnRhaW4gY3VzdG9tXG4gICAqIDotYWJwLSBzZWxlY3RvcnMgdG8gcHVyZSBDU1Mgc2VsZWN0b3JzIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2VsZWN0XG4gICAqIGVsZW1lbnRzLlxuICAgKlxuICAgKiBUaGUgc2VsZWN0b3JzIHJldHVybmVkIGZyb20gdGhpcyBmdW5jdGlvbiBtYXkgYmUgaW52YWxpZGF0ZWQgYnkgRE9NXG4gICAqIG11dGF0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBzdWJ0cmVlIHRoZSBzdWJ0cmVlIHdlIHdvcmsgb25cbiAgICogQHBhcmFtIHtOb2RlW119IFt0YXJnZXRzXSB0aGUgbm9kZXMgd2UgYXJlIGludGVyZXN0ZWQgaW4uIE1heSBiZVxuICAgKiB1c2VkIHRvIG9wdGltaXplIHNlYXJjaC5cbiAgICovXG4gICpldmFsdWF0ZShzdWJ0cmVlLCB0YXJnZXRzKSB7XG4gICAgbGV0IHNlbGVjdG9ycyA9IHRoaXMuc2VsZWN0b3JzO1xuICAgIGZ1bmN0aW9uKiBldmFsdWF0ZUlubmVyKGluZGV4LCBwcmVmaXgsIGN1cnJlbnRTdWJ0cmVlKSB7XG4gICAgICBpZiAoaW5kZXggPj0gc2VsZWN0b3JzLmxlbmd0aCkge1xuICAgICAgICB5aWVsZCBwcmVmaXg7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGZvciAobGV0IFtzZWxlY3RvciwgZWxlbWVudF0gb2Ygc2VsZWN0b3JzW2luZGV4XS5nZXRTZWxlY3RvcnMoXG4gICAgICAgIHByZWZpeCwgY3VycmVudFN1YnRyZWUsIHRhcmdldHNcbiAgICAgICkpIHtcbiAgICAgICAgaWYgKHNlbGVjdG9yID09IG51bGwpXG4gICAgICAgICAgeWllbGQgbnVsbDtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHlpZWxkKiBldmFsdWF0ZUlubmVyKGluZGV4ICsgMSwgc2VsZWN0b3IsIGVsZW1lbnQpO1xuICAgICAgfVxuICAgICAgLy8gSnVzdCBpbiBjYXNlIHRoZSBnZXRTZWxlY3RvcnMoKSBnZW5lcmF0b3IgYWJvdmUgaGFkIHRvIHJ1biBzb21lIGhlYXZ5XG4gICAgICAvLyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCkgY2FsbCB3aGljaCBkaWRuJ3QgcHJvZHVjZSBhbnkgcmVzdWx0cywgbWFrZVxuICAgICAgLy8gc3VyZSB0aGVyZSBpcyBhdCBsZWFzdCBvbmUgcG9pbnQgd2hlcmUgZXhlY3V0aW9uIGNhbiBwYXVzZS5cbiAgICAgIHlpZWxkIG51bGw7XG4gICAgfVxuICAgIHlpZWxkKiBldmFsdWF0ZUlubmVyKDAsIFwiXCIsIHN1YnRyZWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyBpZiBhIHBhdHRlcm4gbWF0Y2hlcyBhIHNwZWNpZmljIGVsZW1lbnRcbiAgICogQHBhcmFtIHtOb2RlfSBbdGFyZ2V0XSB0aGUgZWxlbWVudCB3ZSdyZSBpbnRlcmVzdGVkIGluIGNoZWNraW5nIGZvclxuICAgKiBtYXRjaGVzIG9uLlxuICAgKiBAcGFyYW0ge05vZGV9IHN1YnRyZWUgdGhlIHN1YnRyZWUgd2Ugd29yayBvblxuICAgKiBAcmV0dXJuIHtib29sfVxuICAgKi9cbiAgbWF0Y2hlcyh0YXJnZXQsIHN1YnRyZWUpIHtcbiAgICBsZXQgdGFyZ2V0RmlsdGVyID0gW3RhcmdldF07XG4gICAgaWYgKHRoaXMubWF5YmVDb250YWluc1NpYmxpbmdDb21iaW5hdG9ycylcbiAgICAgIHRhcmdldEZpbHRlciA9IG51bGw7XG5cbiAgICBsZXQgc2VsZWN0b3JHZW5lcmF0b3IgPSB0aGlzLmV2YWx1YXRlKHN1YnRyZWUsIHRhcmdldEZpbHRlcik7XG4gICAgZm9yIChsZXQgc2VsZWN0b3Igb2Ygc2VsZWN0b3JHZW5lcmF0b3IpIHtcbiAgICAgIGlmIChzZWxlY3RvciAmJiB0YXJnZXQubWF0Y2hlcyhzZWxlY3RvcikpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBzZXRTdHlsZXMoc3R5bGVzKSB7XG4gICAgZm9yIChsZXQgc2VsZWN0b3Igb2YgdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgIGlmIChzZWxlY3Rvci5kZXBlbmRzT25TdHlsZXMpXG4gICAgICAgIHNlbGVjdG9yLnNldFN0eWxlcyhzdHlsZXMpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0TXV0YXRpb25UeXBlcyhtdXRhdGlvbnMpIHtcbiAgbGV0IHR5cGVzID0gbmV3IFNldCgpO1xuXG4gIGZvciAobGV0IG11dGF0aW9uIG9mIG11dGF0aW9ucykge1xuICAgIHR5cGVzLmFkZChtdXRhdGlvbi50eXBlKTtcblxuICAgIC8vIFRoZXJlIGFyZSBvbmx5IDMgdHlwZXMgb2YgbXV0YXRpb25zOiBcImF0dHJpYnV0ZXNcIiwgXCJjaGFyYWN0ZXJEYXRhXCIsIGFuZFxuICAgIC8vIFwiY2hpbGRMaXN0XCIuXG4gICAgaWYgKHR5cGVzLnNpemUgPT0gMylcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgcmV0dXJuIHR5cGVzO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0TXV0YXRpb25UYXJnZXRzKG11dGF0aW9ucykge1xuICBpZiAoIW11dGF0aW9ucylcbiAgICByZXR1cm4gbnVsbDtcblxuICBsZXQgdGFyZ2V0cyA9IG5ldyBTZXQoKTtcblxuICBmb3IgKGxldCBtdXRhdGlvbiBvZiBtdXRhdGlvbnMpIHtcbiAgICBpZiAobXV0YXRpb24udHlwZSA9PSBcImNoaWxkTGlzdFwiKSB7XG4gICAgICAvLyBXaGVuIG5ldyBub2RlcyBhcmUgYWRkZWQsIHdlJ3JlIGludGVyZXN0ZWQgaW4gdGhlIGFkZGVkIG5vZGVzIHJhdGhlclxuICAgICAgLy8gdGhhbiB0aGUgcGFyZW50LlxuICAgICAgZm9yIChsZXQgbm9kZSBvZiBtdXRhdGlvbi5hZGRlZE5vZGVzKVxuICAgICAgICB0YXJnZXRzLmFkZChub2RlKTtcbiAgICAgIGlmIChtdXRhdGlvbi5yZW1vdmVkTm9kZXMubGVuZ3RoID4gMClcbiAgICAgICAgdGFyZ2V0cy5hZGQobXV0YXRpb24udGFyZ2V0KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0YXJnZXRzLmFkZChtdXRhdGlvbi50YXJnZXQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBbLi4udGFyZ2V0c107XG59XG5cbmZ1bmN0aW9uIGZpbHRlclBhdHRlcm5zKHBhdHRlcm5zLCB7c3R5bGVzaGVldHMsIG11dGF0aW9uc30pIHtcbiAgaWYgKCFzdHlsZXNoZWV0cyAmJiAhbXV0YXRpb25zKVxuICAgIHJldHVybiBwYXR0ZXJucy5zbGljZSgpO1xuXG4gIGxldCBtdXRhdGlvblR5cGVzID0gbXV0YXRpb25zID8gZXh0cmFjdE11dGF0aW9uVHlwZXMobXV0YXRpb25zKSA6IG51bGw7XG5cbiAgcmV0dXJuIHBhdHRlcm5zLmZpbHRlcihcbiAgICBwYXR0ZXJuID0+IChzdHlsZXNoZWV0cyAmJiBwYXR0ZXJuLmRlcGVuZHNPblN0eWxlcykgfHxcbiAgICAgICAgICAgICAgIChtdXRhdGlvbnMgJiYgcGF0dGVybi5tYXRjaGVzTXV0YXRpb25UeXBlcyhtdXRhdGlvblR5cGVzKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkT2JzZXJ2ZUF0dHJpYnV0ZXMocGF0dGVybnMpIHtcbiAgcmV0dXJuIHBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1heWJlRGVwZW5kc09uQXR0cmlidXRlcyk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZE9ic2VydmVDaGFyYWN0ZXJEYXRhKHBhdHRlcm5zKSB7XG4gIHJldHVybiBwYXR0ZXJucy5zb21lKHBhdHRlcm4gPT4gcGF0dGVybi5kZXBlbmRzT25DaGFyYWN0ZXJEYXRhKTtcbn1cblxuZnVuY3Rpb24gc2hvdWxkT2JzZXJ2ZVN0eWxlcyhwYXR0ZXJucykge1xuICByZXR1cm4gcGF0dGVybnMuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4uZGVwZW5kc09uU3R5bGVzKTtcbn1cblxuLyoqXG4gKiBAY2FsbGJhY2sgaGlkZUVsZW1zRnVuY1xuICogQHBhcmFtIHtOb2RlW119IGVsZW1lbnRzIEVsZW1lbnRzIG9uIHRoZSBwYWdlIHRoYXQgc2hvdWxkIGJlIGhpZGRlblxuICogQHBhcmFtIHtzdHJpbmdbXX0gZWxlbWVudEZpbHRlcnNcbiAqICAgVGhlIGZpbHRlciB0ZXh0IHRoYXQgY2F1c2VkIHRoZSBlbGVtZW50cyB0byBiZSBoaWRkZW5cbiAqL1xuXG4vKipcbiAqIEBjYWxsYmFjayB1bmhpZGVFbGVtc0Z1bmNcbiAqIEBwYXJhbSB7Tm9kZVtdfSBlbGVtZW50cyBFbGVtZW50cyBvbiB0aGUgcGFnZSB0aGF0IHNob3VsZCBiZSBoaWRkZW5cbiAqL1xuXG5cbi8qKlxuICogTWFuYWdlcyB0aGUgZnJvbnQtZW5kIHByb2Nlc3Npbmcgb2YgZWxlbWVudCBoaWRpbmcgZW11bGF0aW9uIGZpbHRlcnMuXG4gKi9cbmV4cG9ydHMuRWxlbUhpZGVFbXVsYXRpb24gPSBjbGFzcyBFbGVtSGlkZUVtdWxhdGlvbiB7XG4gIC8qKlxuICAgKiBAcGFyYW0ge21vZHVsZTpjb250ZW50L2VsZW1IaWRlRW11bGF0aW9ufmhpZGVFbGVtc0Z1bmN9IGhpZGVFbGVtc0Z1bmNcbiAgICogICBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIHByb3ZpZGVkIHRvIGRvIHRoZSBhY3R1YWwgZWxlbWVudCBoaWRpbmcuXG4gICAqIEBwYXJhbSB7bW9kdWxlOmNvbnRlbnQvZWxlbUhpZGVFbXVsYXRpb25+dW5oaWRlRWxlbXNGdW5jfSB1bmhpZGVFbGVtc0Z1bmNcbiAgICogICBBIGNhbGxiYWNrIHRoYXQgc2hvdWxkIGJlIHByb3ZpZGVkIHRvIHVuaGlkZSBwcmV2aW91c2x5IGhpZGRlbiBlbGVtZW50cy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGhpZGVFbGVtc0Z1bmMgPSAoKSA9PiB7fSwgdW5oaWRlRWxlbXNGdW5jID0gKCkgPT4ge30pIHtcbiAgICB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzID0gZmFsc2U7XG4gICAgdGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2xhc3RJbnZvY2F0aW9uID0gLW1pbkludm9jYXRpb25JbnRlcnZhbDtcbiAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0gbnVsbDtcblxuICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICB0aGlzLmhpZGVFbGVtc0Z1bmMgPSBoaWRlRWxlbXNGdW5jO1xuICAgIHRoaXMudW5oaWRlRWxlbXNGdW5jID0gdW5oaWRlRWxlbXNGdW5jO1xuICAgIHRoaXMub2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcih0aGlzLm9ic2VydmUuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5oaWRkZW5FbGVtZW50cyA9IG5ldyBTZXQoKTtcbiAgfVxuXG4gIGlzU2FtZU9yaWdpbihzdHlsZXNoZWV0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiBuZXcgVVJMKHN0eWxlc2hlZXQuaHJlZikub3JpZ2luID09IHRoaXMuZG9jdW1lbnQubG9jYXRpb24ub3JpZ2luO1xuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgLy8gSW52YWxpZCBVUkwsIGFzc3VtZSB0aGF0IGl0IGlzIGZpcnN0LXBhcnR5LlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIHRoZSBzZWxlY3RvclxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2VsZWN0b3IgdGhlIHNlbGVjdG9yIHRvIHBhcnNlXG4gICAqIEByZXR1cm4ge0FycmF5fSBzZWxlY3RvcnMgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyxcbiAgICogb3IgbnVsbCBpbiBjYXNlIG9mIGVycm9ycy5cbiAgICovXG4gIHBhcnNlU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICBpZiAoc2VsZWN0b3IubGVuZ3RoID09IDApXG4gICAgICByZXR1cm4gW107XG5cbiAgICBsZXQgbWF0Y2ggPSBhYnBTZWxlY3RvclJlZ2V4cC5leGVjKHNlbGVjdG9yKTtcbiAgICBpZiAoIW1hdGNoKVxuICAgICAgcmV0dXJuIFtuZXcgUGxhaW5TZWxlY3RvcihzZWxlY3RvcildO1xuXG4gICAgbGV0IHNlbGVjdG9ycyA9IFtdO1xuICAgIGlmIChtYXRjaC5pbmRleCA+IDApXG4gICAgICBzZWxlY3RvcnMucHVzaChuZXcgUGxhaW5TZWxlY3RvcihzZWxlY3Rvci5zdWJzdHJpbmcoMCwgbWF0Y2guaW5kZXgpKSk7XG5cbiAgICBsZXQgc3RhcnRJbmRleCA9IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoO1xuICAgIGxldCBjb250ZW50ID0gcGFyc2VTZWxlY3RvckNvbnRlbnQoc2VsZWN0b3IsIHN0YXJ0SW5kZXgpO1xuICAgIGlmICghY29udGVudCkge1xuICAgICAgY29uc29sZS53YXJuKG5ldyBTeW50YXhFcnJvcihcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0gYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiZHVlIHRvIHVubWF0Y2hlZCBwYXJlbnRoZXNlcy5cIikpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChtYXRjaFsxXSA9PSBcIi1hYnAtcHJvcGVydGllc1wiKSB7XG4gICAgICBzZWxlY3RvcnMucHVzaChuZXcgUHJvcHNTZWxlY3Rvcihjb250ZW50LnRleHQpKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobWF0Y2hbMV0gPT0gXCItYWJwLWhhc1wiIHx8IG1hdGNoWzFdID09IFwiaGFzXCIpIHtcbiAgICAgIGxldCBoYXNTZWxlY3RvcnMgPSB0aGlzLnBhcnNlU2VsZWN0b3IoY29udGVudC50ZXh0KTtcbiAgICAgIGlmIChoYXNTZWxlY3RvcnMgPT0gbnVsbClcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICBzZWxlY3RvcnMucHVzaChuZXcgSGFzU2VsZWN0b3IoaGFzU2VsZWN0b3JzKSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09IFwiLWFicC1jb250YWluc1wiIHx8IG1hdGNoWzFdID09IFwiaGFzLXRleHRcIikge1xuICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IENvbnRhaW5zU2VsZWN0b3IoY29udGVudC50ZXh0KSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09PSBcInhwYXRoXCIpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNlbGVjdG9ycy5wdXNoKG5ldyBYUGF0aFNlbGVjdG9yKGNvbnRlbnQudGV4dCkpO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKHttZXNzYWdlfSkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgICAgXCJGYWlsZWQgdG8gcGFyc2UgQWRibG9jayBQbHVzIFwiICtcbiAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSwgaW52YWxpZCBgICtcbiAgICAgICAgICAgIGB4cGF0aDogJHtjb250ZW50LnRleHR9IGAgK1xuICAgICAgICAgICAgYGVycm9yOiAke21lc3NhZ2V9LmBcbiAgICAgICAgICApXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKG1hdGNoWzFdID09IFwibm90XCIpIHtcbiAgICAgIGxldCBub3RTZWxlY3RvcnMgPSB0aGlzLnBhcnNlU2VsZWN0b3IoY29udGVudC50ZXh0KTtcbiAgICAgIGlmIChub3RTZWxlY3RvcnMgPT0gbnVsbClcbiAgICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICAgIC8vIGlmIGFsbCBvZiB0aGUgaW5uZXIgc2VsZWN0b3JzIGFyZSBQbGFpblNlbGVjdG9ycywgdGhlbiB3ZVxuICAgICAgLy8gZG9uJ3QgYWN0dWFsbHkgbmVlZCB0byB1c2Ugb3VyIHNlbGVjdG9yIGF0IGFsbC4gV2UncmUgYmV0dGVyXG4gICAgICAvLyBvZmYgZGVsZWdhdGluZyB0byB0aGUgYnJvd3NlciA6bm90IGltcGxlbWVudGF0aW9uLlxuICAgICAgaWYgKG5vdFNlbGVjdG9ycy5ldmVyeShzID0+IHMgaW5zdGFuY2VvZiBQbGFpblNlbGVjdG9yKSlcbiAgICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IFBsYWluU2VsZWN0b3IoYDpub3QoJHtjb250ZW50LnRleHR9KWApKTtcbiAgICAgIGVsc2VcbiAgICAgICAgc2VsZWN0b3JzLnB1c2gobmV3IE5vdFNlbGVjdG9yKG5vdFNlbGVjdG9ycykpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRoaXMgaXMgYW4gZXJyb3IsIGNhbid0IHBhcnNlIHNlbGVjdG9yLlxuICAgICAgY29uc29sZS53YXJuKG5ldyBTeW50YXhFcnJvcihcIkZhaWxlZCB0byBwYXJzZSBBZGJsb2NrIFBsdXMgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgc2VsZWN0b3IgJHtzZWxlY3Rvcn0sIGludmFsaWQgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBwc2V1ZG8tY2xhc3MgOiR7bWF0Y2hbMV19KCkuYCkpO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgbGV0IHN1ZmZpeCA9IHRoaXMucGFyc2VTZWxlY3RvcihzZWxlY3Rvci5zdWJzdHJpbmcoY29udGVudC5lbmQgKyAxKSk7XG4gICAgaWYgKHN1ZmZpeCA9PSBudWxsKVxuICAgICAgcmV0dXJuIG51bGw7XG5cbiAgICBzZWxlY3RvcnMucHVzaCguLi5zdWZmaXgpO1xuXG4gICAgaWYgKHNlbGVjdG9ycy5sZW5ndGggPT0gMSAmJiBzZWxlY3RvcnNbMF0gaW5zdGFuY2VvZiBDb250YWluc1NlbGVjdG9yKSB7XG4gICAgICBjb25zb2xlLndhcm4obmV3IFN5bnRheEVycm9yKFwiRmFpbGVkIHRvIHBhcnNlIEFkYmxvY2sgUGx1cyBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGBzZWxlY3RvciAke3NlbGVjdG9yfSwgY2FuJ3QgYCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiaGF2ZSBhIGxvbmVseSA6LWFicC1jb250YWlucygpLlwiKSk7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHNlbGVjdG9ycztcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgcnVsZXMgb3V0IG9mIENTUyBzdHlsZXNoZWV0c1xuICAgKiBAcGFyYW0ge0NTU1N0eWxlU2hlZXRbXX0gW3N0eWxlc2hlZXRzXSBUaGUgbGlzdCBvZiBzdHlsZXNoZWV0cyB0b1xuICAgKiByZWFkLlxuICAgKiBAcmV0dXJuIHtDU1NTdHlsZVJ1bGVbXX1cbiAgICovXG4gIF9yZWFkQ3NzUnVsZXMoc3R5bGVzaGVldHMpIHtcbiAgICBsZXQgY3NzU3R5bGVzID0gW107XG5cbiAgICBmb3IgKGxldCBzdHlsZXNoZWV0IG9mIHN0eWxlc2hlZXRzIHx8IFtdKSB7XG4gICAgICAvLyBFeHBsaWNpdGx5IGlnbm9yZSB0aGlyZC1wYXJ0eSBzdHlsZXNoZWV0cyB0byBlbnN1cmUgY29uc2lzdGVudCBiZWhhdmlvclxuICAgICAgLy8gYmV0d2VlbiBGaXJlZm94IGFuZCBDaHJvbWUuXG4gICAgICBpZiAoIXRoaXMuaXNTYW1lT3JpZ2luKHN0eWxlc2hlZXQpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgbGV0IHJ1bGVzO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcnVsZXMgPSBzdHlsZXNoZWV0LmNzc1J1bGVzO1xuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgLy8gT24gRmlyZWZveCwgdGhlcmUgaXMgYSBjaGFuY2UgdGhhdCBhbiBJbnZhbGlkQWNjZXNzRXJyb3JcbiAgICAgICAgLy8gZ2V0IHRocm93biB3aGVuIGFjY2Vzc2luZyBjc3NSdWxlcy4gSnVzdCBza2lwIHRoZSBzdHlsZXNoZWV0XG4gICAgICAgIC8vIGluIHRoYXQgY2FzZS5cbiAgICAgICAgLy8gU2VlIGh0dHBzOi8vc2VhcmNoZm94Lm9yZy9tb3ppbGxhLWNlbnRyYWwvcmV2L2Y2NWQ3NTI4ZTM0ZWYxYTc2NjViNGExYTdiN2NkYjEzODhmY2QzYWEvbGF5b3V0L3N0eWxlL1N0eWxlU2hlZXQuY3BwIzY5OVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFydWxlcylcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGZvciAobGV0IHJ1bGUgb2YgcnVsZXMpIHtcbiAgICAgICAgaWYgKHJ1bGUudHlwZSAhPSBydWxlLlNUWUxFX1JVTEUpXG4gICAgICAgICAgY29udGludWU7XG5cbiAgICAgICAgY3NzU3R5bGVzLnB1c2goc3RyaW5naWZ5U3R5bGUocnVsZSkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3NzU3R5bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3NlcyB0aGUgY3VycmVudCBkb2N1bWVudCBhbmQgYXBwbGllcyBhbGwgcnVsZXMgdG8gaXQuXG4gICAqIEBwYXJhbSB7Q1NTU3R5bGVTaGVldFtdfSBbc3R5bGVzaGVldHNdXG4gICAqICAgIFRoZSBsaXN0IG9mIG5ldyBzdHlsZXNoZWV0cyB0aGF0IGhhdmUgYmVlbiBhZGRlZCB0byB0aGUgZG9jdW1lbnQgYW5kXG4gICAqICAgIG1hZGUgcmVwcm9jZXNzaW5nIG5lY2Vzc2FyeS4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkbid0IGJlIHBhc3NlZCBpbiBmb3JcbiAgICogICAgdGhlIGluaXRpYWwgcHJvY2Vzc2luZywgYWxsIG9mIGRvY3VtZW50J3Mgc3R5bGVzaGVldHMgd2lsbCBiZSBjb25zaWRlcmVkXG4gICAqICAgIHRoZW4gYW5kIGFsbCBydWxlcywgaW5jbHVkaW5nIHRoZSBvbmVzIG5vdCBkZXBlbmRlbnQgb24gc3R5bGVzLlxuICAgKiBAcGFyYW0ge011dGF0aW9uUmVjb3JkW119IFttdXRhdGlvbnNdXG4gICAqICAgIFRoZSBsaXN0IG9mIERPTSBtdXRhdGlvbnMgdGhhdCBoYXZlIGJlZW4gYXBwbGllZCB0byB0aGUgZG9jdW1lbnQgYW5kXG4gICAqICAgIG1hZGUgcmVwcm9jZXNzaW5nIG5lY2Vzc2FyeS4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkbid0IGJlIHBhc3NlZCBpbiBmb3JcbiAgICogICAgdGhlIGluaXRpYWwgcHJvY2Vzc2luZywgdGhlIGVudGlyZSBkb2N1bWVudCB3aWxsIGJlIGNvbnNpZGVyZWRcbiAgICogICAgdGhlbiBhbmQgYWxsIHJ1bGVzLCBpbmNsdWRpbmcgdGhlIG9uZXMgbm90IGRlcGVuZGVudCBvbiB0aGUgRE9NLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKiAgICBBIHByb21pc2UgdGhhdCBpcyBmdWxmaWxsZWQgb25jZSBhbGwgZmlsdGVyaW5nIGlzIGNvbXBsZXRlZFxuICAgKi9cbiAgYXN5bmMgX2FkZFNlbGVjdG9ycyhzdHlsZXNoZWV0cywgbXV0YXRpb25zKSB7XG4gICAgaWYgKHRlc3RJbmZvKVxuICAgICAgdGVzdEluZm8ubGFzdFByb2Nlc3NlZEVsZW1lbnRzLmNsZWFyKCk7XG5cbiAgICBsZXQgZGVhZGxpbmUgPSBuZXdJZGxlRGVhZGxpbmUoKTtcblxuICAgIGlmIChzaG91bGRPYnNlcnZlU3R5bGVzKHRoaXMucGF0dGVybnMpKVxuICAgICAgdGhpcy5fcmVmcmVzaFBhdHRlcm5TdHlsZXMoKTtcblxuICAgIGxldCBwYXR0ZXJuc1RvQ2hlY2sgPSBmaWx0ZXJQYXR0ZXJucyhcbiAgICAgIHRoaXMucGF0dGVybnMsIHtzdHlsZXNoZWV0cywgbXV0YXRpb25zfVxuICAgICk7XG5cbiAgICBsZXQgdGFyZ2V0cyA9IGV4dHJhY3RNdXRhdGlvblRhcmdldHMobXV0YXRpb25zKTtcblxuICAgIGxldCBlbGVtZW50c1RvSGlkZSA9IFtdO1xuICAgIGxldCBlbGVtZW50RmlsdGVycyA9IFtdO1xuICAgIGxldCBlbGVtZW50c1RvVW5oaWRlID0gbmV3IFNldCh0aGlzLmhpZGRlbkVsZW1lbnRzKTtcblxuICAgIGZvciAobGV0IHBhdHRlcm4gb2YgcGF0dGVybnNUb0NoZWNrKSB7XG4gICAgICBsZXQgZXZhbHVhdGlvblRhcmdldHMgPSB0YXJnZXRzO1xuXG4gICAgICAvLyBJZiB0aGUgcGF0dGVybiBhcHBlYXJzIHRvIGNvbnRhaW4gYW55IHNpYmxpbmcgY29tYmluYXRvcnMsIHdlIGNhbid0XG4gICAgICAvLyBlYXNpbHkgb3B0aW1pemUgYmFzZWQgb24gdGhlIG11dGF0aW9uIHRhcmdldHMuIFNpbmNlIHRoaXMgaXMgYVxuICAgICAgLy8gc3BlY2lhbCBjYXNlLCBza2lwIHRoZSBvcHRpbWl6YXRpb24uIEJ5IHNldHRpbmcgaXQgdG8gbnVsbCBoZXJlIHdlXG4gICAgICAvLyBtYWtlIHN1cmUgd2UgcHJvY2VzcyB0aGUgZW50aXJlIERPTS5cbiAgICAgIGlmIChwYXR0ZXJuLm1heWJlQ29udGFpbnNTaWJsaW5nQ29tYmluYXRvcnMpXG4gICAgICAgIGV2YWx1YXRpb25UYXJnZXRzID0gbnVsbDtcblxuICAgICAgbGV0IGdlbmVyYXRvciA9IHBhdHRlcm4uZXZhbHVhdGUodGhpcy5kb2N1bWVudCwgZXZhbHVhdGlvblRhcmdldHMpO1xuICAgICAgZm9yIChsZXQgc2VsZWN0b3Igb2YgZ2VuZXJhdG9yKSB7XG4gICAgICAgIGlmIChzZWxlY3RvciAhPSBudWxsKSB7XG4gICAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiB0aGlzLmRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaGlkZGVuRWxlbWVudHMuaGFzKGVsZW1lbnQpKSB7XG4gICAgICAgICAgICAgIGVsZW1lbnRzVG9IaWRlLnB1c2goZWxlbWVudCk7XG4gICAgICAgICAgICAgIGVsZW1lbnRGaWx0ZXJzLnB1c2gocGF0dGVybi50ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBlbGVtZW50c1RvVW5oaWRlLmRlbGV0ZShlbGVtZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVhZGxpbmUudGltZVJlbWFpbmluZygpIDw9IDApXG4gICAgICAgICAgZGVhZGxpbmUgPSBhd2FpdCB5aWVsZFRocmVhZCgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9oaWRlRWxlbXMoZWxlbWVudHNUb0hpZGUsIGVsZW1lbnRGaWx0ZXJzKTtcblxuICAgIC8vIFRoZSBzZWFyY2ggZm9yIGVsZW1lbnRzIHRvIGhpZGUgaXQgb3B0aW1pemVkIHRvIGZpbmQgbmV3IHRoaW5nc1xuICAgIC8vIHRvIGhpZGUgcXVpY2tseSwgYnkgbm90IGNoZWNraW5nIGFsbCBwYXR0ZXJucyBhbmQgbm90IGNoZWNraW5nXG4gICAgLy8gdGhlIGZ1bGwgRE9NLiBUaGF0J3Mgd2h5IHdlIG5lZWQgdG8gZG8gYSBtb3JlIHRob3JvdWdoIGNoZWNrXG4gICAgLy8gZm9yIGVhY2ggcmVtYWluaW5nIGVsZW1lbnQgdGhhdCBtaWdodCBuZWVkIHRvIGJlIHVuaGlkZGVuLFxuICAgIC8vIGNoZWNraW5nIGFsbCBwYXR0ZXJucy5cbiAgICBmb3IgKGxldCBlbGVtIG9mIGVsZW1lbnRzVG9VbmhpZGUpIHtcbiAgICAgIGlmICghZWxlbS5pc0Nvbm5lY3RlZCkge1xuICAgICAgICAvLyBlbGVtZW50cyB0aGF0IGFyZSBubyBsb25nZXIgaW4gdGhlIERPTSBzaG91bGQgYmUgdW5oaWRkZW5cbiAgICAgICAgLy8gaW4gY2FzZSB0aGV5J3JlIGV2ZXIgcmVhZGRlZCwgYW5kIHRoZW4gZm9yZ290dGVuIGFib3V0IHNvXG4gICAgICAgIC8vIHdlIGRvbid0IGNhdXNlIGEgbWVtb3J5IGxlYWsuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgbGV0IG1hdGNoZXNBbnkgPSB0aGlzLnBhdHRlcm5zLnNvbWUocGF0dGVybiA9PiBwYXR0ZXJuLm1hdGNoZXMoXG4gICAgICAgIGVsZW0sIHRoaXMuZG9jdW1lbnRcbiAgICAgICkpO1xuICAgICAgaWYgKG1hdGNoZXNBbnkpXG4gICAgICAgIGVsZW1lbnRzVG9VbmhpZGUuZGVsZXRlKGVsZW0pO1xuXG4gICAgICBpZiAoZGVhZGxpbmUudGltZVJlbWFpbmluZygpIDw9IDApXG4gICAgICAgIGRlYWRsaW5lID0gYXdhaXQgeWllbGRUaHJlYWQoKTtcbiAgICB9XG4gICAgdGhpcy5fdW5oaWRlRWxlbXMoQXJyYXkuZnJvbShlbGVtZW50c1RvVW5oaWRlKSk7XG4gIH1cblxuICBfaGlkZUVsZW1zKGVsZW1lbnRzVG9IaWRlLCBlbGVtZW50RmlsdGVycykge1xuICAgIGlmIChlbGVtZW50c1RvSGlkZS5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmhpZGVFbGVtc0Z1bmMoZWxlbWVudHNUb0hpZGUsIGVsZW1lbnRGaWx0ZXJzKTtcbiAgICAgIGZvciAobGV0IGVsZW0gb2YgZWxlbWVudHNUb0hpZGUpXG4gICAgICAgIHRoaXMuaGlkZGVuRWxlbWVudHMuYWRkKGVsZW0pO1xuICAgIH1cbiAgfVxuXG4gIF91bmhpZGVFbGVtcyhlbGVtZW50c1RvVW5oaWRlKSB7XG4gICAgaWYgKGVsZW1lbnRzVG9VbmhpZGUubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy51bmhpZGVFbGVtc0Z1bmMoZWxlbWVudHNUb1VuaGlkZSk7XG4gICAgICBmb3IgKGxldCBlbGVtIG9mIGVsZW1lbnRzVG9VbmhpZGUpXG4gICAgICAgIHRoaXMuaGlkZGVuRWxlbWVudHMuZGVsZXRlKGVsZW0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQZXJmb3JtZWQgYW55IHNjaGVkdWxlZCBwcm9jZXNzaW5nLlxuICAgKlxuICAgKiBUaGlzIGZ1bmN0aW9uIGlzIGFzeW5jcm9ub3VzLCBhbmQgc2hvdWxkIG5vdCBiZSBydW4gbXVsdGlwbGVcbiAgICogdGltZXMgaW4gcGFyYWxsZWwuIFRoZSBmbGFnIGBfZmlsdGVyaW5nSW5Qcm9ncmVzc2AgaXMgc2V0IGFuZFxuICAgKiB1bnNldCBzbyB5b3UgY2FuIGNoZWNrIGlmIGl0J3MgYWxyZWFkeSBydW5uaW5nLlxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKiAgQSBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIG9uY2UgYWxsIGZpbHRlcmluZyBpcyBjb21wbGV0ZWRcbiAgICovXG4gIGFzeW5jIF9wcm9jZXNzRmlsdGVyaW5nKCkge1xuICAgIGlmICh0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzKSB7XG4gICAgICBjb25zb2xlLndhcm4oXCJFbGVtSGlkZUVtdWxhdGlvbiBzY2hlZHVsaW5nIGVycm9yOiBcIiArXG4gICAgICAgICAgICAgICAgICAgXCJUcmllZCB0byBwcm9jZXNzIGZpbHRlcmluZyBpbiBwYXJhbGxlbC5cIik7XG4gICAgICBpZiAodGVzdEluZm8pIHtcbiAgICAgICAgdGVzdEluZm8uZmFpbGVkQXNzZXJ0aW9ucy5wdXNoKFxuICAgICAgICAgIFwiVHJpZWQgdG8gcHJvY2VzcyBmaWx0ZXJpbmcgaW4gcGFyYWxsZWxcIlxuICAgICAgICApO1xuICAgICAgfVxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgcGFyYW1zID0gdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZyB8fCB7fTtcbiAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0gbnVsbDtcbiAgICB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzID0gdHJ1ZTtcbiAgICB0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkID0gZmFsc2U7XG4gICAgYXdhaXQgdGhpcy5fYWRkU2VsZWN0b3JzKFxuICAgICAgcGFyYW1zLnN0eWxlc2hlZXRzLFxuICAgICAgcGFyYW1zLm11dGF0aW9uc1xuICAgICk7XG4gICAgdGhpcy5fbGFzdEludm9jYXRpb24gPSBwZXJmb3JtYW5jZS5ub3coKTtcbiAgICB0aGlzLl9maWx0ZXJpbmdJblByb2dyZXNzID0gZmFsc2U7XG4gICAgaWYgKHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcpXG4gICAgICB0aGlzLl9zY2hlZHVsZU5leHRGaWx0ZXJpbmcoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBlbmRzIG5ldyBjaGFuZ2VzIHRvIHRoZSBsaXN0IG9mIGZpbHRlcnMgZm9yIHRoZSBuZXh0IHRpbWVcbiAgICogZmlsdGVyaW5nIGlzIHJ1bi5cbiAgICogQHBhcmFtIHtDU1NTdHlsZVNoZWV0W119IFtzdHlsZXNoZWV0c11cbiAgICogICAgbmV3IHN0eWxlc2hlZXRzIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKiBAcGFyYW0ge011dGF0aW9uUmVjb3JkW119IFttdXRhdGlvbnNdXG4gICAqICAgIG5ldyBET00gbXV0YXRpb25zIHRvIGJlIHByb2Nlc3NlZC4gVGhpcyBwYXJhbWV0ZXIgc2hvdWxkIGJlIG9taXR0ZWRcbiAgICogICAgZm9yIGZ1bGwgcmVwcm9jZXNzaW5nLlxuICAgKi9cbiAgX2FwcGVuZFNjaGVkdWxlZFByb2Nlc3Npbmcoc3R5bGVzaGVldHMsIG11dGF0aW9ucykge1xuICAgIGlmICghdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZykge1xuICAgICAgLy8gVGhlcmUgaXNuJ3QgYW55dGhpbmcgc2NoZWR1bGVkIHlldC4gTWFrZSB0aGUgc2NoZWR1bGUuXG4gICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nID0ge3N0eWxlc2hlZXRzLCBtdXRhdGlvbnN9O1xuICAgIH1cbiAgICBlbHNlIGlmICghc3R5bGVzaGVldHMgJiYgIW11dGF0aW9ucykge1xuICAgICAgLy8gVGhlIG5ldyByZXF1ZXN0IHdhcyB0byByZXByb2Nlc3MgZXZlcnl0aGluZywgYW5kIHNvIGFueVxuICAgICAgLy8gcHJldmlvdXMgZmlsdGVycyBhcmUgaXJyZWxldmFudC5cbiAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgPSB7fTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cyB8fFxuICAgICAgICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcubXV0YXRpb25zKSB7XG4gICAgICAvLyBUaGUgcHJldmlvdXMgZmlsdGVycyBhcmUgbm90IHRvIGZpbHRlciBldmVyeXRoaW5nLCBzbyB0aGUgbmV3XG4gICAgICAvLyBwYXJhbWV0ZXJzIG1hdHRlci4gUHVzaCB0aGVtIG9udG8gdGhlIGFwcHJvcHJpYXRlIGxpc3RzLlxuICAgICAgaWYgKHN0eWxlc2hlZXRzKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5zdHlsZXNoZWV0cylcbiAgICAgICAgICB0aGlzLl9zY2hlZHVsZWRQcm9jZXNzaW5nLnN0eWxlc2hlZXRzID0gW107XG4gICAgICAgIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3Npbmcuc3R5bGVzaGVldHMucHVzaCguLi5zdHlsZXNoZWV0cyk7XG4gICAgICB9XG4gICAgICBpZiAobXV0YXRpb25zKSB7XG4gICAgICAgIGlmICghdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMpXG4gICAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMgPSBbXTtcbiAgICAgICAgdGhpcy5fc2NoZWR1bGVkUHJvY2Vzc2luZy5tdXRhdGlvbnMucHVzaCguLi5tdXRhdGlvbnMpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIHRoaXMuX3NjaGVkdWxlZFByb2Nlc3NpbmcgaXMgYWxyZWFkeSBnb2luZyB0byByZWNoZWNrXG4gICAgICAvLyBldmVyeXRoaW5nLCBzbyBubyBuZWVkIHRvIGRvIGFueXRoaW5nIGhlcmUuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNjaGVkdWxlIGZpbHRlcmluZyB0byBiZSBwcm9jZXNzZWQgaW4gdGhlIGZ1dHVyZSwgb3Igc3RhcnRcbiAgICogcHJvY2Vzc2luZyBpbW1lZGlhdGVseS5cbiAgICpcbiAgICogSWYgcHJvY2Vzc2luZyBpcyBhbHJlYWR5IHNjaGVkdWxlZCwgdGhpcyBkb2VzIG5vdGhpbmcuXG4gICAqL1xuICBfc2NoZWR1bGVOZXh0RmlsdGVyaW5nKCkge1xuICAgIGlmICh0aGlzLl9uZXh0RmlsdGVyaW5nU2NoZWR1bGVkIHx8IHRoaXMuX2ZpbHRlcmluZ0luUHJvZ3Jlc3MpIHtcbiAgICAgIC8vIFRoZSBuZXh0IG9uZSBoYXMgYWxyZWFkeSBiZWVuIHNjaGVkdWxlZC4gT3VyIG5ldyBldmVudHMgYXJlXG4gICAgICAvLyBvbiB0aGUgcXVldWUsIHNvIG5vdGhpbmcgbW9yZSB0byBkby5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kb2N1bWVudC5yZWFkeVN0YXRlID09PSBcImxvYWRpbmdcIikge1xuICAgICAgLy8gRG9jdW1lbnQgaXNuJ3QgZnVsbHkgbG9hZGVkIHlldCwgc28gc2NoZWR1bGUgb3VyIGZpcnN0XG4gICAgICAvLyBmaWx0ZXJpbmcgYXMgc29vbiBhcyB0aGF0J3MgZG9uZS5cbiAgICAgIHRoaXMuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAgICAgXCJET01Db250ZW50TG9hZGVkXCIsXG4gICAgICAgICgpID0+IHRoaXMuX3Byb2Nlc3NGaWx0ZXJpbmcoKSxcbiAgICAgICAge29uY2U6IHRydWV9XG4gICAgICApO1xuICAgICAgdGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCA9IHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fbGFzdEludm9jYXRpb24gPFxuICAgICAgICAgICAgIG1pbkludm9jYXRpb25JbnRlcnZhbCkge1xuICAgICAgLy8gSXQgaGFzbid0IGJlZW4gbG9uZyBlbm91Z2ggc2luY2Ugb3VyIGxhc3QgZmlsdGVyLiBTZXQgdGhlXG4gICAgICAvLyB0aW1lb3V0IGZvciB3aGVuIGl0J3MgdGltZSBmb3IgdGhhdC5cbiAgICAgIHNldFRpbWVvdXQoXG4gICAgICAgICgpID0+IHRoaXMuX3Byb2Nlc3NGaWx0ZXJpbmcoKSxcbiAgICAgICAgbWluSW52b2NhdGlvbkludGVydmFsIC0gKHBlcmZvcm1hbmNlLm5vdygpIC0gdGhpcy5fbGFzdEludm9jYXRpb24pXG4gICAgICApO1xuICAgICAgdGhpcy5fbmV4dEZpbHRlcmluZ1NjaGVkdWxlZCA9IHRydWU7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gV2UgY2FuIGFjdHVhbGx5IGp1c3Qgc3RhcnQgZmlsdGVyaW5nIGltbWVkaWF0ZWx5IVxuICAgICAgdGhpcy5fcHJvY2Vzc0ZpbHRlcmluZygpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZS1ydW4gZmlsdGVyaW5nIGVpdGhlciBpbW1lZGlhdGVseSBvciBxdWV1ZWQuXG4gICAqIEBwYXJhbSB7Q1NTU3R5bGVTaGVldFtdfSBbc3R5bGVzaGVldHNdXG4gICAqICAgIG5ldyBzdHlsZXNoZWV0cyB0byBiZSBwcm9jZXNzZWQuIFRoaXMgcGFyYW1ldGVyIHNob3VsZCBiZSBvbWl0dGVkXG4gICAqICAgIGZvciBmdWxsIHJlcHJvY2Vzc2luZy5cbiAgICogQHBhcmFtIHtNdXRhdGlvblJlY29yZFtdfSBbbXV0YXRpb25zXVxuICAgKiAgICBuZXcgRE9NIG11dGF0aW9ucyB0byBiZSBwcm9jZXNzZWQuIFRoaXMgcGFyYW1ldGVyIHNob3VsZCBiZSBvbWl0dGVkXG4gICAqICAgIGZvciBmdWxsIHJlcHJvY2Vzc2luZy5cbiAgICovXG4gIHF1ZXVlRmlsdGVyaW5nKHN0eWxlc2hlZXRzLCBtdXRhdGlvbnMpIHtcbiAgICB0aGlzLl9hcHBlbmRTY2hlZHVsZWRQcm9jZXNzaW5nKHN0eWxlc2hlZXRzLCBtdXRhdGlvbnMpO1xuICAgIHRoaXMuX3NjaGVkdWxlTmV4dEZpbHRlcmluZygpO1xuICB9XG5cbiAgX3JlZnJlc2hQYXR0ZXJuU3R5bGVzKHN0eWxlc2hlZXQpIHtcbiAgICBsZXQgYWxsQ3NzUnVsZXMgPSB0aGlzLl9yZWFkQ3NzUnVsZXModGhpcy5kb2N1bWVudC5zdHlsZVNoZWV0cyk7XG4gICAgZm9yIChsZXQgcGF0dGVybiBvZiB0aGlzLnBhdHRlcm5zKVxuICAgICAgcGF0dGVybi5zZXRTdHlsZXMoYWxsQ3NzUnVsZXMpO1xuICB9XG5cbiAgb25Mb2FkKGV2ZW50KSB7XG4gICAgbGV0IHN0eWxlc2hlZXQgPSBldmVudC50YXJnZXQuc2hlZXQ7XG4gICAgaWYgKHN0eWxlc2hlZXQpXG4gICAgICB0aGlzLnF1ZXVlRmlsdGVyaW5nKFtzdHlsZXNoZWV0XSk7XG4gIH1cblxuICBvYnNlcnZlKG11dGF0aW9ucykge1xuICAgIGlmICh0ZXN0SW5mbykge1xuICAgICAgLy8gSW4gdGVzdCBtb2RlLCBmaWx0ZXIgb3V0IGFueSBtdXRhdGlvbnMgbGlrZWx5IGRvbmUgYnkgdXNcbiAgICAgIC8vIChpLmUuIHN0eWxlPVwiZGlzcGxheTogbm9uZSAhaW1wb3J0YW50XCIpLiBUaGlzIG1ha2VzIGl0IGVhc2llciB0b1xuICAgICAgLy8gb2JzZXJ2ZSBob3cgdGhlIGNvZGUgcmVzcG9uZHMgdG8gRE9NIG11dGF0aW9ucy5cbiAgICAgIG11dGF0aW9ucyA9IG11dGF0aW9ucy5maWx0ZXIoXG4gICAgICAgICh7dHlwZSwgYXR0cmlidXRlTmFtZSwgdGFyZ2V0OiB7c3R5bGU6IG5ld1ZhbHVlfSwgb2xkVmFsdWV9KSA9PlxuICAgICAgICAgICEodHlwZSA9PSBcImF0dHJpYnV0ZXNcIiAmJiBhdHRyaWJ1dGVOYW1lID09IFwic3R5bGVcIiAmJlxuICAgICAgICAgICAgbmV3VmFsdWUuZGlzcGxheSA9PSBcIm5vbmVcIiAmJlxuICAgICAgICAgICAgdG9DU1NTdHlsZURlY2xhcmF0aW9uKG9sZFZhbHVlKS5kaXNwbGF5ICE9IFwibm9uZVwiKVxuICAgICAgKTtcblxuICAgICAgaWYgKG11dGF0aW9ucy5sZW5ndGggPT0gMClcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucXVldWVGaWx0ZXJpbmcobnVsbCwgbXV0YXRpb25zKTtcbiAgfVxuXG4gIGFwcGx5KHBhdHRlcm5zKSB7XG4gICAgdGhpcy5wYXR0ZXJucyA9IFtdO1xuICAgIGZvciAobGV0IHBhdHRlcm4gb2YgcGF0dGVybnMpIHtcbiAgICAgIGxldCBzZWxlY3RvcnMgPSB0aGlzLnBhcnNlU2VsZWN0b3IocGF0dGVybi5zZWxlY3Rvcik7XG4gICAgICBpZiAoc2VsZWN0b3JzICE9IG51bGwgJiYgc2VsZWN0b3JzLmxlbmd0aCA+IDApXG4gICAgICAgIHRoaXMucGF0dGVybnMucHVzaChuZXcgUGF0dGVybihzZWxlY3RvcnMsIHBhdHRlcm4udGV4dCkpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLnBhdHRlcm5zLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMucXVldWVGaWx0ZXJpbmcoKTtcblxuICAgICAgbGV0IGF0dHJpYnV0ZXMgPSBzaG91bGRPYnNlcnZlQXR0cmlidXRlcyh0aGlzLnBhdHRlcm5zKTtcbiAgICAgIHRoaXMub2JzZXJ2ZXIub2JzZXJ2ZShcbiAgICAgICAgdGhpcy5kb2N1bWVudCxcbiAgICAgICAge1xuICAgICAgICAgIGNoaWxkTGlzdDogdHJ1ZSxcbiAgICAgICAgICBhdHRyaWJ1dGVzLFxuICAgICAgICAgIGF0dHJpYnV0ZU9sZFZhbHVlOiBhdHRyaWJ1dGVzICYmICEhdGVzdEluZm8sXG4gICAgICAgICAgY2hhcmFjdGVyRGF0YTogc2hvdWxkT2JzZXJ2ZUNoYXJhY3RlckRhdGEodGhpcy5wYXR0ZXJucyksXG4gICAgICAgICAgc3VidHJlZTogdHJ1ZVxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgaWYgKHNob3VsZE9ic2VydmVTdHlsZXModGhpcy5wYXR0ZXJucykpIHtcbiAgICAgICAgbGV0IG9uTG9hZCA9IHRoaXMub25Mb2FkLmJpbmQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmRvY3VtZW50LnJlYWR5U3RhdGUgPT09IFwibG9hZGluZ1wiKVxuICAgICAgICAgIHRoaXMuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgb25Mb2FkLCB0cnVlKTtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBvbkxvYWQsIHRydWUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufTtcbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBBZGJsb2NrIFBsdXMgPGh0dHBzOi8vYWRibG9ja3BsdXMub3JnLz4sXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBBZGJsb2NrIFBsdXMgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEFkYmxvY2sgUGx1cyBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggQWRibG9jayBQbHVzLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbi8qKiBAbW9kdWxlICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFRoZSBtYXhpbXVtIG51bWJlciBvZiBwYXR0ZXJucyB0aGF0XG4gKiBge0BsaW5rIG1vZHVsZTpwYXR0ZXJucy5jb21waWxlUGF0dGVybnMgY29tcGlsZVBhdHRlcm5zKCl9YCB3aWxsIGNvbXBpbGVcbiAqIGludG8gcmVndWxhciBleHByZXNzaW9ucy5cbiAqIEB0eXBlIHtudW1iZXJ9XG4gKi9cbmNvbnN0IENPTVBJTEVfUEFUVEVSTlNfTUFYID0gMTAwO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiB1c2VkIHRvIG1hdGNoIHRoZSBgXmAgc3VmZml4IGluIGFuIG90aGVyd2lzZSBsaXRlcmFsXG4gKiBwYXR0ZXJuLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xubGV0IHNlcGFyYXRvclJlZ0V4cCA9IC9bXFx4MDAtXFx4MjRcXHgyNi1cXHgyQ1xceDJGXFx4M0EtXFx4NDBcXHg1Qi1cXHg1RVxceDYwXFx4N0ItXFx4N0ZdLztcblxubGV0IGZpbHRlclRvUmVnRXhwID1cbi8qKlxuICogQ29udmVydHMgZmlsdGVyIHRleHQgaW50byByZWd1bGFyIGV4cHJlc3Npb24gc3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dCBhcyBpbiBGaWx0ZXIoKVxuICogQHJldHVybiB7c3RyaW5nfSByZWd1bGFyIGV4cHJlc3Npb24gcmVwcmVzZW50YXRpb24gb2YgZmlsdGVyIHRleHRcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMuZmlsdGVyVG9SZWdFeHAgPSBmdW5jdGlvbiBmaWx0ZXJUb1JlZ0V4cCh0ZXh0KSB7XG4gIC8vIHJlbW92ZSBtdWx0aXBsZSB3aWxkY2FyZHNcbiAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwqKy9nLCBcIipcIik7XG5cbiAgLy8gcmVtb3ZlIGxlYWRpbmcgd2lsZGNhcmRcbiAgaWYgKHRleHRbMF0gPT0gXCIqXCIpXG4gICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEpO1xuXG4gIC8vIHJlbW92ZSB0cmFpbGluZyB3aWxkY2FyZFxuICBpZiAodGV4dFt0ZXh0Lmxlbmd0aCAtIDFdID09IFwiKlwiKVxuICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuXG4gIHJldHVybiB0ZXh0XG4gICAgLy8gcmVtb3ZlIGFuY2hvcnMgZm9sbG93aW5nIHNlcGFyYXRvciBwbGFjZWhvbGRlclxuICAgIC5yZXBsYWNlKC9cXF5cXHwkLywgXCJeXCIpXG4gICAgLy8gZXNjYXBlIHNwZWNpYWwgc3ltYm9sc1xuICAgIC5yZXBsYWNlKC9cXFcvZywgXCJcXFxcJCZcIilcbiAgICAvLyByZXBsYWNlIHdpbGRjYXJkcyBieSAuKlxuICAgIC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIilcbiAgICAvLyBwcm9jZXNzIHNlcGFyYXRvciBwbGFjZWhvbGRlcnMgKGFsbCBBTlNJIGNoYXJhY3RlcnMgYnV0IGFscGhhbnVtZXJpY1xuICAgIC8vIGNoYXJhY3RlcnMgYW5kIF8lLi0pXG4gICAgLnJlcGxhY2UoL1xcXFxcXF4vZywgYCg/OiR7c2VwYXJhdG9yUmVnRXhwLnNvdXJjZX18JClgKVxuICAgIC8vIHByb2Nlc3MgZXh0ZW5kZWQgYW5jaG9yIGF0IGV4cHJlc3Npb24gc3RhcnRcbiAgICAucmVwbGFjZSgvXlxcXFxcXHxcXFxcXFx8LywgXCJeW1xcXFx3XFxcXC1dKzpcXFxcLysoPzpbXlxcXFwvXStcXFxcLik/XCIpXG4gICAgLy8gcHJvY2VzcyBhbmNob3IgYXQgZXhwcmVzc2lvbiBzdGFydFxuICAgIC5yZXBsYWNlKC9eXFxcXFxcfC8sIFwiXlwiKVxuICAgIC8vIHByb2Nlc3MgYW5jaG9yIGF0IGV4cHJlc3Npb24gZW5kXG4gICAgLnJlcGxhY2UoL1xcXFxcXHwkLywgXCIkXCIpO1xufTtcblxuLyoqXG4gKiBSZWd1bGFyIGV4cHJlc3Npb24gdXNlZCB0byBtYXRjaCB0aGUgYHx8YCBwcmVmaXggaW4gYW4gb3RoZXJ3aXNlIGxpdGVyYWxcbiAqIHBhdHRlcm4uXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQgZXh0ZW5kZWRBbmNob3JSZWdFeHAgPSBuZXcgUmVnRXhwKGZpbHRlclRvUmVnRXhwKFwifHxcIikgKyBcIiRcIik7XG5cbi8qKlxuICogUmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBhIGtleXdvcmQgaW4gYSBmaWx0ZXIuXG4gKiBAdHlwZSB7UmVnRXhwfVxuICovXG5sZXQga2V5d29yZFJlZ0V4cCA9IC9bXmEtejAtOSUqXVthLXowLTklXXsyLH0oPz1bXmEtejAtOSUqXSkvO1xuXG4vKipcbiAqIFJlZ3VsYXIgZXhwcmVzc2lvbiBmb3IgbWF0Y2hpbmcgYWxsIGtleXdvcmRzIGluIGEgZmlsdGVyLlxuICogQHR5cGUge1JlZ0V4cH1cbiAqL1xubGV0IGFsbEtleXdvcmRzUmVnRXhwID0gbmV3IFJlZ0V4cChrZXl3b3JkUmVnRXhwLCBcImdcIik7XG5cbi8qKlxuICogQSBgQ29tcGlsZWRQYXR0ZXJuc2Agb2JqZWN0IHJlcHJlc2VudHMgdGhlIGNvbXBpbGVkIHZlcnNpb24gb2YgbXVsdGlwbGUgVVJMXG4gKiByZXF1ZXN0IHBhdHRlcm5zLiBJdCBpcyByZXR1cm5lZCBieVxuICogYHtAbGluayBtb2R1bGU6cGF0dGVybnMuY29tcGlsZVBhdHRlcm5zIGNvbXBpbGVQYXR0ZXJucygpfWAuXG4gKi9cbmNsYXNzIENvbXBpbGVkUGF0dGVybnMge1xuICAvKipcbiAgICogQ3JlYXRlcyBhbiBvYmplY3Qgd2l0aCB0aGUgZ2l2ZW4gcmVndWxhciBleHByZXNzaW9ucyBmb3IgY2FzZS1zZW5zaXRpdmVcbiAgICogYW5kIGNhc2UtaW5zZW5zaXRpdmUgbWF0Y2hpbmcgcmVzcGVjdGl2ZWx5LlxuICAgKiBAcGFyYW0gez9SZWdFeHB9IFtjYXNlU2Vuc2l0aXZlXVxuICAgKiBAcGFyYW0gez9SZWdFeHB9IFtjYXNlSW5zZW5zaXRpdmVdXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBjb25zdHJ1Y3RvcihjYXNlU2Vuc2l0aXZlLCBjYXNlSW5zZW5zaXRpdmUpIHtcbiAgICB0aGlzLl9jYXNlU2Vuc2l0aXZlID0gY2FzZVNlbnNpdGl2ZTtcbiAgICB0aGlzLl9jYXNlSW5zZW5zaXRpdmUgPSBjYXNlSW5zZW5zaXRpdmU7XG4gIH1cblxuICAvKipcbiAgICogVGVzdHMgd2hldGhlciB0aGUgZ2l2ZW4gVVJMIHJlcXVlc3QgbWF0Y2hlcyB0aGUgcGF0dGVybnMgdXNlZCB0byBjcmVhdGVcbiAgICogdGhpcyBvYmplY3QuXG4gICAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkxSZXF1ZXN0fSByZXF1ZXN0XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgdGVzdChyZXF1ZXN0KSB7XG4gICAgcmV0dXJuICgodGhpcy5fY2FzZVNlbnNpdGl2ZSAmJlxuICAgICAgICAgICAgIHRoaXMuX2Nhc2VTZW5zaXRpdmUudGVzdChyZXF1ZXN0LmhyZWYpKSB8fFxuICAgICAgICAgICAgKHRoaXMuX2Nhc2VJbnNlbnNpdGl2ZSAmJlxuICAgICAgICAgICAgIHRoaXMuX2Nhc2VJbnNlbnNpdGl2ZS50ZXN0KHJlcXVlc3QubG93ZXJDYXNlSHJlZikpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGVzIHBhdHRlcm5zIGZyb20gdGhlIGdpdmVuIGZpbHRlcnMgaW50byBhIHNpbmdsZVxuICogYHtAbGluayBtb2R1bGU6cGF0dGVybnN+Q29tcGlsZWRQYXR0ZXJucyBDb21waWxlZFBhdHRlcm5zfWAgb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7bW9kdWxlOmZpbHRlckNsYXNzZXMuVVJMRmlsdGVyfFxuICogICAgICAgICBTZXQuPG1vZHVsZTpmaWx0ZXJDbGFzc2VzLlVSTEZpbHRlcj59IGZpbHRlcnNcbiAqICAgVGhlIGZpbHRlcnMuIElmIHRoZSBudW1iZXIgb2YgZmlsdGVycyBleGNlZWRzXG4gKiAgIGB7QGxpbmsgbW9kdWxlOnBhdHRlcm5zfkNPTVBJTEVfUEFUVEVSTlNfTUFYIENPTVBJTEVfUEFUVEVSTlNfTUFYfWAsIHRoZVxuICogICBmdW5jdGlvbiByZXR1cm5zIGBudWxsYC5cbiAqXG4gKiBAcmV0dXJucyB7P21vZHVsZTpwYXR0ZXJuc35Db21waWxlZFBhdHRlcm5zfVxuICpcbiAqIEBwYWNrYWdlXG4gKi9cbmV4cG9ydHMuY29tcGlsZVBhdHRlcm5zID0gZnVuY3Rpb24gY29tcGlsZVBhdHRlcm5zKGZpbHRlcnMpIHtcbiAgbGV0IGxpc3QgPSBBcnJheS5pc0FycmF5KGZpbHRlcnMpID8gZmlsdGVycyA6IFtmaWx0ZXJzXTtcblxuICAvLyBJZiB0aGUgbnVtYmVyIG9mIGZpbHRlcnMgaXMgdG9vIGxhcmdlLCBpdCBtYXkgY2hva2UgZXNwZWNpYWxseSBvbiBsb3ctZW5kXG4gIC8vIHBsYXRmb3Jtcy4gQXMgYSBwcmVjYXV0aW9uLCB3ZSByZWZ1c2UgdG8gY29tcGlsZS4gSWRlYWxseSB3ZSB3b3VsZCBjaGVja1xuICAvLyB0aGUgbGVuZ3RoIG9mIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gc291cmNlIHJhdGhlciB0aGFuIHRoZSBudW1iZXIgb2ZcbiAgLy8gZmlsdGVycywgYnV0IHRoaXMgaXMgZmFyIG1vcmUgc3RyYWlnaHRmb3J3YXJkIGFuZCBwcmFjdGljYWwuXG4gIGlmIChsaXN0Lmxlbmd0aCA+IENPTVBJTEVfUEFUVEVSTlNfTUFYKVxuICAgIHJldHVybiBudWxsO1xuXG4gIGxldCBjYXNlU2Vuc2l0aXZlID0gXCJcIjtcbiAgbGV0IGNhc2VJbnNlbnNpdGl2ZSA9IFwiXCI7XG5cbiAgZm9yIChsZXQgZmlsdGVyIG9mIGZpbHRlcnMpIHtcbiAgICBsZXQgc291cmNlID0gZmlsdGVyLnVybFBhdHRlcm4ucmVnZXhwU291cmNlO1xuXG4gICAgaWYgKGZpbHRlci5tYXRjaENhc2UpXG4gICAgICBjYXNlU2Vuc2l0aXZlICs9IHNvdXJjZSArIFwifFwiO1xuICAgIGVsc2VcbiAgICAgIGNhc2VJbnNlbnNpdGl2ZSArPSBzb3VyY2UgKyBcInxcIjtcbiAgfVxuXG4gIGxldCBjYXNlU2Vuc2l0aXZlUmVnRXhwID0gbnVsbDtcbiAgbGV0IGNhc2VJbnNlbnNpdGl2ZVJlZ0V4cCA9IG51bGw7XG5cbiAgdHJ5IHtcbiAgICBpZiAoY2FzZVNlbnNpdGl2ZSlcbiAgICAgIGNhc2VTZW5zaXRpdmVSZWdFeHAgPSBuZXcgUmVnRXhwKGNhc2VTZW5zaXRpdmUuc2xpY2UoMCwgLTEpKTtcblxuICAgIGlmIChjYXNlSW5zZW5zaXRpdmUpXG4gICAgICBjYXNlSW5zZW5zaXRpdmVSZWdFeHAgPSBuZXcgUmVnRXhwKGNhc2VJbnNlbnNpdGl2ZS5zbGljZSgwLCAtMSkpO1xuICB9XG4gIGNhdGNoIChlcnJvcikge1xuICAgIC8vIEl0IGlzIHBvc3NpYmxlIGluIHRoZW9yeSBmb3IgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbiB0byBiZSB0b28gbGFyZ2VcbiAgICAvLyBkZXNwaXRlIENPTVBJTEVfUEFUVEVSTlNfTUFYXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gbmV3IENvbXBpbGVkUGF0dGVybnMoY2FzZVNlbnNpdGl2ZVJlZ0V4cCwgY2FzZUluc2Vuc2l0aXZlUmVnRXhwKTtcbn07XG5cbi8qKlxuICogUGF0dGVybnMgZm9yIG1hdGNoaW5nIGFnYWluc3QgVVJMcy5cbiAqXG4gKiBJbnRlcm5hbGx5LCB0aGlzIG1heSBiZSBhIFJlZ0V4cCBvciBtYXRjaCBkaXJlY3RseSBhZ2FpbnN0IHRoZVxuICogcGF0dGVybiBmb3Igc2ltcGxlIGxpdGVyYWwgcGF0dGVybnMuXG4gKi9cbmV4cG9ydHMuUGF0dGVybiA9IGNsYXNzIFBhdHRlcm4ge1xuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gcGF0dGVybiB0aGF0IHJlcXVlc3RzIFVSTHMgc2hvdWxkIGJlXG4gICAqIG1hdGNoZWQgYWdhaW5zdCBpbiBmaWx0ZXIgdGV4dCBub3RhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2x9IG1hdGNoQ2FzZSBgdHJ1ZWAgaWYgY29tcGFyaXNvbnMgbXVzdCBiZSBjYXNlXG4gICAqIHNlbnNpdGl2ZVxuICAgKi9cbiAgY29uc3RydWN0b3IocGF0dGVybiwgbWF0Y2hDYXNlKSB7XG4gICAgdGhpcy5tYXRjaENhc2UgPSBtYXRjaENhc2UgfHwgZmFsc2U7XG5cbiAgICBpZiAoIXRoaXMubWF0Y2hDYXNlKVxuICAgICAgcGF0dGVybiA9IHBhdHRlcm4udG9Mb3dlckNhc2UoKTtcblxuICAgIGlmIChwYXR0ZXJuLmxlbmd0aCA+PSAyICYmXG4gICAgICAgIHBhdHRlcm5bMF0gPT0gXCIvXCIgJiZcbiAgICAgICAgcGF0dGVybltwYXR0ZXJuLmxlbmd0aCAtIDFdID09IFwiL1wiKSB7XG4gICAgICAvLyBUaGUgZmlsdGVyIGlzIGEgcmVndWxhciBleHByZXNzaW9uIC0gY29udmVydCBpdCBpbW1lZGlhdGVseSB0b1xuICAgICAgLy8gY2F0Y2ggc3ludGF4IGVycm9yc1xuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyaW5nKDEsIHBhdHRlcm4ubGVuZ3RoIC0gMSk7XG4gICAgICB0aGlzLl9yZWdleHAgPSBuZXcgUmVnRXhwKHBhdHRlcm4pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIFBhdHRlcm5zIGxpa2UgL2Zvby9iYXIvKiBleGlzdCBzbyB0aGF0IHRoZXkgYXJlIG5vdCB0cmVhdGVkIGFzIHJlZ3VsYXJcbiAgICAgIC8vIGV4cHJlc3Npb25zLiBXZSBkcm9wIGFueSBzdXBlcmZsdW91cyB3aWxkY2FyZHMgaGVyZSBzbyBvdXJcbiAgICAgIC8vIG9wdGltaXphdGlvbnMgY2FuIGtpY2sgaW4uXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC9eXFwqKy8sIFwiXCIpLnJlcGxhY2UoL1xcKiskLywgXCJcIik7XG5cbiAgICAgIC8vIE5vIG5lZWQgdG8gY29udmVydCB0aGlzIGZpbHRlciB0byByZWd1bGFyIGV4cHJlc3Npb24geWV0LCBkbyBpdCBvblxuICAgICAgLy8gZGVtYW5kXG4gICAgICB0aGlzLnBhdHRlcm4gPSBwYXR0ZXJuO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgcGF0dGVybiBpcyBhIHN0cmluZyBvZiBsaXRlcmFsIGNoYXJhY3RlcnMgd2l0aFxuICAgKiBubyB3aWxkY2FyZHMgb3IgYW55IG90aGVyIHNwZWNpYWwgY2hhcmFjdGVycy5cbiAgICpcbiAgICogSWYgdGhlIHBhdHRlcm4gaXMgcHJlZml4ZWQgd2l0aCBhIGB8fGAgb3Igc3VmZml4ZWQgd2l0aCBhIGBeYCBidXQgb3RoZXJ3aXNlXG4gICAqIGNvbnRhaW5zIG5vIHNwZWNpYWwgY2hhcmFjdGVycywgaXQgaXMgc3RpbGwgY29uc2lkZXJlZCB0byBiZSBhIGxpdGVyYWxcbiAgICogcGF0dGVybi5cbiAgICpcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBpc0xpdGVyYWxQYXR0ZXJuKCkge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5wYXR0ZXJuICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAhL1sqXnxdLy50ZXN0KHRoaXMucGF0dGVybi5yZXBsYWNlKC9eXFx8ezEsMn0vLCBcIlwiKS5yZXBsYWNlKC9bfF5dJC8sIFwiXCIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWd1bGFyIGV4cHJlc3Npb24gdG8gYmUgdXNlZCB3aGVuIHRlc3RpbmcgYWdhaW5zdCB0aGlzIHBhdHRlcm4uXG4gICAqXG4gICAqIG51bGwgaWYgdGhlIHBhdHRlcm4gaXMgbWF0Y2hlZCB3aXRob3V0IHVzaW5nIHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAqIEB0eXBlIHtSZWdFeHB9XG4gICAqL1xuICBnZXQgcmVnZXhwKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fcmVnZXhwID09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHRoaXMuX3JlZ2V4cCA9IHRoaXMuaXNMaXRlcmFsUGF0dGVybigpID9cbiAgICAgICAgbnVsbCA6IG5ldyBSZWdFeHAoZmlsdGVyVG9SZWdFeHAodGhpcy5wYXR0ZXJuKSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZWdleHA7XG4gIH1cblxuICAvKipcbiAgICogUGF0dGVybiBpbiByZWd1bGFyIGV4cHJlc3Npb24gbm90YXRpb24uIFRoaXMgd2lsbCBoYXZlIGEgdmFsdWVcbiAgICogZXZlbiBpZiBgcmVnZXhwYCByZXR1cm5zIG51bGwuXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqL1xuICBnZXQgcmVnZXhwU291cmNlKCkge1xuICAgIHJldHVybiB0aGlzLl9yZWdleHAgPyB0aGlzLl9yZWdleHAuc291cmNlIDogZmlsdGVyVG9SZWdFeHAodGhpcy5wYXR0ZXJuKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgZ2l2ZW4gVVJMIHJlcXVlc3QgbWF0Y2hlcyB0aGlzIGZpbHRlcidzIHBhdHRlcm4uXG4gICAqIEBwYXJhbSB7bW9kdWxlOnVybC5VUkxSZXF1ZXN0fSByZXF1ZXN0IFRoZSBVUkwgcmVxdWVzdCB0byBjaGVjay5cbiAgICogQHJldHVybnMge2Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgVVJMIHJlcXVlc3QgbWF0Y2hlcy5cbiAgICovXG4gIG1hdGNoZXNMb2NhdGlvbihyZXF1ZXN0KSB7XG4gICAgbGV0IGxvY2F0aW9uID0gdGhpcy5tYXRjaENhc2UgPyByZXF1ZXN0LmhyZWYgOiByZXF1ZXN0Lmxvd2VyQ2FzZUhyZWY7XG4gICAgbGV0IHJlZ2V4cCA9IHRoaXMucmVnZXhwO1xuICAgIGlmIChyZWdleHApXG4gICAgICByZXR1cm4gcmVnZXhwLnRlc3QobG9jYXRpb24pO1xuXG4gICAgbGV0IHBhdHRlcm4gPSB0aGlzLnBhdHRlcm47XG4gICAgbGV0IHN0YXJ0c1dpdGhBbmNob3IgPSBwYXR0ZXJuWzBdID09IFwifFwiO1xuICAgIGxldCBzdGFydHNXaXRoRXh0ZW5kZWRBbmNob3IgPSBzdGFydHNXaXRoQW5jaG9yICYmIHBhdHRlcm5bMV0gPT0gXCJ8XCI7XG4gICAgbGV0IGVuZHNXaXRoU2VwYXJhdG9yID0gcGF0dGVybltwYXR0ZXJuLmxlbmd0aCAtIDFdID09IFwiXlwiO1xuICAgIGxldCBlbmRzV2l0aEFuY2hvciA9ICFlbmRzV2l0aFNlcGFyYXRvciAmJlxuICAgICAgICBwYXR0ZXJuW3BhdHRlcm4ubGVuZ3RoIC0gMV0gPT0gXCJ8XCI7XG5cbiAgICBpZiAoc3RhcnRzV2l0aEV4dGVuZGVkQW5jaG9yKVxuICAgICAgcGF0dGVybiA9IHBhdHRlcm4uc3Vic3RyKDIpO1xuICAgIGVsc2UgaWYgKHN0YXJ0c1dpdGhBbmNob3IpXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zdWJzdHIoMSk7XG5cbiAgICBpZiAoZW5kc1dpdGhTZXBhcmF0b3IgfHwgZW5kc1dpdGhBbmNob3IpXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5zbGljZSgwLCAtMSk7XG5cbiAgICBsZXQgaW5kZXggPSBsb2NhdGlvbi5pbmRleE9mKHBhdHRlcm4pO1xuXG4gICAgd2hpbGUgKGluZGV4ICE9IC0xKSB7XG4gICAgICAvLyBUaGUgXCJ8fFwiIHByZWZpeCByZXF1aXJlcyB0aGF0IHRoZSB0ZXh0IHRoYXQgZm9sbG93cyBkb2VzIG5vdCBzdGFydFxuICAgICAgLy8gd2l0aCBhIGZvcndhcmQgc2xhc2guXG4gICAgICBpZiAoKHN0YXJ0c1dpdGhFeHRlbmRlZEFuY2hvciA/XG4gICAgICAgICAgIGxvY2F0aW9uW2luZGV4XSAhPSBcIi9cIiAmJlxuICAgICAgICAgICBleHRlbmRlZEFuY2hvclJlZ0V4cC50ZXN0KGxvY2F0aW9uLnN1YnN0cmluZygwLCBpbmRleCkpIDpcbiAgICAgICAgICAgc3RhcnRzV2l0aEFuY2hvciA/XG4gICAgICAgICAgIGluZGV4ID09IDAgOlxuICAgICAgICAgICB0cnVlKSAmJlxuICAgICAgICAgIChlbmRzV2l0aFNlcGFyYXRvciA/XG4gICAgICAgICAgICFsb2NhdGlvbltpbmRleCArIHBhdHRlcm4ubGVuZ3RoXSB8fFxuICAgICAgICAgICBzZXBhcmF0b3JSZWdFeHAudGVzdChsb2NhdGlvbltpbmRleCArIHBhdHRlcm4ubGVuZ3RoXSkgOlxuICAgICAgICAgICBlbmRzV2l0aEFuY2hvciA/XG4gICAgICAgICAgIGluZGV4ID09IGxvY2F0aW9uLmxlbmd0aCAtIHBhdHRlcm4ubGVuZ3RoIDpcbiAgICAgICAgICAgdHJ1ZSkpXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICBpZiAocGF0dGVybiA9PSBcIlwiKVxuICAgICAgICByZXR1cm4gdHJ1ZTtcblxuICAgICAgaW5kZXggPSBsb2NhdGlvbi5pbmRleE9mKHBhdHRlcm4sIGluZGV4ICsgMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB3aGV0aGVyIHRoZSBwYXR0ZXJuIGhhcyBrZXl3b3Jkc1xuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIGhhc0tleXdvcmRzKCkge1xuICAgIHJldHVybiB0aGlzLnBhdHRlcm4gJiYga2V5d29yZFJlZ0V4cC50ZXN0KHRoaXMucGF0dGVybik7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgYWxsIGtleXdvcmRzIHRoYXQgY291bGQgYmUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgcGF0dGVyblxuICAgKiBAcmV0dXJucyB7c3RyaW5nW119XG4gICAqL1xuICBrZXl3b3JkQ2FuZGlkYXRlcygpIHtcbiAgICBpZiAoIXRoaXMucGF0dGVybilcbiAgICAgIHJldHVybiBudWxsO1xuICAgIHJldHVybiB0aGlzLnBhdHRlcm4udG9Mb3dlckNhc2UoKS5tYXRjaChhbGxLZXl3b3Jkc1JlZ0V4cCk7XG4gIH1cbn07XG4iLCIvKiB3ZWJleHRlbnNpb24tcG9seWZpbGwgLSB2MC44LjAgLSBUdWUgQXByIDIwIDIwMjEgMTE6Mjc6MzggKi9cbi8qIC0qLSBNb2RlOiBpbmRlbnQtdGFicy1tb2RlOiBuaWw7IGpzLWluZGVudC1sZXZlbDogMiAtKi0gKi9cbi8qIHZpbTogc2V0IHN0cz0yIHN3PTIgZXQgdHc9ODA6ICovXG4vKiBUaGlzIFNvdXJjZSBDb2RlIEZvcm0gaXMgc3ViamVjdCB0byB0aGUgdGVybXMgb2YgdGhlIE1vemlsbGEgUHVibGljXG4gKiBMaWNlbnNlLCB2LiAyLjAuIElmIGEgY29weSBvZiB0aGUgTVBMIHdhcyBub3QgZGlzdHJpYnV0ZWQgd2l0aCB0aGlzXG4gKiBmaWxlLCBZb3UgY2FuIG9idGFpbiBvbmUgYXQgaHR0cDovL21vemlsbGEub3JnL01QTC8yLjAvLiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmlmICh0eXBlb2YgYnJvd3NlciA9PT0gXCJ1bmRlZmluZWRcIiB8fCBPYmplY3QuZ2V0UHJvdG90eXBlT2YoYnJvd3NlcikgIT09IE9iamVjdC5wcm90b3R5cGUpIHtcbiAgY29uc3QgQ0hST01FX1NFTkRfTUVTU0FHRV9DQUxMQkFDS19OT19SRVNQT05TRV9NRVNTQUdFID0gXCJUaGUgbWVzc2FnZSBwb3J0IGNsb3NlZCBiZWZvcmUgYSByZXNwb25zZSB3YXMgcmVjZWl2ZWQuXCI7XG4gIGNvbnN0IFNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORyA9IFwiUmV0dXJuaW5nIGEgUHJvbWlzZSBpcyB0aGUgcHJlZmVycmVkIHdheSB0byBzZW5kIGEgcmVwbHkgZnJvbSBhbiBvbk1lc3NhZ2Uvb25NZXNzYWdlRXh0ZXJuYWwgbGlzdGVuZXIsIGFzIHRoZSBzZW5kUmVzcG9uc2Ugd2lsbCBiZSByZW1vdmVkIGZyb20gdGhlIHNwZWNzIChTZWUgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9Nb3ppbGxhL0FkZC1vbnMvV2ViRXh0ZW5zaW9ucy9BUEkvcnVudGltZS9vbk1lc3NhZ2UpXCI7XG5cbiAgLy8gV3JhcHBpbmcgdGhlIGJ1bGsgb2YgdGhpcyBwb2x5ZmlsbCBpbiBhIG9uZS10aW1lLXVzZSBmdW5jdGlvbiBpcyBhIG1pbm9yXG4gIC8vIG9wdGltaXphdGlvbiBmb3IgRmlyZWZveC4gU2luY2UgU3BpZGVybW9ua2V5IGRvZXMgbm90IGZ1bGx5IHBhcnNlIHRoZVxuICAvLyBjb250ZW50cyBvZiBhIGZ1bmN0aW9uIHVudGlsIHRoZSBmaXJzdCB0aW1lIGl0J3MgY2FsbGVkLCBhbmQgc2luY2UgaXQgd2lsbFxuICAvLyBuZXZlciBhY3R1YWxseSBuZWVkIHRvIGJlIGNhbGxlZCwgdGhpcyBhbGxvd3MgdGhlIHBvbHlmaWxsIHRvIGJlIGluY2x1ZGVkXG4gIC8vIGluIEZpcmVmb3ggbmVhcmx5IGZvciBmcmVlLlxuICBjb25zdCB3cmFwQVBJcyA9IGV4dGVuc2lvbkFQSXMgPT4ge1xuICAgIC8vIE5PVEU6IGFwaU1ldGFkYXRhIGlzIGFzc29jaWF0ZWQgdG8gdGhlIGNvbnRlbnQgb2YgdGhlIGFwaS1tZXRhZGF0YS5qc29uIGZpbGVcbiAgICAvLyBhdCBidWlsZCB0aW1lIGJ5IHJlcGxhY2luZyB0aGUgZm9sbG93aW5nIFwiaW5jbHVkZVwiIHdpdGggdGhlIGNvbnRlbnQgb2YgdGhlXG4gICAgLy8gSlNPTiBmaWxlLlxuICAgIGNvbnN0IGFwaU1ldGFkYXRhID0ge1xuICAgICAgXCJhbGFybXNcIjoge1xuICAgICAgICBcImNsZWFyXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImNsZWFyQWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImJvb2ttYXJrc1wiOiB7XG4gICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRDaGlsZHJlblwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRSZWNlbnRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0U3ViVHJlZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRUcmVlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcIm1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVRyZWVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiYnJvd3NlckFjdGlvblwiOiB7XG4gICAgICAgIFwiZGlzYWJsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwiZW5hYmxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRCYWRnZUJhY2tncm91bmRDb2xvclwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRCYWRnZVRleHRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UG9wdXBcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0VGl0bGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwib3BlblBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInNldEJhZGdlQmFja2dyb3VuZENvbG9yXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRCYWRnZVRleHRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNldEljb25cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0UG9wdXBcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBcInNldFRpdGxlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiYnJvd3NpbmdEYXRhXCI6IHtcbiAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlQ2FjaGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlQ29va2llc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVEb3dubG9hZHNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlRm9ybURhdGFcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlSGlzdG9yeVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVMb2NhbFN0b3JhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlUGFzc3dvcmRzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVBsdWdpbkRhdGFcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0dGluZ3NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImNvbW1hbmRzXCI6IHtcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImNvbnRleHRNZW51c1wiOiB7XG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZUFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJ1cGRhdGVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImNvb2tpZXNcIjoge1xuICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsQ29va2llU3RvcmVzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImRldnRvb2xzXCI6IHtcbiAgICAgICAgXCJpbnNwZWN0ZWRXaW5kb3dcIjoge1xuICAgICAgICAgIFwiZXZhbFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAyLFxuICAgICAgICAgICAgXCJzaW5nbGVDYWxsYmFja0FyZ1wiOiBmYWxzZVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJwYW5lbHNcIjoge1xuICAgICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAzLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDMsXG4gICAgICAgICAgICBcInNpbmdsZUNhbGxiYWNrQXJnXCI6IHRydWVcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwiZWxlbWVudHNcIjoge1xuICAgICAgICAgICAgXCJjcmVhdGVTaWRlYmFyUGFuZVwiOiB7XG4gICAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiZG93bmxvYWRzXCI6IHtcbiAgICAgICAgXCJjYW5jZWxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZG93bmxvYWRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZXJhc2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0RmlsZUljb25cIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwib3BlblwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwicGF1c2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlRmlsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZXN1bWVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNob3dcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxLFxuICAgICAgICAgIFwiZmFsbGJhY2tUb05vQ2FsbGJhY2tcIjogdHJ1ZVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJleHRlbnNpb25cIjoge1xuICAgICAgICBcImlzQWxsb3dlZEZpbGVTY2hlbWVBY2Nlc3NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiaXNBbGxvd2VkSW5jb2duaXRvQWNjZXNzXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJoaXN0b3J5XCI6IHtcbiAgICAgICAgXCJhZGRVcmxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZGVsZXRlQWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVJhbmdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRlbGV0ZVVybFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRWaXNpdHNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwic2VhcmNoXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJpMThuXCI6IHtcbiAgICAgICAgXCJkZXRlY3RMYW5ndWFnZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBY2NlcHRMYW5ndWFnZXNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcImlkZW50aXR5XCI6IHtcbiAgICAgICAgXCJsYXVuY2hXZWJBdXRoRmxvd1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwiaWRsZVwiOiB7XG4gICAgICAgIFwicXVlcnlTdGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwibWFuYWdlbWVudFwiOiB7XG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRTZWxmXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInNldEVuYWJsZWRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwidW5pbnN0YWxsU2VsZlwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwibm90aWZpY2F0aW9uc1wiOiB7XG4gICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcImdldEFsbFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRQZXJtaXNzaW9uTGV2ZWxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJwYWdlQWN0aW9uXCI6IHtcbiAgICAgICAgXCJnZXRQb3B1cFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRUaXRsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJoaWRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRJY29uXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInNldFBvcHVwXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMSxcbiAgICAgICAgICBcImZhbGxiYWNrVG9Ob0NhbGxiYWNrXCI6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRUaXRsZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIFwic2hvd1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDEsXG4gICAgICAgICAgXCJmYWxsYmFja1RvTm9DYWxsYmFja1wiOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInBlcm1pc3Npb25zXCI6IHtcbiAgICAgICAgXCJjb250YWluc1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRBbGxcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInJlcXVlc3RcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcInJ1bnRpbWVcIjoge1xuICAgICAgICBcImdldEJhY2tncm91bmRQYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcImdldFBsYXRmb3JtSW5mb1wiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDBcbiAgICAgICAgfSxcbiAgICAgICAgXCJvcGVuT3B0aW9uc1BhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVxdWVzdFVwZGF0ZUNoZWNrXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9LFxuICAgICAgICBcInNlbmRNZXNzYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogM1xuICAgICAgICB9LFxuICAgICAgICBcInNlbmROYXRpdmVNZXNzYWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMixcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInNldFVuaW5zdGFsbFVSTFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwic2Vzc2lvbnNcIjoge1xuICAgICAgICBcImdldERldmljZXNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0UmVjZW50bHlDbG9zZWRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVzdG9yZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwic3RvcmFnZVwiOiB7XG4gICAgICAgIFwibG9jYWxcIjoge1xuICAgICAgICAgIFwiY2xlYXJcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9LFxuICAgICAgICAgIFwic2V0XCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwibWFuYWdlZFwiOiB7XG4gICAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJnZXRCeXRlc0luVXNlXCI6IHtcbiAgICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwic3luY1wiOiB7XG4gICAgICAgICAgXCJjbGVhclwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldFwiOiB7XG4gICAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgICAgfSxcbiAgICAgICAgICBcImdldEJ5dGVzSW5Vc2VcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJyZW1vdmVcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH0sXG4gICAgICAgICAgXCJzZXRcIjoge1xuICAgICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIFwidGFic1wiOiB7XG4gICAgICAgIFwiY2FwdHVyZVZpc2libGVUYWJcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwiY3JlYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRldGVjdExhbmd1YWdlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImRpc2NhcmRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZHVwbGljYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImV4ZWN1dGVTY3JpcHRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEN1cnJlbnRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0Wm9vbVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRab29tU2V0dGluZ3NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ29CYWNrXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdvRm9yd2FyZFwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJoaWdobGlnaHRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiaW5zZXJ0Q1NTXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcIm1vdmVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwicXVlcnlcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVsb2FkXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9LFxuICAgICAgICBcInJlbW92ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJyZW1vdmVDU1NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwic2VuZE1lc3NhZ2VcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAyLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAzXG4gICAgICAgIH0sXG4gICAgICAgIFwic2V0Wm9vbVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDEsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfSxcbiAgICAgICAgXCJzZXRab29tU2V0dGluZ3NcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwidXBkYXRlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMlxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ0b3BTaXRlc1wiOiB7XG4gICAgICAgIFwiZ2V0XCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMFxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgXCJ3ZWJOYXZpZ2F0aW9uXCI6IHtcbiAgICAgICAgXCJnZXRBbGxGcmFtZXNcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0RnJhbWVcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIndlYlJlcXVlc3RcIjoge1xuICAgICAgICBcImhhbmRsZXJCZWhhdmlvckNoYW5nZWRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAwXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBcIndpbmRvd3NcIjoge1xuICAgICAgICBcImNyZWF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDAsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDFcbiAgICAgICAgfSxcbiAgICAgICAgXCJnZXRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAxLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAyXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0QWxsXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMCxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcImdldEN1cnJlbnRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwiZ2V0TGFzdEZvY3VzZWRcIjoge1xuICAgICAgICAgIFwibWluQXJnc1wiOiAwLFxuICAgICAgICAgIFwibWF4QXJnc1wiOiAxXG4gICAgICAgIH0sXG4gICAgICAgIFwicmVtb3ZlXCI6IHtcbiAgICAgICAgICBcIm1pbkFyZ3NcIjogMSxcbiAgICAgICAgICBcIm1heEFyZ3NcIjogMVxuICAgICAgICB9LFxuICAgICAgICBcInVwZGF0ZVwiOiB7XG4gICAgICAgICAgXCJtaW5BcmdzXCI6IDIsXG4gICAgICAgICAgXCJtYXhBcmdzXCI6IDJcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoT2JqZWN0LmtleXMoYXBpTWV0YWRhdGEpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiYXBpLW1ldGFkYXRhLmpzb24gaGFzIG5vdCBiZWVuIGluY2x1ZGVkIGluIGJyb3dzZXItcG9seWZpbGxcIik7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQSBXZWFrTWFwIHN1YmNsYXNzIHdoaWNoIGNyZWF0ZXMgYW5kIHN0b3JlcyBhIHZhbHVlIGZvciBhbnkga2V5IHdoaWNoIGRvZXNcbiAgICAgKiBub3QgZXhpc3Qgd2hlbiBhY2Nlc3NlZCwgYnV0IGJlaGF2ZXMgZXhhY3RseSBhcyBhbiBvcmRpbmFyeSBXZWFrTWFwXG4gICAgICogb3RoZXJ3aXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gY3JlYXRlSXRlbVxuICAgICAqICAgICAgICBBIGZ1bmN0aW9uIHdoaWNoIHdpbGwgYmUgY2FsbGVkIGluIG9yZGVyIHRvIGNyZWF0ZSB0aGUgdmFsdWUgZm9yIGFueVxuICAgICAqICAgICAgICBrZXkgd2hpY2ggZG9lcyBub3QgZXhpc3QsIHRoZSBmaXJzdCB0aW1lIGl0IGlzIGFjY2Vzc2VkLiBUaGVcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZXMsIGFzIGl0cyBvbmx5IGFyZ3VtZW50LCB0aGUga2V5IGJlaW5nIGNyZWF0ZWQuXG4gICAgICovXG4gICAgY2xhc3MgRGVmYXVsdFdlYWtNYXAgZXh0ZW5kcyBXZWFrTWFwIHtcbiAgICAgIGNvbnN0cnVjdG9yKGNyZWF0ZUl0ZW0sIGl0ZW1zID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHN1cGVyKGl0ZW1zKTtcbiAgICAgICAgdGhpcy5jcmVhdGVJdGVtID0gY3JlYXRlSXRlbTtcbiAgICAgIH1cblxuICAgICAgZ2V0KGtleSkge1xuICAgICAgICBpZiAoIXRoaXMuaGFzKGtleSkpIHtcbiAgICAgICAgICB0aGlzLnNldChrZXksIHRoaXMuY3JlYXRlSXRlbShrZXkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdXBlci5nZXQoa2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhbiBvYmplY3Qgd2l0aCBhIGB0aGVuYCBtZXRob2QsIGFuZCBjYW5cbiAgICAgKiB0aGVyZWZvcmUgYmUgYXNzdW1lZCB0byBiZWhhdmUgYXMgYSBQcm9taXNlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gdGVzdC5cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmFsdWUgaXMgdGhlbmFibGUuXG4gICAgICovXG4gICAgY29uc3QgaXNUaGVuYWJsZSA9IHZhbHVlID0+IHtcbiAgICAgIHJldHVybiB2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoLCB3aGVuIGNhbGxlZCwgd2lsbCByZXNvbHZlIG9yIHJlamVjdFxuICAgICAqIHRoZSBnaXZlbiBwcm9taXNlIGJhc2VkIG9uIGhvdyBpdCBpcyBjYWxsZWQ6XG4gICAgICpcbiAgICAgKiAtIElmLCB3aGVuIGNhbGxlZCwgYGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcmAgY29udGFpbnMgYSBub24tbnVsbCBvYmplY3QsXG4gICAgICogICB0aGUgcHJvbWlzZSBpcyByZWplY3RlZCB3aXRoIHRoYXQgdmFsdWUuXG4gICAgICogLSBJZiB0aGUgZnVuY3Rpb24gaXMgY2FsbGVkIHdpdGggZXhhY3RseSBvbmUgYXJndW1lbnQsIHRoZSBwcm9taXNlIGlzXG4gICAgICogICByZXNvbHZlZCB0byB0aGF0IHZhbHVlLlxuICAgICAqIC0gT3RoZXJ3aXNlLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB0byBhbiBhcnJheSBjb250YWluaW5nIGFsbCBvZiB0aGVcbiAgICAgKiAgIGZ1bmN0aW9uJ3MgYXJndW1lbnRzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHByb21pc2VcbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc29sdXRpb24gYW5kIHJlamVjdGlvbiBmdW5jdGlvbnMgb2YgYVxuICAgICAqICAgICAgICBwcm9taXNlLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb21pc2UucmVzb2x2ZVxuICAgICAqICAgICAgICBUaGUgcHJvbWlzZSdzIHJlc29sdXRpb24gZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbn0gcHJvbWlzZS5yZWplY3RcbiAgICAgKiAgICAgICAgVGhlIHByb21pc2UncyByZWplY3Rpb24gZnVuY3Rpb24uXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG1ldGFkYXRhXG4gICAgICogICAgICAgIE1ldGFkYXRhIGFib3V0IHRoZSB3cmFwcGVkIG1ldGhvZCB3aGljaCBoYXMgY3JlYXRlZCB0aGUgY2FsbGJhY2suXG4gICAgICogQHBhcmFtIHtib29sZWFufSBtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZ1xuICAgICAqICAgICAgICBXaGV0aGVyIG9yIG5vdCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIG9ubHkgdGhlIGZpcnN0XG4gICAgICogICAgICAgIGFyZ3VtZW50IG9mIHRoZSBjYWxsYmFjaywgYWx0ZXJuYXRpdmVseSBhbiBhcnJheSBvZiBhbGwgdGhlXG4gICAgICogICAgICAgIGNhbGxiYWNrIGFyZ3VtZW50cyBpcyByZXNvbHZlZC4gQnkgZGVmYXVsdCwgaWYgdGhlIGNhbGxiYWNrXG4gICAgICogICAgICAgIGZ1bmN0aW9uIGlzIGludm9rZWQgd2l0aCBvbmx5IGEgc2luZ2xlIGFyZ3VtZW50LCB0aGF0IHdpbGwgYmVcbiAgICAgKiAgICAgICAgcmVzb2x2ZWQgdG8gdGhlIHByb21pc2UsIHdoaWxlIGFsbCBhcmd1bWVudHMgd2lsbCBiZSByZXNvbHZlZCBhc1xuICAgICAqICAgICAgICBhbiBhcnJheSBpZiBtdWx0aXBsZSBhcmUgZ2l2ZW4uXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7ZnVuY3Rpb259XG4gICAgICogICAgICAgIFRoZSBnZW5lcmF0ZWQgY2FsbGJhY2sgZnVuY3Rpb24uXG4gICAgICovXG4gICAgY29uc3QgbWFrZUNhbGxiYWNrID0gKHByb21pc2UsIG1ldGFkYXRhKSA9PiB7XG4gICAgICByZXR1cm4gKC4uLmNhbGxiYWNrQXJncykgPT4ge1xuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgIHByb21pc2UucmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5zaW5nbGVDYWxsYmFja0FyZyB8fFxuICAgICAgICAgICAgICAgICAgIChjYWxsYmFja0FyZ3MubGVuZ3RoIDw9IDEgJiYgbWV0YWRhdGEuc2luZ2xlQ2FsbGJhY2tBcmcgIT09IGZhbHNlKSkge1xuICAgICAgICAgIHByb21pc2UucmVzb2x2ZShjYWxsYmFja0FyZ3NbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHByb21pc2UucmVzb2x2ZShjYWxsYmFja0FyZ3MpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBjb25zdCBwbHVyYWxpemVBcmd1bWVudHMgPSAobnVtQXJncykgPT4gbnVtQXJncyA9PSAxID8gXCJhcmd1bWVudFwiIDogXCJhcmd1bWVudHNcIjtcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSB3cmFwcGVyIGZ1bmN0aW9uIGZvciBhIG1ldGhvZCB3aXRoIHRoZSBnaXZlbiBuYW1lIGFuZCBtZXRhZGF0YS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogICAgICAgIFRoZSBuYW1lIG9mIHRoZSBtZXRob2Qgd2hpY2ggaXMgYmVpbmcgd3JhcHBlZC5cbiAgICAgKiBAcGFyYW0ge29iamVjdH0gbWV0YWRhdGFcbiAgICAgKiAgICAgICAgTWV0YWRhdGEgYWJvdXQgdGhlIG1ldGhvZCBiZWluZyB3cmFwcGVkLlxuICAgICAqIEBwYXJhbSB7aW50ZWdlcn0gbWV0YWRhdGEubWluQXJnc1xuICAgICAqICAgICAgICBUaGUgbWluaW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHdoaWNoIG11c3QgYmUgcGFzc2VkIHRvIHRoZVxuICAgICAqICAgICAgICBmdW5jdGlvbi4gSWYgY2FsbGVkIHdpdGggZmV3ZXIgdGhhbiB0aGlzIG51bWJlciBvZiBhcmd1bWVudHMsIHRoZVxuICAgICAqICAgICAgICB3cmFwcGVyIHdpbGwgcmFpc2UgYW4gZXhjZXB0aW9uLlxuICAgICAqIEBwYXJhbSB7aW50ZWdlcn0gbWV0YWRhdGEubWF4QXJnc1xuICAgICAqICAgICAgICBUaGUgbWF4aW11bSBudW1iZXIgb2YgYXJndW1lbnRzIHdoaWNoIG1heSBiZSBwYXNzZWQgdG8gdGhlXG4gICAgICogICAgICAgIGZ1bmN0aW9uLiBJZiBjYWxsZWQgd2l0aCBtb3JlIHRoYW4gdGhpcyBudW1iZXIgb2YgYXJndW1lbnRzLCB0aGVcbiAgICAgKiAgICAgICAgd3JhcHBlciB3aWxsIHJhaXNlIGFuIGV4Y2VwdGlvbi5cbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IG1ldGFkYXRhLnNpbmdsZUNhbGxiYWNrQXJnXG4gICAgICogICAgICAgIFdoZXRoZXIgb3Igbm90IHRoZSBwcm9taXNlIGlzIHJlc29sdmVkIHdpdGggb25seSB0aGUgZmlyc3RcbiAgICAgKiAgICAgICAgYXJndW1lbnQgb2YgdGhlIGNhbGxiYWNrLCBhbHRlcm5hdGl2ZWx5IGFuIGFycmF5IG9mIGFsbCB0aGVcbiAgICAgKiAgICAgICAgY2FsbGJhY2sgYXJndW1lbnRzIGlzIHJlc29sdmVkLiBCeSBkZWZhdWx0LCBpZiB0aGUgY2FsbGJhY2tcbiAgICAgKiAgICAgICAgZnVuY3Rpb24gaXMgaW52b2tlZCB3aXRoIG9ubHkgYSBzaW5nbGUgYXJndW1lbnQsIHRoYXQgd2lsbCBiZVxuICAgICAqICAgICAgICByZXNvbHZlZCB0byB0aGUgcHJvbWlzZSwgd2hpbGUgYWxsIGFyZ3VtZW50cyB3aWxsIGJlIHJlc29sdmVkIGFzXG4gICAgICogICAgICAgIGFuIGFycmF5IGlmIG11bHRpcGxlIGFyZSBnaXZlbi5cbiAgICAgKlxuICAgICAqIEByZXR1cm5zIHtmdW5jdGlvbihvYmplY3QsIC4uLiopfVxuICAgICAqICAgICAgIFRoZSBnZW5lcmF0ZWQgd3JhcHBlciBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICBjb25zdCB3cmFwQXN5bmNGdW5jdGlvbiA9IChuYW1lLCBtZXRhZGF0YSkgPT4ge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGFzeW5jRnVuY3Rpb25XcmFwcGVyKHRhcmdldCwgLi4uYXJncykge1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPCBtZXRhZGF0YS5taW5BcmdzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBhdCBsZWFzdCAke21ldGFkYXRhLm1pbkFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1pbkFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IG1ldGFkYXRhLm1heEFyZ3MpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IG1vc3QgJHttZXRhZGF0YS5tYXhBcmdzfSAke3BsdXJhbGl6ZUFyZ3VtZW50cyhtZXRhZGF0YS5tYXhBcmdzKX0gZm9yICR7bmFtZX0oKSwgZ290ICR7YXJncy5sZW5ndGh9YCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIGlmIChtZXRhZGF0YS5mYWxsYmFja1RvTm9DYWxsYmFjaykge1xuICAgICAgICAgICAgLy8gVGhpcyBBUEkgbWV0aG9kIGhhcyBjdXJyZW50bHkgbm8gY2FsbGJhY2sgb24gQ2hyb21lLCBidXQgaXQgcmV0dXJuIGEgcHJvbWlzZSBvbiBGaXJlZm94LFxuICAgICAgICAgICAgLy8gYW5kIHNvIHRoZSBwb2x5ZmlsbCB3aWxsIHRyeSB0byBjYWxsIGl0IHdpdGggYSBjYWxsYmFjayBmaXJzdCwgYW5kIGl0IHdpbGwgZmFsbGJhY2tcbiAgICAgICAgICAgIC8vIHRvIG5vdCBwYXNzaW5nIHRoZSBjYWxsYmFjayBpZiB0aGUgZmlyc3QgY2FsbCBmYWlscy5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzLCBtYWtlQ2FsbGJhY2soe3Jlc29sdmUsIHJlamVjdH0sIG1ldGFkYXRhKSk7XG4gICAgICAgICAgICB9IGNhdGNoIChjYkVycm9yKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUud2FybihgJHtuYW1lfSBBUEkgbWV0aG9kIGRvZXNuJ3Qgc2VlbSB0byBzdXBwb3J0IHRoZSBjYWxsYmFjayBwYXJhbWV0ZXIsIGAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJmYWxsaW5nIGJhY2sgdG8gY2FsbCBpdCB3aXRob3V0IGEgY2FsbGJhY2s6IFwiLCBjYkVycm9yKTtcblxuICAgICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncyk7XG5cbiAgICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSBBUEkgbWV0aG9kIG1ldGFkYXRhLCBzbyB0aGF0IHRoZSBuZXh0IEFQSSBjYWxscyB3aWxsIG5vdCB0cnkgdG9cbiAgICAgICAgICAgICAgLy8gdXNlIHRoZSB1bnN1cHBvcnRlZCBjYWxsYmFjayBhbnltb3JlLlxuICAgICAgICAgICAgICBtZXRhZGF0YS5mYWxsYmFja1RvTm9DYWxsYmFjayA9IGZhbHNlO1xuICAgICAgICAgICAgICBtZXRhZGF0YS5ub0NhbGxiYWNrID0gdHJ1ZTtcblxuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChtZXRhZGF0YS5ub0NhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXJnZXRbbmFtZV0oLi4uYXJncyk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtuYW1lXSguLi5hcmdzLCBtYWtlQ2FsbGJhY2soe3Jlc29sdmUsIHJlamVjdH0sIG1ldGFkYXRhKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFdyYXBzIGFuIGV4aXN0aW5nIG1ldGhvZCBvZiB0aGUgdGFyZ2V0IG9iamVjdCwgc28gdGhhdCBjYWxscyB0byBpdCBhcmVcbiAgICAgKiBpbnRlcmNlcHRlZCBieSB0aGUgZ2l2ZW4gd3JhcHBlciBmdW5jdGlvbi4gVGhlIHdyYXBwZXIgZnVuY3Rpb24gcmVjZWl2ZXMsXG4gICAgICogYXMgaXRzIGZpcnN0IGFyZ3VtZW50LCB0aGUgb3JpZ2luYWwgYHRhcmdldGAgb2JqZWN0LCBmb2xsb3dlZCBieSBlYWNoIG9mXG4gICAgICogdGhlIGFyZ3VtZW50cyBwYXNzZWQgdG8gdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgKiAgICAgICAgVGhlIG9yaWdpbmFsIHRhcmdldCBvYmplY3QgdGhhdCB0aGUgd3JhcHBlZCBtZXRob2QgYmVsb25ncyB0by5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBtZXRob2RcbiAgICAgKiAgICAgICAgVGhlIG1ldGhvZCBiZWluZyB3cmFwcGVkLiBUaGlzIGlzIHVzZWQgYXMgdGhlIHRhcmdldCBvZiB0aGUgUHJveHlcbiAgICAgKiAgICAgICAgb2JqZWN0IHdoaWNoIGlzIGNyZWF0ZWQgdG8gd3JhcCB0aGUgbWV0aG9kLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IHdyYXBwZXJcbiAgICAgKiAgICAgICAgVGhlIHdyYXBwZXIgZnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIGluIHBsYWNlIG9mIGEgZGlyZWN0IGludm9jYXRpb25cbiAgICAgKiAgICAgICAgb2YgdGhlIHdyYXBwZWQgbWV0aG9kLlxuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb3h5PGZ1bmN0aW9uPn1cbiAgICAgKiAgICAgICAgQSBQcm94eSBvYmplY3QgZm9yIHRoZSBnaXZlbiBtZXRob2QsIHdoaWNoIGludm9rZXMgdGhlIGdpdmVuIHdyYXBwZXJcbiAgICAgKiAgICAgICAgbWV0aG9kIGluIGl0cyBwbGFjZS5cbiAgICAgKi9cbiAgICBjb25zdCB3cmFwTWV0aG9kID0gKHRhcmdldCwgbWV0aG9kLCB3cmFwcGVyKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFByb3h5KG1ldGhvZCwge1xuICAgICAgICBhcHBseSh0YXJnZXRNZXRob2QsIHRoaXNPYmosIGFyZ3MpIHtcbiAgICAgICAgICByZXR1cm4gd3JhcHBlci5jYWxsKHRoaXNPYmosIHRhcmdldCwgLi4uYXJncyk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgbGV0IGhhc093blByb3BlcnR5ID0gRnVuY3Rpb24uY2FsbC5iaW5kKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkpO1xuXG4gICAgLyoqXG4gICAgICogV3JhcHMgYW4gb2JqZWN0IGluIGEgUHJveHkgd2hpY2ggaW50ZXJjZXB0cyBhbmQgd3JhcHMgY2VydGFpbiBtZXRob2RzXG4gICAgICogYmFzZWQgb24gdGhlIGdpdmVuIGB3cmFwcGVyc2AgYW5kIGBtZXRhZGF0YWAgb2JqZWN0cy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSB0YXJnZXRcbiAgICAgKiAgICAgICAgVGhlIHRhcmdldCBvYmplY3QgdG8gd3JhcC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBbd3JhcHBlcnMgPSB7fV1cbiAgICAgKiAgICAgICAgQW4gb2JqZWN0IHRyZWUgY29udGFpbmluZyB3cmFwcGVyIGZ1bmN0aW9ucyBmb3Igc3BlY2lhbCBjYXNlcy4gQW55XG4gICAgICogICAgICAgIGZ1bmN0aW9uIHByZXNlbnQgaW4gdGhpcyBvYmplY3QgdHJlZSBpcyBjYWxsZWQgaW4gcGxhY2Ugb2YgdGhlXG4gICAgICogICAgICAgIG1ldGhvZCBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYHRhcmdldGAgb2JqZWN0IHRyZWUuIFRoZXNlXG4gICAgICogICAgICAgIHdyYXBwZXIgbWV0aG9kcyBhcmUgaW52b2tlZCBhcyBkZXNjcmliZWQgaW4ge0BzZWUgd3JhcE1ldGhvZH0uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gW21ldGFkYXRhID0ge31dXG4gICAgICogICAgICAgIEFuIG9iamVjdCB0cmVlIGNvbnRhaW5pbmcgbWV0YWRhdGEgdXNlZCB0byBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlXG4gICAgICogICAgICAgIFByb21pc2UtYmFzZWQgd3JhcHBlciBmdW5jdGlvbnMgZm9yIGFzeW5jaHJvbm91cy4gQW55IGZ1bmN0aW9uIGluXG4gICAgICogICAgICAgIHRoZSBgdGFyZ2V0YCBvYmplY3QgdHJlZSB3aGljaCBoYXMgYSBjb3JyZXNwb25kaW5nIG1ldGFkYXRhIG9iamVjdFxuICAgICAqICAgICAgICBpbiB0aGUgc2FtZSBsb2NhdGlvbiBpbiB0aGUgYG1ldGFkYXRhYCB0cmVlIGlzIHJlcGxhY2VkIHdpdGggYW5cbiAgICAgKiAgICAgICAgYXV0b21hdGljYWxseS1nZW5lcmF0ZWQgd3JhcHBlciBmdW5jdGlvbiwgYXMgZGVzY3JpYmVkIGluXG4gICAgICogICAgICAgIHtAc2VlIHdyYXBBc3luY0Z1bmN0aW9ufVxuICAgICAqXG4gICAgICogQHJldHVybnMge1Byb3h5PG9iamVjdD59XG4gICAgICovXG4gICAgY29uc3Qgd3JhcE9iamVjdCA9ICh0YXJnZXQsIHdyYXBwZXJzID0ge30sIG1ldGFkYXRhID0ge30pID0+IHtcbiAgICAgIGxldCBjYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICBsZXQgaGFuZGxlcnMgPSB7XG4gICAgICAgIGhhcyhwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgIHJldHVybiBwcm9wIGluIHRhcmdldCB8fCBwcm9wIGluIGNhY2hlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldChwcm94eVRhcmdldCwgcHJvcCwgcmVjZWl2ZXIpIHtcbiAgICAgICAgICBpZiAocHJvcCBpbiBjYWNoZSkge1xuICAgICAgICAgICAgcmV0dXJuIGNhY2hlW3Byb3BdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmICghKHByb3AgaW4gdGFyZ2V0KSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgdmFsdWUgPSB0YXJnZXRbcHJvcF07XG5cbiAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgaXMgYSBtZXRob2Qgb24gdGhlIHVuZGVybHlpbmcgb2JqZWN0LiBDaGVjayBpZiB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbnkgd3JhcHBpbmcuXG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygd3JhcHBlcnNbcHJvcF0gPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAvLyBXZSBoYXZlIGEgc3BlY2lhbC1jYXNlIHdyYXBwZXIgZm9yIHRoaXMgbWV0aG9kLlxuICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBNZXRob2QodGFyZ2V0LCB0YXJnZXRbcHJvcF0sIHdyYXBwZXJzW3Byb3BdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGFzT3duUHJvcGVydHkobWV0YWRhdGEsIHByb3ApKSB7XG4gICAgICAgICAgICAgIC8vIFRoaXMgaXMgYW4gYXN5bmMgbWV0aG9kIHRoYXQgd2UgaGF2ZSBtZXRhZGF0YSBmb3IuIENyZWF0ZSBhXG4gICAgICAgICAgICAgIC8vIFByb21pc2Ugd3JhcHBlciBmb3IgaXQuXG4gICAgICAgICAgICAgIGxldCB3cmFwcGVyID0gd3JhcEFzeW5jRnVuY3Rpb24ocHJvcCwgbWV0YWRhdGFbcHJvcF0pO1xuICAgICAgICAgICAgICB2YWx1ZSA9IHdyYXBNZXRob2QodGFyZ2V0LCB0YXJnZXRbcHJvcF0sIHdyYXBwZXIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyBhIG1ldGhvZCB0aGF0IHdlIGRvbid0IGtub3cgb3IgY2FyZSBhYm91dC4gUmV0dXJuIHRoZVxuICAgICAgICAgICAgICAvLyBvcmlnaW5hbCBtZXRob2QsIGJvdW5kIHRvIHRoZSB1bmRlcmx5aW5nIG9iamVjdC5cbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5iaW5kKHRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgJiYgdmFsdWUgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgIChoYXNPd25Qcm9wZXJ0eSh3cmFwcGVycywgcHJvcCkgfHxcbiAgICAgICAgICAgICAgICAgICAgICBoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgcHJvcCkpKSB7XG4gICAgICAgICAgICAvLyBUaGlzIGlzIGFuIG9iamVjdCB0aGF0IHdlIG5lZWQgdG8gZG8gc29tZSB3cmFwcGluZyBmb3IgdGhlIGNoaWxkcmVuXG4gICAgICAgICAgICAvLyBvZi4gQ3JlYXRlIGEgc3ViLW9iamVjdCB3cmFwcGVyIGZvciBpdCB3aXRoIHRoZSBhcHByb3ByaWF0ZSBjaGlsZFxuICAgICAgICAgICAgLy8gbWV0YWRhdGEuXG4gICAgICAgICAgICB2YWx1ZSA9IHdyYXBPYmplY3QodmFsdWUsIHdyYXBwZXJzW3Byb3BdLCBtZXRhZGF0YVtwcm9wXSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChoYXNPd25Qcm9wZXJ0eShtZXRhZGF0YSwgXCIqXCIpKSB7XG4gICAgICAgICAgICAvLyBXcmFwIGFsbCBwcm9wZXJ0aWVzIGluICogbmFtZXNwYWNlLlxuICAgICAgICAgICAgdmFsdWUgPSB3cmFwT2JqZWN0KHZhbHVlLCB3cmFwcGVyc1twcm9wXSwgbWV0YWRhdGFbXCIqXCJdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gV2UgZG9uJ3QgbmVlZCB0byBkbyBhbnkgd3JhcHBpbmcgZm9yIHRoaXMgcHJvcGVydHksXG4gICAgICAgICAgICAvLyBzbyBqdXN0IGZvcndhcmQgYWxsIGFjY2VzcyB0byB0aGUgdW5kZXJseWluZyBvYmplY3QuXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2FjaGUsIHByb3AsIHtcbiAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFtwcm9wXTtcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgc2V0KHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0W3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGNhY2hlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldChwcm94eVRhcmdldCwgcHJvcCwgdmFsdWUsIHJlY2VpdmVyKSB7XG4gICAgICAgICAgaWYgKHByb3AgaW4gY2FjaGUpIHtcbiAgICAgICAgICAgIGNhY2hlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWZpbmVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCwgZGVzYykge1xuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlZmluZVByb3BlcnR5KGNhY2hlLCBwcm9wLCBkZXNjKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWxldGVQcm9wZXJ0eShwcm94eVRhcmdldCwgcHJvcCkge1xuICAgICAgICAgIHJldHVybiBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KGNhY2hlLCBwcm9wKTtcbiAgICAgICAgfSxcbiAgICAgIH07XG5cbiAgICAgIC8vIFBlciBjb250cmFjdCBvZiB0aGUgUHJveHkgQVBJLCB0aGUgXCJnZXRcIiBwcm94eSBoYW5kbGVyIG11c3QgcmV0dXJuIHRoZVxuICAgICAgLy8gb3JpZ2luYWwgdmFsdWUgb2YgdGhlIHRhcmdldCBpZiB0aGF0IHZhbHVlIGlzIGRlY2xhcmVkIHJlYWQtb25seSBhbmRcbiAgICAgIC8vIG5vbi1jb25maWd1cmFibGUuIEZvciB0aGlzIHJlYXNvbiwgd2UgY3JlYXRlIGFuIG9iamVjdCB3aXRoIHRoZVxuICAgICAgLy8gcHJvdG90eXBlIHNldCB0byBgdGFyZ2V0YCBpbnN0ZWFkIG9mIHVzaW5nIGB0YXJnZXRgIGRpcmVjdGx5LlxuICAgICAgLy8gT3RoZXJ3aXNlIHdlIGNhbm5vdCByZXR1cm4gYSBjdXN0b20gb2JqZWN0IGZvciBBUElzIHRoYXRcbiAgICAgIC8vIGFyZSBkZWNsYXJlZCByZWFkLW9ubHkgYW5kIG5vbi1jb25maWd1cmFibGUsIHN1Y2ggYXMgYGNocm9tZS5kZXZ0b29sc2AuXG4gICAgICAvL1xuICAgICAgLy8gVGhlIHByb3h5IGhhbmRsZXJzIHRoZW1zZWx2ZXMgd2lsbCBzdGlsbCB1c2UgdGhlIG9yaWdpbmFsIGB0YXJnZXRgXG4gICAgICAvLyBpbnN0ZWFkIG9mIHRoZSBgcHJveHlUYXJnZXRgLCBzbyB0aGF0IHRoZSBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzIGFyZVxuICAgICAgLy8gZGVyZWZlcmVuY2VkIHZpYSB0aGUgb3JpZ2luYWwgdGFyZ2V0cy5cbiAgICAgIGxldCBwcm94eVRhcmdldCA9IE9iamVjdC5jcmVhdGUodGFyZ2V0KTtcbiAgICAgIHJldHVybiBuZXcgUHJveHkocHJveHlUYXJnZXQsIGhhbmRsZXJzKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNldCBvZiB3cmFwcGVyIGZ1bmN0aW9ucyBmb3IgYW4gZXZlbnQgb2JqZWN0LCB3aGljaCBoYW5kbGVzXG4gICAgICogd3JhcHBpbmcgb2YgbGlzdGVuZXIgZnVuY3Rpb25zIHRoYXQgdGhvc2UgbWVzc2FnZXMgYXJlIHBhc3NlZC5cbiAgICAgKlxuICAgICAqIEEgc2luZ2xlIHdyYXBwZXIgaXMgY3JlYXRlZCBmb3IgZWFjaCBsaXN0ZW5lciBmdW5jdGlvbiwgYW5kIHN0b3JlZCBpbiBhXG4gICAgICogbWFwLiBTdWJzZXF1ZW50IGNhbGxzIHRvIGBhZGRMaXN0ZW5lcmAsIGBoYXNMaXN0ZW5lcmAsIG9yIGByZW1vdmVMaXN0ZW5lcmBcbiAgICAgKiByZXRyaWV2ZSB0aGUgb3JpZ2luYWwgd3JhcHBlciwgc28gdGhhdCAgYXR0ZW1wdHMgdG8gcmVtb3ZlIGFcbiAgICAgKiBwcmV2aW91c2x5LWFkZGVkIGxpc3RlbmVyIHdvcmsgYXMgZXhwZWN0ZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge0RlZmF1bHRXZWFrTWFwPGZ1bmN0aW9uLCBmdW5jdGlvbj59IHdyYXBwZXJNYXBcbiAgICAgKiAgICAgICAgQSBEZWZhdWx0V2Vha01hcCBvYmplY3Qgd2hpY2ggd2lsbCBjcmVhdGUgdGhlIGFwcHJvcHJpYXRlIHdyYXBwZXJcbiAgICAgKiAgICAgICAgZm9yIGEgZ2l2ZW4gbGlzdGVuZXIgZnVuY3Rpb24gd2hlbiBvbmUgZG9lcyBub3QgZXhpc3QsIGFuZCByZXRyaWV2ZVxuICAgICAqICAgICAgICBhbiBleGlzdGluZyBvbmUgd2hlbiBpdCBkb2VzLlxuICAgICAqXG4gICAgICogQHJldHVybnMge29iamVjdH1cbiAgICAgKi9cbiAgICBjb25zdCB3cmFwRXZlbnQgPSB3cmFwcGVyTWFwID0+ICh7XG4gICAgICBhZGRMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyLCAuLi5hcmdzKSB7XG4gICAgICAgIHRhcmdldC5hZGRMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lciksIC4uLmFyZ3MpO1xuICAgICAgfSxcblxuICAgICAgaGFzTGlzdGVuZXIodGFyZ2V0LCBsaXN0ZW5lcikge1xuICAgICAgICByZXR1cm4gdGFyZ2V0Lmhhc0xpc3RlbmVyKHdyYXBwZXJNYXAuZ2V0KGxpc3RlbmVyKSk7XG4gICAgICB9LFxuXG4gICAgICByZW1vdmVMaXN0ZW5lcih0YXJnZXQsIGxpc3RlbmVyKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVMaXN0ZW5lcih3cmFwcGVyTWFwLmdldChsaXN0ZW5lcikpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IG9uUmVxdWVzdEZpbmlzaGVkV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAobGlzdGVuZXIgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhbiBvblJlcXVlc3RGaW5pc2hlZCBsaXN0ZW5lciBmdW5jdGlvbiBzbyB0aGF0IGl0IHdpbGwgcmV0dXJuIGFcbiAgICAgICAqIGBnZXRDb250ZW50KClgIHByb3BlcnR5IHdoaWNoIHJldHVybnMgYSBgUHJvbWlzZWAgcmF0aGVyIHRoYW4gdXNpbmcgYVxuICAgICAgICogY2FsbGJhY2sgQVBJLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSByZXFcbiAgICAgICAqICAgICAgICBUaGUgSEFSIGVudHJ5IG9iamVjdCByZXByZXNlbnRpbmcgdGhlIG5ldHdvcmsgcmVxdWVzdC5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uUmVxdWVzdEZpbmlzaGVkKHJlcSkge1xuICAgICAgICBjb25zdCB3cmFwcGVkUmVxID0gd3JhcE9iamVjdChyZXEsIHt9IC8qIHdyYXBwZXJzICovLCB7XG4gICAgICAgICAgZ2V0Q29udGVudDoge1xuICAgICAgICAgICAgbWluQXJnczogMCxcbiAgICAgICAgICAgIG1heEFyZ3M6IDAsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGxpc3RlbmVyKHdyYXBwZWRSZXEpO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIEtlZXAgdHJhY2sgaWYgdGhlIGRlcHJlY2F0aW9uIHdhcm5pbmcgaGFzIGJlZW4gbG9nZ2VkIGF0IGxlYXN0IG9uY2UuXG4gICAgbGV0IGxvZ2dlZFNlbmRSZXNwb25zZURlcHJlY2F0aW9uV2FybmluZyA9IGZhbHNlO1xuXG4gICAgY29uc3Qgb25NZXNzYWdlV3JhcHBlcnMgPSBuZXcgRGVmYXVsdFdlYWtNYXAobGlzdGVuZXIgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgIH1cblxuICAgICAgLyoqXG4gICAgICAgKiBXcmFwcyBhIG1lc3NhZ2UgbGlzdGVuZXIgZnVuY3Rpb24gc28gdGhhdCBpdCBtYXkgc2VuZCByZXNwb25zZXMgYmFzZWQgb25cbiAgICAgICAqIGl0cyByZXR1cm4gdmFsdWUsIHJhdGhlciB0aGFuIGJ5IHJldHVybmluZyBhIHNlbnRpbmVsIHZhbHVlIGFuZCBjYWxsaW5nIGFcbiAgICAgICAqIGNhbGxiYWNrLiBJZiB0aGUgbGlzdGVuZXIgZnVuY3Rpb24gcmV0dXJucyBhIFByb21pc2UsIHRoZSByZXNwb25zZSBpc1xuICAgICAgICogc2VudCB3aGVuIHRoZSBwcm9taXNlIGVpdGhlciByZXNvbHZlcyBvciByZWplY3RzLlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSB7Kn0gbWVzc2FnZVxuICAgICAgICogICAgICAgIFRoZSBtZXNzYWdlIHNlbnQgYnkgdGhlIG90aGVyIGVuZCBvZiB0aGUgY2hhbm5lbC5cbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZW5kZXJcbiAgICAgICAqICAgICAgICBEZXRhaWxzIGFib3V0IHRoZSBzZW5kZXIgb2YgdGhlIG1lc3NhZ2UuXG4gICAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uKCopfSBzZW5kUmVzcG9uc2VcbiAgICAgICAqICAgICAgICBBIGNhbGxiYWNrIHdoaWNoLCB3aGVuIGNhbGxlZCB3aXRoIGFuIGFyYml0cmFyeSBhcmd1bWVudCwgc2VuZHNcbiAgICAgICAqICAgICAgICB0aGF0IHZhbHVlIGFzIGEgcmVzcG9uc2UuXG4gICAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgICAqICAgICAgICBUcnVlIGlmIHRoZSB3cmFwcGVkIGxpc3RlbmVyIHJldHVybmVkIGEgUHJvbWlzZSwgd2hpY2ggd2lsbCBsYXRlclxuICAgICAgICogICAgICAgIHlpZWxkIGEgcmVzcG9uc2UuIEZhbHNlIG90aGVyd2lzZS5cbiAgICAgICAqL1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIG9uTWVzc2FnZShtZXNzYWdlLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkge1xuICAgICAgICBsZXQgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCB3cmFwcGVkU2VuZFJlc3BvbnNlO1xuICAgICAgICBsZXQgc2VuZFJlc3BvbnNlUHJvbWlzZSA9IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICAgIHdyYXBwZWRTZW5kUmVzcG9uc2UgPSBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKCFsb2dnZWRTZW5kUmVzcG9uc2VEZXByZWNhdGlvbldhcm5pbmcpIHtcbiAgICAgICAgICAgICAgY29uc29sZS53YXJuKFNFTkRfUkVTUE9OU0VfREVQUkVDQVRJT05fV0FSTklORywgbmV3IEVycm9yKCkuc3RhY2spO1xuICAgICAgICAgICAgICBsb2dnZWRTZW5kUmVzcG9uc2VEZXByZWNhdGlvbldhcm5pbmcgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGlkQ2FsbFNlbmRSZXNwb25zZSA9IHRydWU7XG4gICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICB9O1xuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGxpc3RlbmVyKG1lc3NhZ2UsIHNlbmRlciwgd3JhcHBlZFNlbmRSZXNwb25zZSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgIHJlc3VsdCA9IFByb21pc2UucmVqZWN0KGVycik7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpc1Jlc3VsdFRoZW5hYmxlID0gcmVzdWx0ICE9PSB0cnVlICYmIGlzVGhlbmFibGUocmVzdWx0KTtcblxuICAgICAgICAvLyBJZiB0aGUgbGlzdGVuZXIgZGlkbid0IHJldHVybmVkIHRydWUgb3IgYSBQcm9taXNlLCBvciBjYWxsZWRcbiAgICAgICAgLy8gd3JhcHBlZFNlbmRSZXNwb25zZSBzeW5jaHJvbm91c2x5LCB3ZSBjYW4gZXhpdCBlYXJsaWVyXG4gICAgICAgIC8vIGJlY2F1c2UgdGhlcmUgd2lsbCBiZSBubyByZXNwb25zZSBzZW50IGZyb20gdGhpcyBsaXN0ZW5lci5cbiAgICAgICAgaWYgKHJlc3VsdCAhPT0gdHJ1ZSAmJiAhaXNSZXN1bHRUaGVuYWJsZSAmJiAhZGlkQ2FsbFNlbmRSZXNwb25zZSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgc21hbGwgaGVscGVyIHRvIHNlbmQgdGhlIG1lc3NhZ2UgaWYgdGhlIHByb21pc2UgcmVzb2x2ZXNcbiAgICAgICAgLy8gYW5kIGFuIGVycm9yIGlmIHRoZSBwcm9taXNlIHJlamVjdHMgKGEgd3JhcHBlZCBzZW5kTWVzc2FnZSBoYXNcbiAgICAgICAgLy8gdG8gdHJhbnNsYXRlIHRoZSBtZXNzYWdlIGludG8gYSByZXNvbHZlZCBwcm9taXNlIG9yIGEgcmVqZWN0ZWRcbiAgICAgICAgLy8gcHJvbWlzZSkuXG4gICAgICAgIGNvbnN0IHNlbmRQcm9taXNlZFJlc3VsdCA9IChwcm9taXNlKSA9PiB7XG4gICAgICAgICAgcHJvbWlzZS50aGVuKG1zZyA9PiB7XG4gICAgICAgICAgICAvLyBzZW5kIHRoZSBtZXNzYWdlIHZhbHVlLlxuICAgICAgICAgICAgc2VuZFJlc3BvbnNlKG1zZyk7XG4gICAgICAgICAgfSwgZXJyb3IgPT4ge1xuICAgICAgICAgICAgLy8gU2VuZCBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGVycm9yIGlmIHRoZSByZWplY3RlZCB2YWx1ZVxuICAgICAgICAgICAgLy8gaXMgYW4gaW5zdGFuY2Ugb2YgZXJyb3IsIG9yIHRoZSBvYmplY3QgaXRzZWxmIG90aGVyd2lzZS5cbiAgICAgICAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgICAgICAgaWYgKGVycm9yICYmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yIHx8XG4gICAgICAgICAgICAgICAgdHlwZW9mIGVycm9yLm1lc3NhZ2UgPT09IFwic3RyaW5nXCIpKSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbWVzc2FnZSA9IFwiQW4gdW5leHBlY3RlZCBlcnJvciBvY2N1cnJlZFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZW5kUmVzcG9uc2Uoe1xuICAgICAgICAgICAgICBfX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X186IHRydWUsXG4gICAgICAgICAgICAgIG1lc3NhZ2UsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgICAgICAgLy8gUHJpbnQgYW4gZXJyb3Igb24gdGhlIGNvbnNvbGUgaWYgdW5hYmxlIHRvIHNlbmQgdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzZW5kIG9uTWVzc2FnZSByZWplY3RlZCByZXBseVwiLCBlcnIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoZSBsaXN0ZW5lciByZXR1cm5lZCBhIFByb21pc2UsIHNlbmQgdGhlIHJlc29sdmVkIHZhbHVlIGFzIGFcbiAgICAgICAgLy8gcmVzdWx0LCBvdGhlcndpc2Ugd2FpdCB0aGUgcHJvbWlzZSByZWxhdGVkIHRvIHRoZSB3cmFwcGVkU2VuZFJlc3BvbnNlXG4gICAgICAgIC8vIGNhbGxiYWNrIHRvIHJlc29sdmUgYW5kIHNlbmQgaXQgYXMgYSByZXNwb25zZS5cbiAgICAgICAgaWYgKGlzUmVzdWx0VGhlbmFibGUpIHtcbiAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZW5kUHJvbWlzZWRSZXN1bHQoc2VuZFJlc3BvbnNlUHJvbWlzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMZXQgQ2hyb21lIGtub3cgdGhhdCB0aGUgbGlzdGVuZXIgaXMgcmVwbHlpbmcuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICB9KTtcblxuICAgIGNvbnN0IHdyYXBwZWRTZW5kTWVzc2FnZUNhbGxiYWNrID0gKHtyZWplY3QsIHJlc29sdmV9LCByZXBseSkgPT4ge1xuICAgICAgaWYgKGV4dGVuc2lvbkFQSXMucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgLy8gRGV0ZWN0IHdoZW4gbm9uZSBvZiB0aGUgbGlzdGVuZXJzIHJlcGxpZWQgdG8gdGhlIHNlbmRNZXNzYWdlIGNhbGwgYW5kIHJlc29sdmVcbiAgICAgICAgLy8gdGhlIHByb21pc2UgdG8gdW5kZWZpbmVkIGFzIGluIEZpcmVmb3guXG4gICAgICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS93ZWJleHRlbnNpb24tcG9seWZpbGwvaXNzdWVzLzEzMFxuICAgICAgICBpZiAoZXh0ZW5zaW9uQVBJcy5ydW50aW1lLmxhc3RFcnJvci5tZXNzYWdlID09PSBDSFJPTUVfU0VORF9NRVNTQUdFX0NBTExCQUNLX05PX1JFU1BPTlNFX01FU1NBR0UpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihleHRlbnNpb25BUElzLnJ1bnRpbWUubGFzdEVycm9yLm1lc3NhZ2UpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChyZXBseSAmJiByZXBseS5fX21veldlYkV4dGVuc2lvblBvbHlmaWxsUmVqZWN0X18pIHtcbiAgICAgICAgLy8gQ29udmVydCBiYWNrIHRoZSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBlcnJvciBpbnRvXG4gICAgICAgIC8vIGFuIEVycm9yIGluc3RhbmNlLlxuICAgICAgICByZWplY3QobmV3IEVycm9yKHJlcGx5Lm1lc3NhZ2UpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmUocmVwbHkpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB3cmFwcGVkU2VuZE1lc3NhZ2UgPSAobmFtZSwgbWV0YWRhdGEsIGFwaU5hbWVzcGFjZU9iaiwgLi4uYXJncykgPT4ge1xuICAgICAgaWYgKGFyZ3MubGVuZ3RoIDwgbWV0YWRhdGEubWluQXJncykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEV4cGVjdGVkIGF0IGxlYXN0ICR7bWV0YWRhdGEubWluQXJnc30gJHtwbHVyYWxpemVBcmd1bWVudHMobWV0YWRhdGEubWluQXJncyl9IGZvciAke25hbWV9KCksIGdvdCAke2FyZ3MubGVuZ3RofWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPiBtZXRhZGF0YS5tYXhBcmdzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgYXQgbW9zdCAke21ldGFkYXRhLm1heEFyZ3N9ICR7cGx1cmFsaXplQXJndW1lbnRzKG1ldGFkYXRhLm1heEFyZ3MpfSBmb3IgJHtuYW1lfSgpLCBnb3QgJHthcmdzLmxlbmd0aH1gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgd3JhcHBlZENiID0gd3JhcHBlZFNlbmRNZXNzYWdlQ2FsbGJhY2suYmluZChudWxsLCB7cmVzb2x2ZSwgcmVqZWN0fSk7XG4gICAgICAgIGFyZ3MucHVzaCh3cmFwcGVkQ2IpO1xuICAgICAgICBhcGlOYW1lc3BhY2VPYmouc2VuZE1lc3NhZ2UoLi4uYXJncyk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc3RhdGljV3JhcHBlcnMgPSB7XG4gICAgICBkZXZ0b29sczoge1xuICAgICAgICBuZXR3b3JrOiB7XG4gICAgICAgICAgb25SZXF1ZXN0RmluaXNoZWQ6IHdyYXBFdmVudChvblJlcXVlc3RGaW5pc2hlZFdyYXBwZXJzKSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBydW50aW1lOiB7XG4gICAgICAgIG9uTWVzc2FnZTogd3JhcEV2ZW50KG9uTWVzc2FnZVdyYXBwZXJzKSxcbiAgICAgICAgb25NZXNzYWdlRXh0ZXJuYWw6IHdyYXBFdmVudChvbk1lc3NhZ2VXcmFwcGVycyksXG4gICAgICAgIHNlbmRNZXNzYWdlOiB3cmFwcGVkU2VuZE1lc3NhZ2UuYmluZChudWxsLCBcInNlbmRNZXNzYWdlXCIsIHttaW5BcmdzOiAxLCBtYXhBcmdzOiAzfSksXG4gICAgICB9LFxuICAgICAgdGFiczoge1xuICAgICAgICBzZW5kTWVzc2FnZTogd3JhcHBlZFNlbmRNZXNzYWdlLmJpbmQobnVsbCwgXCJzZW5kTWVzc2FnZVwiLCB7bWluQXJnczogMiwgbWF4QXJnczogM30pLFxuICAgICAgfSxcbiAgICB9O1xuICAgIGNvbnN0IHNldHRpbmdNZXRhZGF0YSA9IHtcbiAgICAgIGNsZWFyOiB7bWluQXJnczogMSwgbWF4QXJnczogMX0sXG4gICAgICBnZXQ6IHttaW5BcmdzOiAxLCBtYXhBcmdzOiAxfSxcbiAgICAgIHNldDoge21pbkFyZ3M6IDEsIG1heEFyZ3M6IDF9LFxuICAgIH07XG4gICAgYXBpTWV0YWRhdGEucHJpdmFjeSA9IHtcbiAgICAgIG5ldHdvcms6IHtcIipcIjogc2V0dGluZ01ldGFkYXRhfSxcbiAgICAgIHNlcnZpY2VzOiB7XCIqXCI6IHNldHRpbmdNZXRhZGF0YX0sXG4gICAgICB3ZWJzaXRlczoge1wiKlwiOiBzZXR0aW5nTWV0YWRhdGF9LFxuICAgIH07XG5cbiAgICByZXR1cm4gd3JhcE9iamVjdChleHRlbnNpb25BUElzLCBzdGF0aWNXcmFwcGVycywgYXBpTWV0YWRhdGEpO1xuICB9O1xuXG4gIGlmICh0eXBlb2YgY2hyb21lICE9IFwib2JqZWN0XCIgfHwgIWNocm9tZSB8fCAhY2hyb21lLnJ1bnRpbWUgfHwgIWNocm9tZS5ydW50aW1lLmlkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVGhpcyBzY3JpcHQgc2hvdWxkIG9ubHkgYmUgbG9hZGVkIGluIGEgYnJvd3NlciBleHRlbnNpb24uXCIpO1xuICB9XG5cbiAgLy8gVGhlIGJ1aWxkIHByb2Nlc3MgYWRkcyBhIFVNRCB3cmFwcGVyIGFyb3VuZCB0aGlzIGZpbGUsIHdoaWNoIG1ha2VzIHRoZVxuICAvLyBgbW9kdWxlYCB2YXJpYWJsZSBhdmFpbGFibGUuXG4gIG1vZHVsZS5leHBvcnRzID0gd3JhcEFQSXMoY2hyb21lKTtcbn0gZWxzZSB7XG4gIG1vZHVsZS5leHBvcnRzID0gYnJvd3Nlcjtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5pbXBvcnQgYnJvd3NlciBmcm9tIFwid2ViZXh0ZW5zaW9uLXBvbHlmaWxsXCI7XG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5cbmNvbnN0IE1BWF9FUlJPUl9USFJFU0hPTEQgPSAzMDtcbmNvbnN0IE1BWF9RVUVVRURfRVZFTlRTID0gMjA7XG5jb25zdCBFVkVOVF9JTlRFUlZBTF9NUyA9IDEwMDtcblxubGV0IGVycm9yQ291bnQgPSAwO1xubGV0IGV2ZW50UHJvY2Vzc2luZ0ludGVydmFsID0gbnVsbDtcbmxldCBldmVudFF1ZXVlID0gW107XG5cbmZ1bmN0aW9uIGlzRXZlbnRUcnVzdGVkKGV2ZW50KSB7XG4gIHJldHVybiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZXZlbnQpID09PSBDdXN0b21FdmVudC5wcm90b3R5cGUgJiZcbiAgICAhT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwoZXZlbnQsIFwiZGV0YWlsXCIpO1xufVxuXG5hc3luYyBmdW5jdGlvbiBhbGxvd2xpc3REb21haW4oZXZlbnQpIHtcbiAgaWYgKCFpc0V2ZW50VHJ1c3RlZChldmVudCkpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIHJldHVybiBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICBicm93c2VyLnJ1bnRpbWUuc2VuZE1lc3NhZ2Uoe1xuICAgICAgdHlwZTogXCJld2U6YWxsb3dsaXN0LXBhZ2VcIixcbiAgICAgIHRpbWVzdGFtcDogZXZlbnQuZGV0YWlsLnRpbWVzdGFtcCxcbiAgICAgIHNpZ25hdHVyZTogZXZlbnQuZGV0YWlsLnNpZ25hdHVyZVxuICAgIH0pXG4gICk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NOZXh0RXZlbnQoKSB7XG4gIGxldCBldmVudCA9IGV2ZW50UXVldWUuc2hpZnQoKTtcbiAgaWYgKGV2ZW50KSB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBhbGxvd2xpc3RpbmdSZXN1bHQgPSBhd2FpdCBhbGxvd2xpc3REb21haW4oZXZlbnQpO1xuICAgICAgaWYgKGFsbG93bGlzdGluZ1Jlc3VsdCA9PT0gdHJ1ZSkge1xuICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudChcImRvbWFpbl9hbGxvd2xpc3Rpbmdfc3VjY2Vzc1wiKSk7XG4gICAgICAgIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRvbWFpbiBhbGxvd2xpc3RpbmcgcmVqZWN0ZWRcIik7XG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICBlcnJvckNvdW50Kys7XG4gICAgICBpZiAoZXJyb3JDb3VudCA+PSBNQVhfRVJST1JfVEhSRVNIT0xEKVxuICAgICAgICBzdG9wT25lQ2xpY2tBbGxvd2xpc3RpbmcoKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWV2ZW50UXVldWUubGVuZ3RoKVxuICAgIHN0b3BQcm9jZXNzaW5nSW50ZXJ2YWwoKTtcbn1cblxuZnVuY3Rpb24gb25Eb21haW5BbGxvd2xpc3RpbmdSZXF1ZXN0KGV2ZW50KSB7XG4gIGlmIChldmVudFF1ZXVlLmxlbmd0aCA+PSBNQVhfUVVFVUVEX0VWRU5UUylcbiAgICByZXR1cm47XG5cbiAgZXZlbnRRdWV1ZS5wdXNoKGV2ZW50KTtcbiAgc3RhcnRQcm9jZXNzaW5nSW50ZXJ2YWwoKTtcbn1cblxuZnVuY3Rpb24gc3RhcnRQcm9jZXNzaW5nSW50ZXJ2YWwoKSB7XG4gIGlmICghZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwpIHtcbiAgICBwcm9jZXNzTmV4dEV2ZW50KCk7XG4gICAgZXZlbnRQcm9jZXNzaW5nSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChwcm9jZXNzTmV4dEV2ZW50LCBFVkVOVF9JTlRFUlZBTF9NUyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc3RvcFByb2Nlc3NpbmdJbnRlcnZhbCgpIHtcbiAgY2xlYXJJbnRlcnZhbChldmVudFByb2Nlc3NpbmdJbnRlcnZhbCk7XG4gIGV2ZW50UHJvY2Vzc2luZ0ludGVydmFsID0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3BPbmVDbGlja0FsbG93bGlzdGluZygpIHtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImRvbWFpbl9hbGxvd2xpc3RpbmdfcmVxdWVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRG9tYWluQWxsb3dsaXN0aW5nUmVxdWVzdCwgdHJ1ZSk7XG4gIGV2ZW50UXVldWUgPSBbXTtcbiAgc3RvcFByb2Nlc3NpbmdJbnRlcnZhbCgpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRPbmVDbGlja0FsbG93bGlzdGluZygpIHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImRvbWFpbl9hbGxvd2xpc3RpbmdfcmVxdWVzdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uRG9tYWluQWxsb3dsaXN0aW5nUmVxdWVzdCwgdHJ1ZSk7XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2Vycm9ycy5qc1wiO1xuXG5sZXQgY29sbGFwc2VkU2VsZWN0b3JzID0gbmV3IFNldCgpO1xubGV0IG9ic2VydmVycyA9IG5ldyBXZWFrTWFwKCk7XG5cbmZ1bmN0aW9uIGdldFVSTEZyb21FbGVtZW50KGVsZW1lbnQpIHtcbiAgaWYgKGVsZW1lbnQubG9jYWxOYW1lID09IFwib2JqZWN0XCIpIHtcbiAgICBpZiAoZWxlbWVudC5kYXRhKVxuICAgICAgcmV0dXJuIGVsZW1lbnQuZGF0YTtcblxuICAgIGZvciAobGV0IGNoaWxkIG9mIGVsZW1lbnQuY2hpbGRyZW4pIHtcbiAgICAgIGlmIChjaGlsZC5sb2NhbE5hbWUgPT0gXCJwYXJhbVwiICYmIGNoaWxkLm5hbWUgPT0gXCJtb3ZpZVwiICYmIGNoaWxkLnZhbHVlKVxuICAgICAgICByZXR1cm4gbmV3IFVSTChjaGlsZC52YWx1ZSwgZG9jdW1lbnQuYmFzZVVSSSkuaHJlZjtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBlbGVtZW50LmN1cnJlbnRTcmMgfHwgZWxlbWVudC5zcmM7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdG9yRm9yQmxvY2tlZEVsZW1lbnQoZWxlbWVudCkge1xuICAvLyBTZXR0aW5nIHRoZSBcImRpc3BsYXlcIiBDU1MgcHJvcGVydHkgdG8gXCJub25lXCIgZG9lc24ndCBoYXZlIGFueSBlZmZlY3Qgb25cbiAgLy8gPGZyYW1lPiBlbGVtZW50cyAoaW4gZnJhbWVzZXRzKS4gU28gd2UgaGF2ZSB0byBoaWRlIGl0IGlubGluZSB0aHJvdWdoXG4gIC8vIHRoZSBcInZpc2liaWxpdHlcIiBDU1MgcHJvcGVydHkuXG4gIGlmIChlbGVtZW50LmxvY2FsTmFtZSA9PSBcImZyYW1lXCIpXG4gICAgcmV0dXJuIG51bGw7XG5cbiAgLy8gSWYgdGhlIDx2aWRlbz4gb3IgPGF1ZGlvPiBlbGVtZW50IGNvbnRhaW5zIGFueSA8c291cmNlPiBjaGlsZHJlbixcbiAgLy8gd2UgY2Fubm90IGFkZHJlc3MgaXQgaW4gQ1NTIGJ5IHRoZSBzb3VyY2UgVVJMOyBpbiB0aGF0IGNhc2Ugd2VcbiAgLy8gZG9uJ3QgXCJjb2xsYXBzZVwiIGl0IHVzaW5nIGEgQ1NTIHNlbGVjdG9yIGJ1dCByYXRoZXIgaGlkZSBpdCBkaXJlY3RseSBieVxuICAvLyBzZXR0aW5nIHRoZSBzdHlsZT1cIi4uLlwiIGF0dHJpYnV0ZS5cbiAgaWYgKGVsZW1lbnQubG9jYWxOYW1lID09IFwidmlkZW9cIiB8fCBlbGVtZW50LmxvY2FsTmFtZSA9PSBcImF1ZGlvXCIpIHtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiBlbGVtZW50LmNoaWxkcmVuKSB7XG4gICAgICBpZiAoY2hpbGQubG9jYWxOYW1lID09IFwic291cmNlXCIpXG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGxldCBzZWxlY3RvciA9IFwiXCI7XG4gIGZvciAobGV0IGF0dHIgb2YgW1wic3JjXCIsIFwic3Jjc2V0XCJdKSB7XG4gICAgbGV0IHZhbHVlID0gZWxlbWVudC5nZXRBdHRyaWJ1dGUoYXR0cik7XG4gICAgaWYgKHZhbHVlICYmIGF0dHIgaW4gZWxlbWVudClcbiAgICAgIHNlbGVjdG9yICs9IFwiW1wiICsgYXR0ciArIFwiPVwiICsgQ1NTLmVzY2FwZSh2YWx1ZSkgKyBcIl1cIjtcbiAgfVxuXG4gIHJldHVybiBzZWxlY3RvciA/IGVsZW1lbnQubG9jYWxOYW1lICsgc2VsZWN0b3IgOiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaGlkZUVsZW1lbnQoZWxlbWVudCwgcHJvcGVydGllcykge1xuICBsZXQge3N0eWxlfSA9IGVsZW1lbnQ7XG5cbiAgaWYgKCFwcm9wZXJ0aWVzKSB7XG4gICAgaWYgKGVsZW1lbnQubG9jYWxOYW1lID09IFwiZnJhbWVcIilcbiAgICAgIHByb3BlcnRpZXMgPSBbW1widmlzaWJpbGl0eVwiLCBcImhpZGRlblwiXV07XG4gICAgZWxzZVxuICAgICAgcHJvcGVydGllcyA9IFtbXCJkaXNwbGF5XCIsIFwibm9uZVwiXV07XG4gIH1cblxuICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgcHJvcGVydGllcylcbiAgICBzdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBcImltcG9ydGFudFwiKTtcblxuICBpZiAob2JzZXJ2ZXJzLmhhcyhlbGVtZW50KSlcbiAgICBvYnNlcnZlcnMuZ2V0KGVsZW1lbnQpLmRpc2Nvbm5lY3QoKTtcblxuICBsZXQgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcigoKSA9PiB7XG4gICAgZm9yIChsZXQgW2tleSwgdmFsdWVdIG9mIHByb3BlcnRpZXMpIHtcbiAgICAgIGlmIChzdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKGtleSkgIT0gdmFsdWUgfHxcbiAgICAgICAgICBzdHlsZS5nZXRQcm9wZXJ0eVByaW9yaXR5KGtleSkgIT0gXCJpbXBvcnRhbnRcIilcbiAgICAgICAgc3R5bGUuc2V0UHJvcGVydHkoa2V5LCB2YWx1ZSwgXCJpbXBvcnRhbnRcIik7XG4gICAgfVxuICB9KTtcbiAgb2JzZXJ2ZXIub2JzZXJ2ZShcbiAgICBlbGVtZW50LCB7XG4gICAgICBhdHRyaWJ1dGVzOiB0cnVlLFxuICAgICAgYXR0cmlidXRlRmlsdGVyOiBbXCJzdHlsZVwiXVxuICAgIH1cbiAgKTtcbiAgb2JzZXJ2ZXJzLnNldChlbGVtZW50LCBvYnNlcnZlcik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmhpZGVFbGVtZW50KGVsZW1lbnQpIHtcbiAgbGV0IG9ic2VydmVyID0gb2JzZXJ2ZXJzLmdldChlbGVtZW50KTtcbiAgaWYgKG9ic2VydmVyKSB7XG4gICAgb2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgIG9ic2VydmVycy5kZWxldGUoZWxlbWVudCk7XG4gIH1cblxuICBsZXQgcHJvcGVydHkgPSBlbGVtZW50LmxvY2FsTmFtZSA9PSBcImZyYW1lXCIgPyBcInZpc2liaWxpdHlcIiA6IFwiZGlzcGxheVwiO1xuICBlbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KHByb3BlcnR5KTtcbn1cblxuZnVuY3Rpb24gY29sbGFwc2VFbGVtZW50KGVsZW1lbnQpIHtcbiAgbGV0IHNlbGVjdG9yID0gZ2V0U2VsZWN0b3JGb3JCbG9ja2VkRWxlbWVudChlbGVtZW50KTtcbiAgaWYgKCFzZWxlY3Rvcikge1xuICAgIGhpZGVFbGVtZW50KGVsZW1lbnQpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICghY29sbGFwc2VkU2VsZWN0b3JzLmhhcyhzZWxlY3RvcikpIHtcbiAgICBpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcihcbiAgICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7XG4gICAgICAgIHR5cGU6IFwiZXdlOmluamVjdC1jc3NcIixcbiAgICAgICAgc2VsZWN0b3JcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb2xsYXBzZWRTZWxlY3RvcnMuYWRkKHNlbGVjdG9yKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoaWRlSW5BYm91dEJsYW5rRnJhbWVzKHNlbGVjdG9yLCB1cmxzKSB7XG4gIC8vIFJlc291cmNlcyAoZS5nLiBpbWFnZXMpIGxvYWRlZCBpbnRvIGFib3V0OmJsYW5rIGZyYW1lc1xuICAvLyBhcmUgKHNvbWV0aW1lcykgbG9hZGVkIHdpdGggdGhlIGZyYW1lSWQgb2YgdGhlIG1haW5fZnJhbWUuXG4gIGZvciAobGV0IGZyYW1lIG9mIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpZnJhbWVbc3JjPSdhYm91dDpibGFuayddXCIpKSB7XG4gICAgaWYgKCFmcmFtZS5jb250ZW50RG9jdW1lbnQpXG4gICAgICBjb250aW51ZTtcblxuICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZnJhbWUuY29udGVudERvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpKSB7XG4gICAgICAvLyBVc2UgaGlkZUVsZW1lbnQsIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB0aGUgY29ycmVjdCBmcmFtZUlkXG4gICAgICAvLyBmb3IgdGhlIFwiZXdlOmluamVjdC1jc3NcIiBtZXNzYWdlLlxuICAgICAgaWYgKHVybHMuaGFzKGdldFVSTEZyb21FbGVtZW50KGVsZW1lbnQpKSlcbiAgICAgICAgaGlkZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydEVsZW1lbnRDb2xsYXBzaW5nKCkge1xuICBsZXQgZGVmZXJyZWQgPSBudWxsO1xuXG4gIGJyb3dzZXIucnVudGltZS5vbk1lc3NhZ2UuYWRkTGlzdGVuZXIoKG1lc3NhZ2UsIHNlbmRlcikgPT4ge1xuICAgIGlmICghbWVzc2FnZSB8fCBtZXNzYWdlLnR5cGUgIT0gXCJld2U6Y29sbGFwc2VcIilcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGlmIChkb2N1bWVudC5yZWFkeVN0YXRlID09IFwibG9hZGluZ1wiKSB7XG4gICAgICBpZiAoIWRlZmVycmVkKSB7XG4gICAgICAgIGRlZmVycmVkID0gbmV3IE1hcCgpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgICAgICAgZm9yIChsZXQgW3NlbGVjdG9yLCB1cmxzXSBvZiBkZWZlcnJlZCkge1xuICAgICAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICBpZiAodXJscy5oYXMoZ2V0VVJMRnJvbUVsZW1lbnQoZWxlbWVudCkpKVxuICAgICAgICAgICAgICAgIGNvbGxhcHNlRWxlbWVudChlbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGlkZUluQWJvdXRCbGFua0ZyYW1lcyhzZWxlY3RvciwgdXJscyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZGVmZXJyZWQgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgbGV0IHVybHMgPSBkZWZlcnJlZC5nZXQobWVzc2FnZS5zZWxlY3RvcikgfHwgbmV3IFNldCgpO1xuICAgICAgZGVmZXJyZWQuc2V0KG1lc3NhZ2Uuc2VsZWN0b3IsIHVybHMpO1xuICAgICAgdXJscy5hZGQobWVzc2FnZS51cmwpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChtZXNzYWdlLnNlbGVjdG9yKSkge1xuICAgICAgICBpZiAoZ2V0VVJMRnJvbUVsZW1lbnQoZWxlbWVudCkgPT0gbWVzc2FnZS51cmwpXG4gICAgICAgICAgY29sbGFwc2VFbGVtZW50KGVsZW1lbnQpO1xuICAgICAgfVxuXG4gICAgICBoaWRlSW5BYm91dEJsYW5rRnJhbWVzKG1lc3NhZ2Uuc2VsZWN0b3IsIG5ldyBTZXQoW21lc3NhZ2UudXJsXSkpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSk7XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2Vycm9ycy5qc1wiO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudEhpZGluZ1RyYWNlciB7XG4gIGNvbnN0cnVjdG9yKHNlbGVjdG9ycykge1xuICAgIHRoaXMuc2VsZWN0b3JzID0gbmV3IE1hcChzZWxlY3RvcnMpO1xuXG4gICAgdGhpcy5vYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKCgpID0+IHtcbiAgICAgIHRoaXMub2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnRyYWNlKCksIDEwMDApO1xuICAgIH0pO1xuXG4gICAgaWYgKGRvY3VtZW50LnJlYWR5U3RhdGUgPT0gXCJsb2FkaW5nXCIpXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB0aGlzLnRyYWNlKCkpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMudHJhY2UoKTtcbiAgfVxuXG4gIGxvZyhmaWx0ZXJzLCBzZWxlY3RvcnMgPSBbXSkge1xuICAgIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZShcbiAgICAgIHt0eXBlOiBcImV3ZTp0cmFjZS1lbGVtLWhpZGVcIiwgZmlsdGVycywgc2VsZWN0b3JzfVxuICAgICkpO1xuICB9XG5cbiAgdHJhY2UoKSB7XG4gICAgbGV0IGZpbHRlcnMgPSBbXTtcbiAgICBsZXQgc2VsZWN0b3JzID0gW107XG5cbiAgICBmb3IgKGxldCBbc2VsZWN0b3IsIGZpbHRlcl0gb2YgdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgIGlmIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycy5kZWxldGUoc2VsZWN0b3IpO1xuICAgICAgICBpZiAoZmlsdGVyKVxuICAgICAgICAgIGZpbHRlcnMucHVzaChmaWx0ZXIpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgc2VsZWN0b3JzLnB1c2goc2VsZWN0b3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChmaWx0ZXJzLmxlbmd0aCA+IDAgfHwgc2VsZWN0b3JzLmxlbmd0aCA+IDApXG4gICAgICB0aGlzLmxvZyhmaWx0ZXJzLCBzZWxlY3RvcnMpO1xuXG4gICAgdGhpcy5vYnNlcnZlci5vYnNlcnZlKGRvY3VtZW50LCB7Y2hpbGRMaXN0OiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3VidHJlZTogdHJ1ZX0pO1xuICB9XG59XG4iLCIvKlxuICogVGhpcyBmaWxlIGlzIHBhcnQgb2YgZXllbydzIFdlYiBFeHRlbnNpb24gQWQgQmxvY2tpbmcgVG9vbGtpdCAoRVdFKSxcbiAqIENvcHlyaWdodCAoQykgMjAwNi1wcmVzZW50IGV5ZW8gR21iSFxuICpcbiAqIEVXRSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG4gKiBpdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIHZlcnNpb24gMyBhc1xuICogcHVibGlzaGVkIGJ5IHRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24uXG4gKlxuICogRVdFIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG4gKiBidXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuICogTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuICogR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBZb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuICogYWxvbmcgd2l0aCBFV0UuICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG4gKi9cblxuaW1wb3J0IGJyb3dzZXIgZnJvbSBcIndlYmV4dGVuc2lvbi1wb2x5ZmlsbFwiO1xuaW1wb3J0IHtpZ25vcmVOb0Nvbm5lY3Rpb25FcnJvcn0gZnJvbSBcIi4uL2Vycm9ycy5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gaGFuZGxlU3Vic2NyaWJlTGlua3MoKSB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBldmVudCA9PiB7XG4gICAgaWYgKGV2ZW50LmJ1dHRvbiA9PSAyIHx8ICFldmVudC5pc1RydXN0ZWQpXG4gICAgICByZXR1cm47XG5cbiAgICBsZXQgbGluayA9IGV2ZW50LnRhcmdldDtcbiAgICB3aGlsZSAoIShsaW5rIGluc3RhbmNlb2YgSFRNTEFuY2hvckVsZW1lbnQpKSB7XG4gICAgICBsaW5rID0gbGluay5wYXJlbnROb2RlO1xuXG4gICAgICBpZiAoIWxpbmspXG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcXVlcnlTdHJpbmcgPSBudWxsO1xuICAgIGlmIChsaW5rLnByb3RvY29sID09IFwiaHR0cDpcIiB8fCBsaW5rLnByb3RvY29sID09IFwiaHR0cHM6XCIpIHtcbiAgICAgIGlmIChsaW5rLmhvc3QgPT0gXCJzdWJzY3JpYmUuYWRibG9ja3BsdXMub3JnXCIgJiYgbGluay5wYXRobmFtZSA9PSBcIi9cIilcbiAgICAgICAgcXVlcnlTdHJpbmcgPSBsaW5rLnNlYXJjaC5zdWJzdHIoMSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gRmlyZWZveCBkb2Vzbid0IHNlZW0gdG8gcG9wdWxhdGUgdGhlIFwic2VhcmNoXCIgcHJvcGVydHkgZm9yXG4gICAgICAvLyBsaW5rcyB3aXRoIG5vbi1zdGFuZGFyZCBVUkwgc2NoZW1lcyBzbyB3ZSBuZWVkIHRvIGV4dHJhY3QgdGhlIHF1ZXJ5XG4gICAgICAvLyBzdHJpbmcgbWFudWFsbHkuXG4gICAgICBsZXQgbWF0Y2ggPSAvXmFicDpcXC8qc3Vic2NyaWJlXFwvKlxcPyguKikvaS5leGVjKGxpbmsuaHJlZik7XG4gICAgICBpZiAobWF0Y2gpXG4gICAgICAgIHF1ZXJ5U3RyaW5nID0gbWF0Y2hbMV07XG4gICAgfVxuXG4gICAgaWYgKCFxdWVyeVN0cmluZylcbiAgICAgIHJldHVybjtcblxuICAgIGxldCB0aXRsZSA9IG51bGw7XG4gICAgbGV0IHVybCA9IG51bGw7XG4gICAgZm9yIChsZXQgcGFyYW0gb2YgcXVlcnlTdHJpbmcuc3BsaXQoXCImXCIpKSB7XG4gICAgICBsZXQgcGFydHMgPSBwYXJhbS5zcGxpdChcIj1cIiwgMik7XG4gICAgICBpZiAocGFydHMubGVuZ3RoICE9IDIgfHwgIS9cXFMvLnRlc3QocGFydHNbMV0pKVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIHN3aXRjaCAocGFydHNbMF0pIHtcbiAgICAgICAgY2FzZSBcInRpdGxlXCI6XG4gICAgICAgICAgdGl0bGUgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibG9jYXRpb25cIjpcbiAgICAgICAgICB1cmwgPSBkZWNvZGVVUklDb21wb25lbnQocGFydHNbMV0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoIXVybClcbiAgICAgIHJldHVybjtcblxuICAgIGlmICghdGl0bGUpXG4gICAgICB0aXRsZSA9IHVybDtcblxuICAgIHRpdGxlID0gdGl0bGUudHJpbSgpO1xuICAgIHVybCA9IHVybC50cmltKCk7XG4gICAgaWYgKCEvXihodHRwcz98ZnRwKTovLnRlc3QodXJsKSlcbiAgICAgIHJldHVybjtcblxuICAgIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgICAgYnJvd3Nlci5ydW50aW1lLnNlbmRNZXNzYWdlKHt0eXBlOiBcImV3ZTpzdWJzY3JpYmUtbGluay1jbGlja2VkXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlLCB1cmx9KVxuICAgICk7XG5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICB9LCB0cnVlKTtcbn1cbiIsIi8qXG4gKiBUaGlzIGZpbGUgaXMgcGFydCBvZiBleWVvJ3MgV2ViIEV4dGVuc2lvbiBBZCBCbG9ja2luZyBUb29sa2l0IChFV0UpLFxuICogQ29weXJpZ2h0IChDKSAyMDA2LXByZXNlbnQgZXllbyBHbWJIXG4gKlxuICogRVdFIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbiAqIGl0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgdmVyc2lvbiAzIGFzXG4gKiBwdWJsaXNoZWQgYnkgdGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbi5cbiAqXG4gKiBFV0UgaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbiAqIGJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG4gKiBNRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG4gKiBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuICpcbiAqIFlvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG4gKiBhbG9uZyB3aXRoIEVXRS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cbiAqL1xuXG5jb25zdCBFUlJPUl9OT19DT05ORUNUSU9OID0gXCJDb3VsZCBub3QgZXN0YWJsaXNoIGNvbm5lY3Rpb24uIFwiICtcbiAgICAgIFwiUmVjZWl2aW5nIGVuZCBkb2VzIG5vdCBleGlzdC5cIjtcbmNvbnN0IEVSUk9SX0NMT1NFRF9DT05ORUNUSU9OID0gXCJBIGxpc3RlbmVyIGluZGljYXRlZCBhbiBhc3luY2hyb25vdXMgXCIgK1xuICAgICAgXCJyZXNwb25zZSBieSByZXR1cm5pbmcgdHJ1ZSwgYnV0IHRoZSBtZXNzYWdlIGNoYW5uZWwgY2xvc2VkIGJlZm9yZSBhIFwiICtcbiAgICAgIFwicmVzcG9uc2Ugd2FzIHJlY2VpdmVkXCI7XG5cbmV4cG9ydCBjb25zdCBFUlJPUl9EVVBMSUNBVEVfRklMVEVSUyA9IFwic3RvcmFnZV9kdXBsaWNhdGVfZmlsdGVyc1wiO1xuZXhwb3J0IGNvbnN0IEVSUk9SX0ZJTFRFUl9OT1RfRk9VTkQgPSBcImZpbHRlcl9ub3RfZm91bmRcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKHByb21pc2UpIHtcbiAgcmV0dXJuIHByb21pc2UuY2F0Y2goZXJyb3IgPT4ge1xuICAgIGlmICh0eXBlb2YgZXJyb3IgPT0gXCJvYmplY3RcIiAmJlxuICAgICAgICAoZXJyb3IubWVzc2FnZSA9PSBFUlJPUl9OT19DT05ORUNUSU9OIHx8XG4gICAgICAgICBlcnJvci5tZXNzYWdlID09IEVSUk9SX0NMT1NFRF9DT05ORUNUSU9OKSlcbiAgICAgIHJldHVybjtcblxuICAgIHRocm93IGVycm9yO1xuICB9KTtcbn1cbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLypcbiAqIFRoaXMgZmlsZSBpcyBwYXJ0IG9mIGV5ZW8ncyBXZWIgRXh0ZW5zaW9uIEFkIEJsb2NraW5nIFRvb2xraXQgKEVXRSksXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDYtcHJlc2VudCBleWVvIEdtYkhcbiAqXG4gKiBFV0UgaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuICogaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSB2ZXJzaW9uIDMgYXNcbiAqIHB1Ymxpc2hlZCBieSB0aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLlxuICpcbiAqIEVXRSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuICogYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2ZcbiAqIE1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbiAqIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG4gKlxuICogWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbiAqIGFsb25nIHdpdGggRVdFLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuICovXG5cbmltcG9ydCBicm93c2VyIGZyb20gXCJ3ZWJleHRlbnNpb24tcG9seWZpbGxcIjtcblxuaW1wb3J0IHtFbGVtSGlkZUVtdWxhdGlvbn1cbiAgZnJvbSBcImFkYmxvY2twbHVzY29yZS9saWIvY29udGVudC9lbGVtSGlkZUVtdWxhdGlvbi5qc1wiO1xuXG5pbXBvcnQge2lnbm9yZU5vQ29ubmVjdGlvbkVycm9yfSBmcm9tIFwiLi4vZXJyb3JzLmpzXCI7XG5pbXBvcnQge3N0YXJ0RWxlbWVudENvbGxhcHNpbmcsIGhpZGVFbGVtZW50LCB1bmhpZGVFbGVtZW50fVxuICBmcm9tIFwiLi9lbGVtZW50LWNvbGxhcHNpbmcuanNcIjtcbmltcG9ydCB7c3RhcnRPbmVDbGlja0FsbG93bGlzdGluZ30gZnJvbSBcIi4vYWxsb3dsaXN0aW5nLmpzXCI7XG5pbXBvcnQge0VsZW1lbnRIaWRpbmdUcmFjZXJ9IGZyb20gXCIuL2VsZW1lbnQtaGlkaW5nLXRyYWNlci5qc1wiO1xuaW1wb3J0IHtoYW5kbGVTdWJzY3JpYmVMaW5rc30gZnJvbSBcIi4vc3Vic2NyaWJlLWxpbmtzLmpzXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIGluaXRDb250ZW50RmVhdHVyZXMoKSB7XG4gIGxldCByZXNwb25zZSA9IGF3YWl0IGlnbm9yZU5vQ29ubmVjdGlvbkVycm9yKFxuICAgIGJyb3dzZXIucnVudGltZS5zZW5kTWVzc2FnZSh7dHlwZTogXCJld2U6Y29udGVudC1oZWxsb1wifSlcbiAgKTtcblxuICBpZiAoIXJlc3BvbnNlKVxuICAgIHJldHVybjtcblxuICBsZXQgdHJhY2VyO1xuICBpZiAocmVzcG9uc2UudHJhY2VkU2VsZWN0b3JzKVxuICAgIHRyYWNlciA9IG5ldyBFbGVtZW50SGlkaW5nVHJhY2VyKHJlc3BvbnNlLnRyYWNlZFNlbGVjdG9ycyk7XG5cbiAgaWYgKHJlc3BvbnNlLmVtdWxhdGVkUGF0dGVybnMubGVuZ3RoID4gMCkge1xuICAgIGxldCBlbGVtSGlkZUVtdWxhdGlvbiA9IG5ldyBFbGVtSGlkZUVtdWxhdGlvbigoZWxlbWVudHMsIGZpbHRlcnMpID0+IHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXG4gICAgICAgIGhpZGVFbGVtZW50KGVsZW1lbnQsIHJlc3BvbnNlLmNzc1Byb3BlcnRpZXMpO1xuXG4gICAgICBpZiAodHJhY2VyKVxuICAgICAgICB0cmFjZXIubG9nKGZpbHRlcnMpO1xuICAgIH0sIGVsZW1lbnRzID0+IHtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgZWxlbWVudHMpXG4gICAgICAgIHVuaGlkZUVsZW1lbnQoZWxlbWVudCk7XG4gICAgfSk7XG4gICAgZWxlbUhpZGVFbXVsYXRpb24uYXBwbHkocmVzcG9uc2UuZW11bGF0ZWRQYXR0ZXJucyk7XG4gIH1cblxuICBpZiAocmVzcG9uc2Uuc3Vic2NyaWJlTGlua3MpXG4gICAgaGFuZGxlU3Vic2NyaWJlTGlua3MoKTtcbn1cblxuc3RhcnRFbGVtZW50Q29sbGFwc2luZygpO1xuc3RhcnRPbmVDbGlja0FsbG93bGlzdGluZygpO1xuaW5pdENvbnRlbnRGZWF0dXJlcygpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==