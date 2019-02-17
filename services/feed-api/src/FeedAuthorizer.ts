import _ from 'underscore';
import JWT from 'jwt-simple';
import minimatch from 'minimatch';

const pathToRegexp = require('path-to-regexp'),
      PERMISSION_NAMESPACE = 'iotds';

export default class FeedAuthorizer {

   public constructor(
      private _jwtSigningSecret: string = process.env.JWT_SIGNING_SECRET as string
   ) { }

   public authorize(event: APIGatewayAuthorizerEvent): Promise<object> {
      if (event.type !== 'TOKEN') {
         console.log(`AUTH_FAILURE Unsupported authorizer event ${event.type}`);
         return Promise.reject('Unauthorized');
      }

      const resource = this._parseMethodArn(event.methodArn, 'feed');

      if (!resource) {
         console.log(`AUTH_FAILURE Could not parse methodArd ${event.methodArn}`);
         return Promise.reject('Unauthorized');
      }

      const authTokenParts = event.authorizationToken.match(/([\w]+) (.+$)/);

      if (!authTokenParts || _.isEmpty(authTokenParts)) {
         console.log(`AUTH_FAILURE Could not parse auth token ${event.authorizationToken}`);
         return Promise.reject('Unauthorized');
      }

      const authToken = authTokenParts[2];

      let parsedJWT;

      try {
         parsedJWT = JWT.decode(authToken, this._jwtSigningSecret, false, 'HS256');
      } catch(e) {
         console.log(`AUTH_FAILURE Could not decode auth token ${authToken} ${e}`);
         return Promise.reject('Unauthorized');
      }

      const authorizationResults = this._isAuthorized(resource, parsedJWT);

      if (!authorizationResults.authorized) {
         console.log(
            `AUTH_FAILURE Authorization failed: ${authorizationResults.reason}`
            + ` ${JSON.stringify(resource)} ${JSON.stringify(parsedJWT)}`
         );
         return Promise.reject('Unauthorized');
      }

      return Promise.resolve(this._generatePolicy(parsedJWT.sub, 'allow', event.methodArn));
   }

   protected _isAuthorized(resource: APIGatewayResource, jwt: any): { authorized: boolean; reason?: string } {
      if (resource.method !== 'GET' && resource.method !== 'POST') {
         return { authorized: false, reason: 'Unsupported method' };
      }

      // TODO: validate iss

      const operationMode = (resource.method === 'GET' ? 'read' : 'write');

      if (!_.has(jwt, PERMISSION_NAMESPACE)) {
         return { authorized: false, reason: `Missing '${PERMISSION_NAMESPACE}' data` };
      }

      const tokenPermissions = jwt[PERMISSION_NAMESPACE];

      if (!_.has(tokenPermissions, operationMode)) {
         return { authorized: false, reason: 'Mode not permitted' };
      }

      const pathParts = pathToRegexp(':feed/:facet').exec(resource.resourcePath);

      if (!pathParts) {
         return { authorized: false, reason: 'Unknown resource path' };
      }

      const feed = pathParts[1].toLowerCase(),
            facet = pathParts[2].toLowerCase();

      const permsForOperation = tokenPermissions[operationMode],
            allowedFeedPatterns = _.keys(permsForOperation),
            matchingFeedPattern = _.find(allowedFeedPatterns, (pattern) => minimatch(feed, pattern));

      if (!matchingFeedPattern) {
         return { authorized: false, reason: 'Feed not permitted' };
      }

      const allowedFacetPatterns = permsForOperation[matchingFeedPattern] as string[],
            matchingFacetPattern = _.find(allowedFacetPatterns, (pattern) => minimatch(facet, pattern));

      if (!matchingFacetPattern) {
         return { authorized: false, reason: 'Facet not permitted' };
      }

      return { authorized: true };
   }

   protected _parseMethodArn(arn: string, basePath: string): APIGatewayResource | null {
      // arn:aws:execute-api:<region>:<accountId>:<apiId>/<stage>/<method>/<resourcePath>
      // Source: https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-input.html
      const parts = arn.match(/arn:aws:execute-api:([^:]+):([^:]+):([^/]+?)\/([^/]+?)\/([^/]+?)\/(.*$)/);

      if (!parts || _.isEmpty(parts)) {
         return null;
      }

      return {
         regionID: parts[1],
         accountID: parts[2],
         apiID: parts[3],
         stage: parts[4],
         method: parts[5].toUpperCase(),
         resourcePath: parts[6].replace(new RegExp(`^${basePath}/`), ''),
      };
   }

   protected _generatePolicy(principalId: string, effect: string, resource: string): object {
      return {
         principalId: principalId,
         policyDocument: {
            Version: '2012-10-17',
            Statement: [
               {
                  Action: 'execute-api:Invoke',
                  Effect: effect,
                  Resource: resource,
               },
            ],
         },
      };
   }

}
