# opendeeplink

Open deeplink by visibilityChange

# Install

```bash
npm install opendeeplink --save
```

# Usage
```js
import {
    init,
    open
} from 'opendeeplink';
```

#### init
```js
init({
    appStore: 'path you want to go',
    googlePlay: 'path you want to go',
    timeout: 'timeout for waiting app open'
});
```
#### open
```js
open(String deeplink, Integer customTimeout, Function fallbackAction)
```
* `deeplink` *(String)*: require, deeplink for app you want to open
* `customTimeout` *(Integer)*: optional, timeout for waiting app open
* `fallbackAction` *(Function || String)*: optional, go this when appStore and googlePlay is not setting