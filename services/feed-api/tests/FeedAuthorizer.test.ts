import Authorizer from '../src/FeedAuthorizer';
import { expect } from 'chai';
import _ from 'underscore';

class TestAuthorizer extends Authorizer {

   public _parseMethodArn(arn: string, basePath: string): APIGatewayResource | null {
      return super._parseMethodArn(arn, basePath);
   }

   public _isAuthorized(resource: APIGatewayResource, jwt: any): { authorized: boolean; reason?: string } {
      return super._isAuthorized(resource, jwt);
   }

}

describe('FeedAuthorizer', () => {

   // TODO: Flush out tests

   describe('_parseMethodArn', () => {
      const authorizer = new TestAuthorizer();

      it('returns null for improperly formatted ARNs', () => {
         expect(authorizer._parseMethodArn('bad-arn', '')).to.strictlyEqual(null);
      });

      it('returns parsed results for properly formatted ARNs', () => {
         const arn = 'arn:aws:execute-api:us-east-1:123456789012:apiId/stage/GET/resource/path';

         expect(authorizer._parseMethodArn(arn, '')).to.eql({
            regionID: 'us-east-1',
            accountID: '123456789012',
            apiID: 'apiId',
            stage: 'stage',
            method: 'GET',
            resourcePath: 'resource/path',
         });
      });

      it('removes the provided base path', () => {
         const arn = 'arn:aws:execute-api:us-east-1:123456789012:apiId/stage/GET/resource/path/subitem';

         expect(authorizer._parseMethodArn(arn, 'resource')).to.eql({
            regionID: 'us-east-1',
            accountID: '123456789012',
            apiID: 'apiId',
            stage: 'stage',
            method: 'GET',
            resourcePath: 'path/subitem',
         });
      });

   });

   describe('_isAuthorized', () => {
      const test = (resourceOverrides: object, jwt: any, expected: object): void => {
         const authorizer = new TestAuthorizer();

         const resource = _.extend({
            regionID: 'us-east-1',
            accountID: '123456789012',
            apiID: 'apiId',
            stage: 'stage',
            method: 'GET',
            resourcePath: 'feed/facet',
         }, resourceOverrides);

         expect(authorizer._isAuthorized(resource, jwt)).to.eql(expected);
      };

      it('rejects requests using an unsupported method', () => {
         test({ method: 'PUT' }, {}, { authorized: false, reason: 'Unsupported method' });
         test({ method: 'OPTIONS' }, {}, { authorized: false, reason: 'Unsupported method' });
         test({ method: 'HEAD' }, {}, { authorized: false, reason: 'Unsupported method' });
         test({ method: 'TACOS' }, {}, { authorized: false, reason: 'Unsupported method' });
      });

      it('rejects requests using a token missing iotds data', () => {
         test({}, {}, { authorized: false, reason: 'Missing \'iotds\' data' });
      });

      it('rejects requests using a mode that is not permitted', () => {
         test(
            { method: 'GET' },
            { iotds: {} },
            { authorized: false, reason: 'Mode not permitted' }
         );
         test(
            { method: 'POST' },
            { iotds: {} },
            { authorized: false, reason: 'Mode not permitted' }
         );
         test(
            { method: 'GET' },
            { iotds: { write: {} } },
            { authorized: false, reason: 'Mode not permitted' }
         );
         test(
            { method: 'POST' },
            { iotds: { read: {} } },
            { authorized: false, reason: 'Mode not permitted' }
         );
      });

      it('rejects requests for an unknown resource path', () => {
         test(
            { resourcePath: '' },
            { iotds: { read: { '*': [ '*' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Unknown resource path' }
         );
         test(
            { resourcePath: '/' },
            { iotds: { read: { '*': [ '*' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Unknown resource path' }
         );
         test(
            { resourcePath: '///' },
            { iotds: { read: { '*': [ '*' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Unknown resource path' }
         );
         test(
            { resourcePath: 'feed123' },
            { iotds: { read: { '*': [ '*' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Unknown resource path' }
         );
         test(
            { resourcePath: 'feed123/facet987/subfacet987' },
            { iotds: { read: { '*': [ '*' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Unknown resource path' }
         );
      });

      it('rejects requests for a feed that is not permitted', () => {
         test(
            { resourcePath: 'feed123/facet987' },
            { iotds: { read: { feed321: [ '*' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Feed not permitted' }
         );
      });

      it('rejects requests for a facet that is not permitted', () => {
         test(
            { resourcePath: 'feed123/facet987' },
            { iotds: { read: { 'feed*': [ 'facet789' ] }, write: { '*': [ '*' ] } } },
            { authorized: false, reason: 'Facet not permitted' },
         );
      });

      it('permits valid read request', () => {
         test(
            { resourcePath: 'feed123/facet987' },
            { iotds: { read: { 'feed*': [ '*' ] } } },
            { authorized: true },
         );
         test(
            { resourcePath: 'feed123/facet987' },
            { iotds: { read: { 'feed123': [ 'facet987' ] } } },
            { authorized: true },
         );
      });

      it('permits valid write request', () => {
         test(
            { method: 'POST', resourcePath: 'feed123/facet987' },
            { iotds: { write: { 'feed*': [ '*' ] } } },
            { authorized: true },
         );
         test(
            { method: 'POST', resourcePath: 'feed123/facet987' },
            { iotds: { write: { 'feed123': [ 'facet987' ] } } },
            { authorized: true },
         );
      });

   });

});
