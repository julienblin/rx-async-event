import { Observable } from 'rxjs';
import { AsyncEvent } from './async-event';

/** An AsyncEventObservable is simply an Observable of AsyncEvent :-) */
export type AsyncEventObservable<TArgument, TResult> = Observable<AsyncEvent<TArgument, TResult>>;
