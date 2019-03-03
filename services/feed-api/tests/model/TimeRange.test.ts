import TimeRange from '../../src/model/TimeRange';
import { expect } from 'chai';
import sinon from 'sinon';

describe('TimeRange', () => {
   let clock: sinon.SinonFakeTimers;

   beforeEach(() => {
      clock = sinon.useFakeTimers(new Date('2019-02-01T12:00:00.000Z'));
   });

   afterEach(() => {
      clock.restore();
   });

   describe('getStartAsISO8061', () => {

      it('returns the same date as was passed in', () => {
         const range = new TimeRange('2019-01-01T12:00:00.000Z');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2019-01-01T12:00:00.000Z');
      });

      it('returns UTC, even when different timezone was passed in', () => {
         const range = new TimeRange('2019-01-01T07:00:00.000-0500');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2019-01-01T12:00:00.000Z');
      });

      it('expands to full date, even partial datetime was passed in', () => {
         const range = new TimeRange('2019-01-01T00:00:00Z');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2019-01-01T00:00:00.000Z');
      });

      it('calculates a relative date in minutes to the end date', () => {
         const range = new TimeRange('-5m', '2019-01-01T01:00:00Z');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2019-01-01T00:55:00.000Z');
      });

      it('calculates a relative date in hours to the end date', () => {
         const range = new TimeRange('-5h', '2019-01-01T10:00:00Z');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2019-01-01T05:00:00.000Z');
      });

      it('calculates a relative date in days to the end date', () => {
         const range = new TimeRange('-1d', '2019-01-01T01:00:00Z');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2018-12-31T01:00:00.000Z');
      });

      it('calculates a relative date to "now"', () => {
         let range = new TimeRange('-5m');

         expect(range.getStartAsISO8061()).to.strictlyEqual('2019-02-01T11:55:00.000Z');
         expect(range.getEndAsISO8061()).to.strictlyEqual('2019-02-01T12:00:00.000Z');
      });

   });

   describe('getEndAsISO8061', () => {

      it('defaults to object creation if no end date was passed in', () => {
         const range = new TimeRange('2018-12-01T12:00:00.000Z');

         clock.tick(1000);
         expect(range.getEndAsISO8061()).to.strictlyEqual('2019-02-01T12:00:00.000Z');
      });

      it('returns the same date as was passed in', () => {
         const range = new TimeRange('2018-12-01T12:00:00.000Z', '2019-01-01T12:00:00.000Z');

         expect(range.getEndAsISO8061()).to.strictlyEqual('2019-01-01T12:00:00.000Z');
      });

      it('returns UTC, even when different timezone was passed in', () => {
         const range = new TimeRange('2018-12-01T12:00:00.000Z', '2019-01-01T07:00:00.000-0500');

         expect(range.getEndAsISO8061()).to.strictlyEqual('2019-01-01T12:00:00.000Z');
      });

      it('expands to full date, even partial date was passed in', () => {
         const range = new TimeRange('2018-12-01T12:00:00.000Z', '2019-01-01T00:00:00Z');

         expect(range.getEndAsISO8061()).to.strictlyEqual('2019-01-01T00:00:00.000Z');
      });

   });

});
