import { Observable } from 'rxjs/Observable';
import { AsyncEvent } from './async-event';

/** An AsyncEventObservable is simply an Observable of AsyncEvent :-) */
export type AsyncEventObservable<TArgument, TValue> = Observable<AsyncEvent<TArgument, TValue>>;
