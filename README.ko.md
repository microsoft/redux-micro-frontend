# Redux Micro-Frontend

## 더 이상 사용되지 않는 버전에 대한 경고
만약 당신이 1.1.0 버전을 사용하고 있을 경우, 바로 최신 버전으로 업그레이드를 하십시오. 해당 버전은 파이프라인 이슈로 인해 더 이상 사용되지 않습니다.

## 파이프라인 상태
[![Build Status](https://dev.azure.com/MicrosoftIT/OneITVSO/_apis/build/status/Compliant/Core%20Services%20Engineering%20and%20Operations/Corporate%20Functions%20Engineering/Professional%20Services/Foundational%20PS%20Services/Field%20Experience%20Platform/PS-FPSS-FExP-GitHub-Redux-Micro-Frontend?branchName=azure-pipelines)](https://dev.azure.com/MicrosoftIT/OneITVSO/_build/latest?definitionId=32881&branchName=azure-pipelines)

[![CodeQL](https://github.com/microsoft/redux-micro-frontend/actions/workflows/codeql-analysis.yml/badge.svg?branch=main)](https://github.com/microsoft/redux-micro-frontend/actions/workflows/codeql-analysis.yml)

[![Build-and-Publish](https://github.com/microsoft/redux-micro-frontend/actions/workflows/build-and-publish.yml/badge.svg?branch=main)](https://github.com/microsoft/redux-micro-frontend/actions/workflows/build-and-publish.yml)

![npm](https://img.shields.io/npm/dt/redux-micro-frontend)

## 개요

이 라이브러리는 Redux를 마이크로 프론트엔드 기반의 아키텍쳐에서 사용하기 위해 만들어졌습니다. 마이크로 프론트엔드는 모노리스 프론트엔드 애플리케이션을 벗어나 다루고 쉽고, 분리된, 또 작은 단위의 어플리케이션을 구현하기 위한 아키텍쳐 패턴입니다. 각 애플리케이션은 독립적이고 자립적인 하나의 유닛이 됩니다. 일반적으로 껍데기(shell) 애플리케이션은 엔드 유저들에게 비슷한 경험을 제공하기 위해 이러한 작은 유닛들에 대한 호스트로 사용되도록 구현됩니다.

`Redux`는 예측가능한 상태 관리를 위해 만들어진 유명한 라이브러리들 중 하나입니다. 하지만, 일반적으로 리덕스를 사용할 때 하나의 store를 두고 하나의 상태 객체를 가지게 됩니다. 이 접근은 모든 마이크로 프론트엔드가 하나의 상태를 공유할 수 있다는 것을 의미합니다. 하지만 마이크로 프론트엔드 기반의 아키텍쳐에서 각 애플리케이션은 해당 스토어에 대해 독립적으로 운영되기 때문에 이러한 요소는 마이크로 프론트엔드 아키텍쳐에서 문제 요소로 작용합니다.

몇몇의 개발자는 마이크로 프론트엔드의 각 애플리케이션의 분리 수준을 제공하기 위해  `combineReducer()`를 사용하기도 합니다. 마이크로 프론트엔드를 구현하기 위해 분리된 리듀서를 작성하고, 이들을 하나의 거대한 리듀서로 통합하기 위해서 말이지요. 이러한 것들이 어느 정도의 문제를 해결할 수는 있지만, 이는 단 하나의 상태 객체가 모든 각각의 앱들에 대해 공유된다는 것을 의미합니다. 이는 충분한 조치가 없을 경우, 각각의 앱들이 뜻하지 않게 다른 상태 객체들을 재정의(override)할 수도 있습니다.

마이크로 프론트엔드 아키텍쳐에서, 각각의 애플리케이션은 다른 앱들의 상태에 접근하여 상태값을 수정해서는 안됩니다. 그럼에도 각각의 앱들은 다른 앱들의 상태를 알아야 할 경우가 있습니다. 애플리케이션 간의 커뮤니케이션을 가능케하는 선에서 그들은 이벤트 또는 액션을 다른 스토어에 전달할 수 있습니다. 나아가, 다른 앱들 사이의 상태 변화를 감지할 수도 있습니다. 이 라이브러리는 각 애플리케이션의 분리와 애플리케이션 간의 커뮤니케이션 두 개의 마이크로 프론트엔드 아키텍쳐 요구사항을 만족시킬 수 있는 라이브러리입니다.


## 개념
`전역 스토어`의 개념은 다양한 `리덕스 스토어`들을 가상으로 병합하기 위해 도입되었습니다. 엄밀히 말하면, `전역 스토어`는 스토어는 아닙니다. 오히려 이는 다양한 독립적인 `리덕스 스토어`들의 집합입니다. 각각의 물리적인 `리덕스 스토어`는 각각의 앱이 사용하는 독립된 스토어를 참조합니다. `전역 스토어`에 접근하는 마이크로 프론트엔드 앱들은 `getState()`, `dispatch()` 그리고 `subscribe()`와 같은 각각의 `리덕스 스토어`에 대한 모든 작업들을 수행할 수 있습니다.

각각의 마이크로 프론트엔드 앱들은 그들만의 `리덕스 스토어`를 가질 수 있습니다. 각각의 앱들은 그들의 `리덕스 스토어`를 만들고 `전역 스토어`에 등록할 수 있습니다. 그 `전역 스토어`는  이러한 개별 리덕스 스토어를 사용하여 다른 모든 스토어의 상태를 조합한 전역 상태(Global State)를 투영합니다. 모든 마이크로 프론트엔드 앱들은 이 `전역 스토어`에 접근할 수 있고, 다른 마이크로 프론트엔드의 상태를 볼 수 있습니다. 하지만 그들을 수정할 수는 없죠. 앱에서 디스패치된 작업은 앱에서 등록된 스토어 내에서 제한되어 있어 다른 스토어에 디스패치되지 않으므로 컴포넌트화 또는 분리가 가능합니다.

### 더 읽어볼 것들
[상태 관리의 기본](https://www.devcompost.com/post/state-management-for-front-end-applications-part-i-what-and-why)


### 전역 액션
전역 액션은 특정 앱이 다른 마이크로 프론트엔드 앱에 의해 등록된 스토어에 액션을 디스패치할 수 있는 개념입니다. 각 마이크로 프론트엔드 앱에는 스토어와 함께 전역 액션 집합을 등록할 수 있는 기능이 있습니다. 이러한 전역 액션 집합은 다른 마이크로 프론트엔드 앱에 의해 해당 마이크로 프론트엔드의 스토어에서 디스패치될 수 있습니다. 따라서 애플리케이션 간의 통신이 가능하게 됩니다.
![Global Store](https://github.com/microsoft/redux-micro-frontend/blob/main/assets/Global_Store_Dispatch.png)

### 상태 간의 상호 콜백
애플리케이션 간의 커뮤니케이션은 다른 마이크로 프론트엔드의 상태에 대한 변화를 구독하는 것으로부터 이루어집니다. 각각의 마이크로 프론트엔드 앱들은 다른 상태들에 대해 읽기 권한만(read-only) 가지고 있기 때문에, 그들은 상태 변화를 읽기 위해 콜백을 붙일 수 있습니다. 콜백들은 각각 스토어 레벨 또는 전역 레벨로 붙여질 수 있습니다. (전역 레벨 콜백은 어떤 스토어이던 상태 변화가 발생할 경우 콜백을 일으킨다는 것을 의미합니다.)


## 단일 상태 공유의 문제점
- 실수로 다른 앱의 상태를 재정의할 수 있습니다. (중복된 액션들이 여러 앱에 의해 디스패치되는 경우)
- 앱들은 다른 마이크로 프론트엔드들을 알고 있어야 합니다.
- 공유된 미들웨어들. 하나의 스토어만 유지되기 때문에, 모든 마이크로 프론트엔드들이 동일한 미들웨어를 공유해야 합니다. 따라서 어떤 앱은 `redux-saga`를 쓰고, 어떤 앱은 `redux-thunk`를 하는 등의 작업은 할 수 없습니다.

## 설치
```sh
npm install redux-micro-frontend --save
```

## 빠른 적용
### 전역 스토어의 인스턴스 얻기
```javascript
import { GlobalStore } from 'redux-micro-frontend';
...
this.globalStore = GlobalStore.Get();
```

### 스토어를 생성하고 등록하기
```javascript
let appStore = createStore(AppReducer); // 리덕스 스토어
this.globalStore.RegisterStore("App1", appStore);
this.globalStore.RegisterGlobalActions("App1", ["Action-1", "Action-2"]); // 이 액션들은 다른 앱들에 의해 이 스토어에 디스패치될 수 있습니다.
```

### 액션 디스패치하기
```javascript
let action = {
    type: 'Action-1',
    payload: 'Some data'
}
this.globalStore.DispatchAction("App1", action); // 이는 현재 앱의 스토어뿐만 아니라, 'Action-1'을 전역 액션으로 등록한 다른 스토어로도 액션이 전송됩니다.
```

### 상태 구독하기
```javascript
// 모든 앱들의 상태 변화
this.globalStore.Subscribe("App1", localStateChanged);

// 현재 앱의 상태 변화
this.globalStore.SubscribeToGlobalState("App1", globalStateChanged);

// App2의 상태 변화
this.globalStore.SubscribeToPartnerState("App1", "App2", app2StateChanged);

...

localStateChanged(localState) {
    // 새로운 상태에 대한 작업을 수행하세요.
}

globalStateChanged(stateChanged) {
        // 전역 상태는 스토어에 등록된 모든 앱들을 위한 분리된 어트리뷰트를 가질 수 있습니다.
        let app1State = globalState.App1;
        let app2State = globalState.App2; 
}

app2StateChanged(app2State) {
    // app2의 새로운 상태에 대한 작업을 수행하세요.
}
```

## 샘플 앱
위치: https://github.com/microsoft/redux-micro-frontend/tree/main/sample

샘플 앱을 실행하기 위한 안내서
1. sample/counterApp으로 가서 `npm i`을 실행하세요. 그리고 `npm run start`을 하세요.
2. sample/todoApp으로 가서 `npm i`을 실행하세요. 그리고 `npm run start`을 하세요.
3. sample/shell으로 가서 `npm i`을 실행하세요. 그리고 `npm run start`을 하세요.
4. http://localhost:6001을 여세요.

## 문서
[Github 위키](https://github.com/microsoft/redux-micro-frontend/wiki)

## 부록
- Redux의 기본기를 배우기 위해서는 Redux 공식 문서를 확인하세요. - https://redux.js.org/.
- 마이크로 프론트엔드 아키텍쳐에 대해 더 알고 싶다면, [martinfowler.com](http://martinfowler.com/)에서 만든 [이 아티클](https://martinfowler.com/articles/micro-frontends.html)을 확인하세요.


## Trademarks

이 프로젝트에는 프로젝트, 제품 또는 서비스의 상표 또는 로고가 포함될 수 있습니다. Microsoft 상표 또는 로고의 승인된 사용은 Microsoft의 상표 & 브랜드 지침의 적용을 받으며 반드시 따라야 합니다. 이 프로젝트의 수정된 버전에서 Microsoft 상표 또는 로고를 사용하면 Microsoft의 후원이 혼동되거나 암시되어서는 안 됩니다. 타사 상표 또는 로고는 해당 타사 정책의 적용을 받습니다.
