import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { AsyncEvent, InitAsyncEvent } from './async-event';

/**
 * An AsyncEventSubject is a BehaviorSubject with helper methods.
 * It is intended to be manipulated and own by services, and returned
 * to views as AsyncEventObservables.
 */
export class AsyncEventSubject<TArgument, TValue> extends BehaviorSubject<AsyncEvent<TArgument, TValue>> {

  /**
   * Creates an AsyncEventSubject by following a promise life cycle.
   */
  public static execute<TArgument, TValue>(argument: TArgument, promise: (argument: TArgument) => Promise<TValue>) {
      const subject = new AsyncEventSubject<TArgument, TValue>();
      subject.execute(argument, promise);
      return subject;
  }

  constructor() {
    super(InitAsyncEvent as AsyncEvent<TArgument, TValue>);
  }

  /** Emits an event with the init state. */
  public init() {
    super.next(InitAsyncEvent as AsyncEvent<TArgument, TValue>);
  }

  /** Emits an event with the loading state. */
  public loading(argument?: TArgument) {
    super.next(new AsyncEvent<TArgument, TValue>('loading', { argument }));
  }

  /** Emits an event with the loaded state. */
  public loaded(argument?: TArgument, value?: TValue) {
    super.next(new AsyncEvent<TArgument, TValue>('loaded', { argument, value }));
  }

  /**
   * Emits an event with the error state.
   * Do not mix it with error, which puts the Subject itself on error.
   */
  public managedError(argument?: TArgument, error?: Error) {
    super.next(new AsyncEvent<TArgument, TValue>('error', { argument, error }));
  }

  /**
   * Manages the execution life cycle of a Promise.
   * loading => loaded | error;
   */
  public execute(argument: TArgument, promise: (argument: TArgument) => Promise<TValue>) {
    this.loading(argument);
    promise(argument)
      .then(
        (value) => this.loaded(argument, value),
        (error) => this.managedError(argument, error));
  }

  /**
   * Manages the observance life cycle of an Observable.
   * loading => (loaded | error)*;
   * Returns the subscription.
   */
  public observe(argument: TArgument, observable: Observable<TValue>) {
    this.loading(argument);
    return observable.subscribe(
      (value) => this.loaded(argument, value),
      (error) => this.managedError(argument, error));
  }
}
