import roundMomentToInterval from '../../src/lib/roundMomentToInterval';
import { expect } from 'chai';


describe('roundMomentToInterval', () => {

   it('rounds to the nearest 15 minutes', () => {
      expect(roundMomentToInterval('2019-01-01T12:00:00.000Z', 15, 'm').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
         .to
         .strictlyEqual('2019-01-01T12:00:00.000Z');
      expect(roundMomentToInterval('2019-01-01T12:04:04.000Z', 15, 'm').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
         .to
         .strictlyEqual('2019-01-01T12:00:00.000Z');
      expect(roundMomentToInterval('2019-01-01T12:15:01.000Z', 15, 'm').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
         .to
         .strictlyEqual('2019-01-01T12:15:00.000Z');
      expect(roundMomentToInterval('2019-01-01T12:29:59.000Z', 15, 'm').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
         .to
         .strictlyEqual('2019-01-01T12:15:00.000Z');
      expect(roundMomentToInterval('2019-01-01T12:59:01.000Z', 15, 'm').utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'))
         .to
         .strictlyEqual('2019-01-01T12:45:00.000Z');
   });

});
