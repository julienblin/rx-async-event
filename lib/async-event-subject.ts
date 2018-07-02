import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { AsyncEvent, InitAsyncEvent } from './async-event';

/**
 * An AsyncEventSubject is a BehaviorSubject with helper methods.
 * It is intended to be manipulated and own by services, and returned
 * to views as AsyncEventObservables.
 */
export class AsyncEventSubject<TArgument, TResult> extends BehaviorSubject<AsyncEvent<TArgument, TResult>> {

  /**
   * Creates an AsyncEventSubject by following a promise life cycle.
   */
  public static execute<TArgument, TResult>(argument: TArgument, promise: (argument: TArgument) => Promise<TResult>) {
      const subject = new AsyncEventSubject<TArgument, TResult>();
      subject.execute(argument, promise);
      return subject;
  }

  constructor() {
    super(InitAsyncEvent as AsyncEvent<TArgument, TResult>);
  }

  /** Emits an event with the init state. */
  public init() {
    super.next(InitAsyncEvent as AsyncEvent<TArgument, TResult>);
  }

  /** Emits an event with the processing state. */
  public processing(argument?: TArgument, result?: TResult) {
    super.next(new AsyncEvent<TArgument, TResult>('processing', { argument, result }));
  }

  /** Emits an event with the processed state. */
  public processed(argument?: TArgument, result?: TResult) {
    super.next(new AsyncEvent<TArgument, TResult>('processed', { argument, result }));
  }

  /**
   * Emits an event with the error state.
   * Do not confuse with error, which puts the Subject itself on error.
   */
  public managedError(argument?: TArgument, result?: TResult, error?: Error) {
    super.next(new AsyncEvent<TArgument, TResult>('error', { argument, error, result }));
  }

  /**
   * Manages the execution life cycle of a Promise.
   * processing => processed | error;
   * @param carryOnResult - true to emit current result on processing and error
   */
  public execute(argument: TArgument, promise: (argument: TArgument) => Promise<TResult>, carryOnResult = true) {
    const currentResult = carryOnResult ? this.value.result : undefined;
    this.processing(argument, currentResult);
    promise(argument)
      .then(
        (result) => this.processed(argument, result),
        (error) => this.managedError(argument, currentResult, error));
  }

  /**
   * Manages the observance life cycle of an Observable.
   * processing => (processed | error)*;
   * @returns the subscription.
   * @param carryOnResult - true to emit current result on processing and error
   */
  public observe(argument: TArgument, observable: Observable<TResult>, carryOnResult = true): Subscription {
    const currentResult = carryOnResult ? this.value.result : undefined;
    this.processing(argument, currentResult);
    return observable.subscribe(
      (result) => this.processed(argument, result),
      (error) => this.managedError(argument, currentResult, error));
  }
}
