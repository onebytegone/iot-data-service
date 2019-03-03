import { handler } from '../src/FeedHandler';
import { expect } from 'chai';


describe('FeedHandler', function() {

   it('returns a handler function', function() {
      expect(handler).to.be.a('function');
   });

});
