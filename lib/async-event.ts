/** Possible states for an async event. */
export type AsyncEventState = 'init' | 'loading' | 'loaded' | 'error';

/** Non-generic interface for AsyncEvent */
export interface IAsyncEvent {

  /** Returns true if this event represents the initial state. */
  isInit: boolean;

  /** Returns true if this event represents a loading state. */
  isLoading: boolean;

  /** Returns true if this event represents a loaded state. */
  isLoaded: boolean;

  /** Returns true if this event represents an error state. */
  isError: boolean;

  /** Gets the event argument, if any. */
  argument: any;

  /** Gets the event value, if any. */
  value: any;

  /** Gets the event error, if any. */
  error?: Error;

  /** More elegant version of state ===. */
  is(state: AsyncEventState): boolean;
}

/**
 * An AsyncEvent is a encapsulation of an event
 * that can be emitted along with state indication
 * and data.
 */
export class AsyncEvent<TArgument, TValue> implements IAsyncEvent {

    constructor(
      public readonly state: AsyncEventState,
      public readonly data: {
        argument?: TArgument,
        value?: TValue,
        error?: Error,
      }) {
    }

    /** Returns true if this event represents the initial state. */
    get isInit() {
      return this.is('init');
    }

    /** Returns true if this event represents a loading state. */
    get isLoading() {
      return this.is('loading');
    }

    /** Returns true if this event represents a loaded state. */
    get isLoaded() {
      return this.is('loaded');
    }

    /** Returns true if this event represents an error state. */
    get isError() {
      return this.is('error');
    }

    /** More elegant version of state ===. */
    public is(state: AsyncEventState) {
      return this.state === state;
    }

    /** Gets the event argument, if any. */
    get argument() {
      return this.data.argument;
    }

    /** Gets the event value, if any. */
    get value() {
      return this.data.value;
    }

    /** Gets the event error, if any. */
    get error() {
      return this.data.error;
    }
  }

/** Constant init event - should be the same for all AsyncEvents... */
export const InitAsyncEvent = new AsyncEvent('init', {});
