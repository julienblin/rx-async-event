/** Possible states for an async event. */
export type AsyncEventState = 'init' | 'processing' | 'processed' | 'error';

/** Non-generic interface for AsyncEvent */
export interface IAsyncEvent {

  /** Returns true if this event represents the initial state. */
  isInit: boolean;

  /** Returns true if this event represents a processing state. */
  isProcessing: boolean;

  /** Returns true if this event represents a processed state. */
  isProcessed: boolean;

  /** Returns true if this event represents an error state. */
  isError: boolean;

  /** Gets the event argument, if any. */
  argument: any;

  /** Gets the event result, if any. */
  result: any;

  /** Returns true if the result is false or an empty array. */
  isResultEmpty: boolean;

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
export class AsyncEvent<TArgument, TResult> implements IAsyncEvent {

    constructor(
      public readonly state: AsyncEventState,
      public readonly data: {
        argument?: TArgument,
        result?: TResult,
        error?: Error,
      }) {
    }

    /** Returns true if this event represents the initial state. */
    get isInit() {
      return this.is('init');
    }

    /** Returns true if this event represents a processing state. */
    get isProcessing() {
      return this.is('processing');
    }

    /** Returns true if this event represents a processed state. */
    get isProcessed() {
      return this.is('processed');
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

    /** Gets the event result, if any. */
    get result() {
      return this.data.result;
    }

    /** Returns true if the result is false or an empty array. */
    get isResultEmpty() {
      if (!this.result) {
        return true;
      }

      if (Array.isArray(this.result) && this.result.length === 0) {
        return true;
      }

      return false;
    }

    /** Gets the event error, if any. */
    get error() {
      return this.data.error;
    }
  }

/** Constant init event - should be the same for all AsyncEvents... */
export const InitAsyncEvent = new AsyncEvent('init', {});
