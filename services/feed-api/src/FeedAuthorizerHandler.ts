import { Context, Callback } from 'aws-lambda';
import Authorizer from './FeedAuthorizer';

export function handler(evt: any, _context: Context, cb: Callback): void {
   const authorizer = new Authorizer();

   authorizer.authorize(evt)
      .then(function(v) {
         return cb(undefined, v);
      })
      .catch(function(err) {
         if (err !== 'Unauthorized') {
            // eslint-disable-next-line no-console
            console.log('ERROR:', err, err.stack);
         }
         cb(err);
      });
}
