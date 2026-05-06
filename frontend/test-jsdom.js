const { JSDOM } = require('jsdom');
const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="root"></div></body></html>`);
console.log('JSDOM works');
