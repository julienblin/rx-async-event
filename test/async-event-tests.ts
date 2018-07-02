import { expect } from 'chai';
import 'mocha';
import { Observable, Observer } from 'rxjs';
import { AsyncEvent } from '../lib/async-event';
import { AsyncEventSubject } from '../lib/index';

// tslint:disable:no-unused-expression

describe('AsyncEvent', () => {
  it('should initialize with init', () => {
    const subject = new AsyncEventSubject<void, void>();
    const currentValue = subject.getValue();

    expect(currentValue.isInit).to.be.true;
    expect(currentValue.isProcessing).to.be.false;
    expect(currentValue.isProcessed).to.be.false;
    expect(currentValue.isError).to.be.false;
  });

  it('should execute promise', async () => {
    const allEvents: Array<AsyncEvent<number, string>> = [];
    const subject = new AsyncEventSubject<number, string>();
    subject.subscribe((evt) => allEvents.push(evt));
    await subject.execute(5, async (x) => 'foo' + x);

    expect(allEvents).to.have.lengthOf(3);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isProcessing).to.be.true;
    expect(allEvents[1].argument).to.eq(5);
    expect(allEvents[1].result).to.be.undefined;
    expect(allEvents[2].isProcessed).to.be.true;
    expect(allEvents[2].argument).to.eq(5);
    expect(allEvents[2].result).to.eq('foo5');
  });

  it('should create from promise', async () => {
    const subject = AsyncEventSubject.execute<number, string>(5, async (x) => 'foo' + x);
    expect(subject.getValue().isProcessing).to.be.true;
  });

  it('should capture promise errors', async () => {
    const allEvents: Array<AsyncEvent<number, string>> = [];
    const subject = new AsyncEventSubject<number, string>();
    subject.subscribe((evt) => allEvents.push(evt));
    await subject.execute(5, async (x) => { throw new Error('promiseError'); });

    expect(allEvents).to.have.lengthOf(3);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isProcessing).to.be.true;
    expect(allEvents[1].argument).to.eq(5);
    expect(allEvents[1].result).to.be.undefined;
    expect(allEvents[2].isProcessed).to.be.false;
    expect(allEvents[2].isError).to.be.true;
    expect(allEvents[2].argument).to.eq(5);
    expect(allEvents[2].error!.message).to.eq('promiseError');
  });

  it('should observe observables.', () => {
    const allEvents: Array<AsyncEvent<void, string>> = [];
    const subject = new AsyncEventSubject<void, string>();
    subject.subscribe((evt) => allEvents.push(evt));

    const observable = Observable.create((x: Observer<string>) => {
      x.next('foo');
      x.complete();
    });
    subject.observe(undefined, observable);
    expect(allEvents).to.have.lengthOf(3);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isProcessing).to.be.true;
    expect(allEvents[1].result).to.be.undefined;
    expect(allEvents[2].isProcessed).to.be.true;
    expect(allEvents[2].result).to.eq('foo');
  });

  it('should observe observables multiple times.', () => {
    const allEvents: Array<AsyncEvent<void, string>> = [];
    const subject = new AsyncEventSubject<void, string>();
    subject.subscribe((evt) => allEvents.push(evt));

    const observable = Observable.create((x: Observer<string>) => {
      x.next('foo');
      x.next('foo2');
      x.complete();
    });
    subject.observe(undefined, observable);
    expect(allEvents).to.have.lengthOf(4);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isProcessing).to.be.true;
    expect(allEvents[1].result).to.be.undefined;
    expect(allEvents[2].isProcessed).to.be.true;
    expect(allEvents[2].result).to.eq('foo');
    expect(allEvents[3].isProcessed).to.be.true;
    expect(allEvents[3].result).to.eq('foo2');
  });

  it('should create from observables', async () => {
    const observable = Observable.create((x: Observer<string>) => {
      x.next('foo');
      x.complete();
    });

    const subject = new AsyncEventSubject<void, string>();
    subject.observe(undefined, observable);
    expect(subject.getValue().isProcessed).to.be.true;
  });

  it('should capture observables errors.', () => {
    const allEvents: Array<AsyncEvent<void, string>> = [];
    const subject = new AsyncEventSubject<void, string>();
    subject.subscribe((evt) => allEvents.push(evt));

    const observable = Observable.create((x: Observer<string>) => {
      x.error(new Error('observableError'));
    });
    subject.observe(undefined, observable);

    expect(allEvents).to.have.lengthOf(3);
    expect(allEvents[0].isInit).to.be.true;
    expect(allEvents[1].isProcessing).to.be.true;
    expect(allEvents[1].result).to.be.undefined;
    expect(allEvents[2].isProcessed).to.be.false;
    expect(allEvents[2].isError).to.be.true;
    expect(allEvents[2].error!.message).to.eq('observableError');
  });
});
