/** @typedef {{
 * styleElement: function(!HTMLElement),
 * styleSubtree: function(!HTMLElement, Object<string, string>=),
 * prepareTemplate: function(!HTMLTemplateElement, string, string=),
 * prepareTemplateStyles: function(!HTMLTemplateElement, string, string=),
 * prepareTemplateDom: function(!HTMLTemplateElement, string),
 * styleDocument: function(Object<string, string>=),
 * flushCustomStyles: function(),
 * getComputedStyleValue: function(!Element, string): string,
 * ScopingShim: (Object|undefined),
 * ApplyShim: (Object|undefined),
 * CustomStyleInterface: (Object|undefined),
 * nativeCss: boolean,
 * nativeShadow: boolean,
 * }}
 */
let ShadyCSSInterface; //eslint-disable-line no-unused-vars

/**
 * @typedef {{
 * shimcssproperties: (boolean | undefined),
 * shimshadow: (boolean | undefined)
 * }}
 */
let ShadyCSSOptions; //eslint-disable-line no-unused-vars

/** @type {(ShadyCSSInterface | ShadyCSSOptions | undefined)} */
window.ShadyCSS;