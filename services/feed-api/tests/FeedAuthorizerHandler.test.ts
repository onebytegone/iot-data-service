import { handler } from '../src/FeedAuthorizerHandler';
import { expect } from 'chai';

describe('FeedAuthorizerHandler', function() {

   it('returns a handler function', function() {
      expect(handler).to.be.a('function');
   });

});
