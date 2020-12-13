# Redux Micro-Frontend

## Overview

This library can be used for using Redux in a Micro-Frontend based architecture. Micro Frontends is an architectural pattern for breaking up a monolith Frontend application into manageable, decoupled and smaller applications. Each application is a self-contained and isolated unit. Generally, a common shell/platform application is used to host these small units to provide a common experience for the end-users.

`Redux` is one of the most popular libraries for predictable state management. However, the general practice in using Redux is to have a single store, thereby having a single state object. This approach would mean that all the Micro Frontends would have a shared state. This is a violation of the Micro-Frontend based architecture since each App is supposed to be a self-contained unit having its store.

To provide a level of isolation some developers use `combineReducer()` to write a separate reducer for each Micro Frontend and then combine them into one big reducer. Although it would solve some problems this would still imply that a single state object is shared across all the apps. In the absence of sufficient precautions, apps might accidentally override other others state.

In a Micro-Frontend architecture, an individual application should not be able to modify the state of other apps. However, they should be able to see the state of other apps. Along the same line for enabling cross-application communication, they should also be able to send events/actions to other Stores and also get notified of changes in other apps' state. This library aims to attain that sweet spot between providing isolation and cross-application communication.


## Concept
A concept of `Global Store` is introduced which is a virtual amalgamation of multiple `Redux Stores`. Strictly speaking, the `Global Store` is not an actual store, rather it's a collection of multiple isolated `Redux Stores`. Each physical `Redux Store` here refers to the isolated store that each app uses. Micro frontends having access to the `Global Store` would be able to perform all operations that are allowed on an individual `Redux Store` including `getState()`, `dispatch()` and `subscribe()`.

Each Micro Frontend would have the capability to have its own `Redux Store`. Each app would create and register their `Redux Store` with the `Global Store`. The `Global Store` then uses these individual stores to project a Global State which is a combination of the state from all the other Stores. All the Micro Frontends would have access to the Global Store and would be able to see the state from the other Micro Frontends but won't be able to modify them. Actions dispatched by an app remains confined within the store registered by the app and is not dispatched to the other stores, thereby providing componentization and isolation.

### Global Actions
A concept of `Global Action` is available which allows other apps to dispatch actions to stores registered by other micro frontends. Each micro frontend has the capability to register a set of global actions along with the store. These set of global actions can be dispatched in this micro frontend's store by other micro frontends. This enables cross-application communication.
![Global Store](https://github.com/microsoft/redux-micro-frontend/blob/main/assets/Global_Store_Dispatch.png)

### Cross-state callbacks
Cross-application communication can also be achieved by subscribing to change notifications in other Micro Frontend's state. Since each micro-frontend has read-only permission to other states, they can also attach callbacks for listening to state changes. The callbacks can be attached either at an individual store level or at a global level (this would mean that state change in any store would invoke the callback).


## Problems of a single shared state
- Accidental override of state of other apps (in case duplicate actions are dispatched by multiple apps)
- Apps would have to be aware of other Micro Frontends
- Shared middlewares. Since only a single store is maintained, all the Micro Frontends would have to share the same middlewares. So in situations where one app wants to use `redux-saga` and other wants to use `redux-thunk` is not possible.

## Installation
```sh
npm install redux-micro-frontend --save
```

## Quick Guide
### Get an instance of Global Store
```javascript
import { GlobalStore } from 'redux-micro-frontend';
...
this.globalStore = GlobalStore.Get();
```

### Create/Register Store
```javascript
ler appStore = createStore(AppReducer); // Redux Store
this.globalStore.RegisterStore("App1", appStore);
this.globalStore.RegisterGlobalActions("App1", ["Action-1", "Action-2"]); // These actions can be dispatched by other apps to this store
```

### Dispatch Action
```javascript
let action = {
    type: 'Action-1',
    payload: 'Some data'
}
this.globalStore.DispatchAction("App1", action); // This will dispatch the action to current app's store as well other stores who might have registered 'Action-1' as a global action
```

### Subscribe to State
```javascript
// State change in any of the apps
this.globalStore.Subscribe("App1", localStateChanged);

// State change in the current app
this.globalStore.SubscribeToGlobalState("App1", globalStateChanged);

// State change in app2's state
this.globalStore.SubscribeToPartnerState("App1", "App2", app2StateChanged);

...

localStateChanged(localState) {
    // Do something with the new state
}

globalStateChanged(stateChanged) {
        // The global state has a separate attribute for all the apps registered in the store
        let app1State = globalState.App1;
        let app2State = globalState.App2; 
}

app2StateChanged(app2State) {
    // Do something with the new state of app 2
}

```

## Sample App
Location: https://github.com/microsoft/redux-micro-frontend/tree/main/sample

Instruction for running Sample App
1. Go to sample/counterApp and run `npm i` and then `npm run start`
2. Go to sample/todoApp and run `npm i` and then `npm run start`
3. Go to sample/shell and run `npm i` and then `npm run start`
4. Browse http://localhost:6001

## Documentation
[See Github wiki](https://github.com/microsoft/redux-micro-frontend/wiki)

## Appendix
- To learn the basics for Redux check for [official documentation of Redux](https://redux.js.org/) - https://redux.js.org/.
- To know more about [Micro Front-end](https://martinfowler.com/articles/micro-frontends.html) style of architecture check [this article](https://martinfowler.com/articles/micro-frontends.html) from [martinfowler.com](https://martinfowler.com/articles/micro-frontends.html).


## Trademarks

This project may contain trademarks or logos for projects, products, or services. Authorized use of Microsoft 
trademarks or logos is subject to and must follow 
[Microsoft's Trademark & Brand Guidelines](https://www.microsoft.com/en-us/legal/intellectualproperty/trademarks/usage/general).
Use of Microsoft trademarks or logos in modified versions of this project must not cause confusion or imply Microsoft sponsorship.
Any use of third-party trademarks or logos are subject to those third-party's policies.
