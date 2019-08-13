const DEFAULT_TIMEOUT = 1000;

const settings = {
    appStore: null,
    googlePlay: null,
    timeout: DEFAULT_TIMEOUT
};

const envs = {
    isInit: false,
    wording: {
        ios: 'IOS',
        android: 'ANDROID'
    },
    testRegex: /iphone|ipad|ipod/,
    timer: null,
    device: null,
    hidden: null,
    visibilityChange: null
}

function handleVisibilityChange(e) {
    if (document[envs.hidden]) {
        clearTimeout(envs.timer);
    }
}

function checkDeviceOs() {
    const ua = navigator.userAgent.toLowerCase()
    const isIPhone = testRegex.test(ua)
    const isAndroid = !!~ua.indexOf('android')
    
    envs.device = isIPhone ? envs.wording.ios : isAndroid ? envs.wording.android : envs.wording.ios;
}

function setEnv() {
    if (typeof document.hidden !== "undefined") {
        envs.hidden = "hidden";
        envs.visibilityChange = "visibilitychange";
    } else if (typeof document.msHidden !== "undefined") {
        envs.hidden = "msHidden";
        envs.visibilityChange = "msvisibilitychange";
    } else if (typeof document.webkitHidden !== "undefined") {
        envs.hidden = "webkitHidden";
        envs.visibilityChange = "webkitvisibilitychange";
    }

    document.addEventListener(envs.visibilityChange, handleVisibilityChange, false);
}

export const initDeeplink = (options = {}) => {
    if (envs.isInit) {
        return;
    }

    envs.isInit = true;
    settings.appStore = options.appStore || null;
    settings.googlePlay = options.googlePlay || null;
    settings.timeout = options.timeout || null;

    setEnv();
    checkDeviceOs();
};

export const openDeeplink = (deeplink, needFallback = false, customTimeout, fallbackAction) => {
    const timeout = customTimeout || settings.timeout || DEFAULT_TIMEOUT;

    if (needFallback) {
        clearTimeout(envs.timer);
        envs.timer = setTimeout(function() {
            if (envs.device === envs.wording.ios && settings.appStore) {
                wondow.location.href = settings.appStore;
            } else if (envs.device === envs.wording.android && settings.googlePlay) {
                wondow.location.href = settings.googlePlay;
            } else {
                fallbackAction && fallbackAction();
            }
        }, timeout);
    }

    window.location.href = deeplink;
}
