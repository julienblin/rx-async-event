# rx-async-event

Manages processing / processed / error state (mainly) for Angular applications.

[![Travis](https://travis-ci.org/julienblin/rx-async-event.svg?branch=master)](https://travis-ci.org/julienblin/rx-async-event)
[![npm](https://img.shields.io/npm/v/rx-async-event.svg)](https://www.npmjs.com/package/rx-async-event)

## Objectives

This is a small helper library to help manage processing and processed states for Angular applications.
It allows encapsulation of either a promise or an observable, and emits standardized life cycle events:
- init
- processing
- processed
- error

As a side benefit, it also manages errors so that they bubble up in a managed way (instead of crashing the application).

## How to use

### Installation

```shell
npm i --save rx-async-event
```

### Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncEventObservable, AsyncEventSubject } from 'rx-async-event';
import { Post } from './post';

@Injectable()
export class AppService {

  private readonly _postEvent$ = new AsyncEventSubject<number, Post>();

  constructor(private http: HttpClient) { }

  get postEvent$(): AsyncEventObservable<number, Post> {
    return this._postEvent$.asObservable();
  }

  /**
   * Example of managing the life cycle of an HttpClient Observable.
   */
  loadPost(id: number) {
    return this._postEvent$.observe(
      id,
      this.http.get<Post>(`https://jsonplaceholder.typicode.com/posts/${id}`));
  }

  /**
   * This example manages the life cycle of a Promise instead.
   */
  loadPostAsPromise(id: number) {
    return this._postEvent$.execute(
      id,
      (arg) => this.http.get<Post>(`https://jsonplaceholder.typicode.com/posts/${id}`).toPromise());
  }

  
}
```

### Component

```typescript
import { Component } from '@angular/core';
import { AppService } from './app.service';
import { Post } from './post';
import { AsyncEventObservable } from 'rx-async-event';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ AppService ]
})
export class AppComponent {

  postEvent$: AsyncEventObservable<number, Post>;

  constructor(private appService: AppService) {
    this.postEvent$ = this.appService.postEvent$;
  }

  loadPost(id: number) {
    this.appService.loadPost(id);
  }
}
```

### View

```html
<ng-container *ngIf="(postEvent$ | async) as postEvent">

  <ng-container *ngIf="postEvent.isInit">
    <!-- This is the initial state -->
    Nothing to display
  </ng-container>

  <ng-container *ngIf="postEvent.isProcessing">
    <!-- This is the processing state -->
    Processing post id {{postEvent.argument}}...
  </ng-container>

  <ng-container *ngIf="postEvent.isProcessed">
    <!-- This is the processed state -->
    Post title: {{postEvent.result.title}}
  </ng-container>

  <ng-container *ngIf="postEvent.isError">
    <!-- This is the error state -->
    Ohuh - something went wrong: {{postEvent.error.message}}
  </ng-container>

</ng-container>
```