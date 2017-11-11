import { expect } from 'chai';
import 'mocha';
import { AsyncEvent } from '../src/async-event';
import { AsyncEventSubject } from '../src/index';

// tslint:disable:no-unused-expression

describe('AsyncEvent', () => {
  it('should initialize with init', () => {
    const subject = new AsyncEventSubject<void, void>();
    const currentValue = subject.getValue();

    expect(currentValue.isInit).to.be.true;
    expect(currentValue.isLoading).to.be.false;
    expect(currentValue.isLoaded).to.be.false;
    expect(currentValue.isError).to.be.false;
  });

  it('should execute promise', async () => {
    const allEvents: Array<AsyncEvent<number, string>> = [];
    const subject = new AsyncEventSubject<number, string>();
    subject.subscribe((evt) => allEvents.push(evt));
    await subject.executePromise(5, async (x) => 'tada' + x);

    expect(allEvents).to.have.lengthOf(3);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isLoading).to.be.true;
    expect(allEvents[1].argument).to.eq(5);
    expect(allEvents[1].value).to.be.undefined;
    expect(allEvents[2].isLoaded).to.be.true;
    expect(allEvents[2].argument).to.eq(5);
    expect(allEvents[2].value).to.eq('tada5');
  });

  it('should create from promise', async () => {
    const subject = AsyncEventSubject.fromPromise<number, string>(5, async (x) => 'tada' + x);
    expect(subject.getValue().isLoading).to.be.true;
  });

  it('should capture promise errors', async () => {
    const allEvents: Array<AsyncEvent<number, string>> = [];
    const subject = new AsyncEventSubject<number, string>();
    subject.subscribe((evt) => allEvents.push(evt));
    await subject.executePromise(5, async (x) => { throw new Error('promiseError'); });

    expect(allEvents).to.have.lengthOf(3);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isLoading).to.be.true;
    expect(allEvents[1].argument).to.eq(5);
    expect(allEvents[1].value).to.be.undefined;
    expect(allEvents[2].isLoaded).to.be.false;
    expect(allEvents[2].isError).to.be.true;
    expect(allEvents[2].argument).to.eq(5);
    expect(allEvents[2].error!.message).to.eq('promiseError');
  });
});
