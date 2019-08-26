# openDeeplink

Open deeplink by visibilityChange

# Install

```bash
npm install opendeeplink --save
```

# Usage
```js
import {
    initDeeplink,
    openDeeplink
} from 'openDeeplink';
```

#### initDeeplink
```js
initDeeplink({
    appStore: 'path you want to go',
    googlePlay: 'path you want to go',
    timeout: 'timeout for waiting app open'
});
```
#### openDeeplink
```js
openDeeplink(String deeplink, Boolean needFallback, Integer customTimeout, Function fallbackAction)
```
* `deeplink` *(String)*: require, deeplink for app you want to open
* `customTimeout` *(Integer)*: optional, timeout for waiting app open
* `fallbackAction` *(Function || String)*: optional, go this when appStore and googlePlay is not setting