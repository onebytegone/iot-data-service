#!/usr/bin/env node
'use strict';

const _ = require('underscore'),
      minimist = require('minimist'),
      JWT = require('jwt-simple'),
      moment = require('moment'),
      yaml = require('js-yaml'),
      uuid = require('uuid/v4'),
      fs = require('fs'),
      util = require('util'),
      path = require('path'),
      argv = minimist(process.argv.slice(2), { string: [ 'stage' ] });

let argsValid = true;

if (_.isEmpty(argv.stage)) {
   argsValid = false;
}

if (!argsValid) {
   // TODO: add help
   process.exit(1);
}

util.promisify(fs.readFile)(path.resolve(__dirname, '..', 'vars', `${argv.stage}.yml`))
   .then(function(fileContents) {
      const vars = yaml.safeLoad(fileContents),
            secret = vars.jwtSigningSecret,
            now = moment().unix();

      const content = {
         jti: uuid(),
         iss: `IOTDS:${argv.stage}`,
         iat: now,
         nbf: now,
         // exp: exp.unix(), // TODO: determine what to do for this
         // TODO: tighten permissions for allowed methods and feeds
         iotds: {
            read: {
               '*': [ '*' ],
            },
            write: {
               '*': [ '*' ],
            },
         },
      };

      console.log(`JWT Payload: ${JSON.stringify(content, null, 3)}`);

      const jwt = JWT.encode(content, secret, 'HS256');

      console.log(`Generated JWT:\n${jwt}`);
   })
   .catch(console.error);
