var fs = require('fs');
var htmlencode = require('htmlencode').htmlEncode;

var LABS = function() {};

LABS.addToHead = function(params) {
  return '<link href="/acos-server/static/labs/labs.css" rel="stylesheet">\n' +
    '<script src="/acos-server/static/labs/jquery.min.js" type="text/javascript"></script>\n' +
    '<script src="/acos-server/static/labs/labs.js" type="text/javascript"></script>\n';
};

LABS.addToBody = function(params, handlers, req) {
  return '<div class="labs-activity' + '" data-id="' + htmlencode(params.name) + '"></div>';
};

LABS.initialize = function(req, params, handlers, cb) {

  // Initialize the content type
  params.headContent += LABS.addToHead(params);
  params.bodyContent += LABS.addToBody(params, handlers, req);

  // Initialize the content package
  handlers.contentPackages[req.params.contentPackage].initialize(req, params, handlers, function() {
    cb();
  });
};

LABS.handleEvent = function(event, payload, req, res, protocolPayload, responseObj, cb) {
  if (event == 'log') {
    var dir = JSVEE.config.logDirectory + '/labs/' + req.params.contentPackage;
    fs.mkdir(dir, 0o775, function(err) {
      var name = payload.animationId.replace(/\.|\/|\\|~/g, "-") + '.log';
      var data = new Date().toISOString() + ' ' + payload.logId + ' ' + JSON.stringify(payload.log) + ' ' + JSON.stringify(protocolPayload || {}) + '\n';
      fs.writeFile(dir + '/' + name, data, { flag: 'a' }, function(err) {
        cb(event, payload, req, res, protocolPayload, responseObj);
      });
    });
  } else {
    cb(event, payload, req, res, protocolPayload, responseObj);
  }
};

LABS.register = function(handlers, app, conf) {
  handlers.contentTypes.labs = LABS;
  fs.mkdir(conf.logDirectory + '/labs', 0o775, function(err) {});
  LABS.config = conf;
};

LABS.namespace = 'labs';
LABS.installedContentPackages = [];
LABS.packageType = 'content-type';

LABS.meta = {
  'name': 'labs',
  'shortDescription': 'Content type for lab exercises.',
  'description': '',
  'author': 'Kamil Akhuseyinoglu',
  'license': 'MIT',
  'version': '0.1',
  'url': ''
};

module.exports = LABS;
