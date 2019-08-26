const DEFAULT_TIMEOUT = 3000;

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
    visibilityChange: null,
    isSafari: false,
    isChrome: false
}

function handleVisibilityChange(e) {
    if (document[envs.hidden]) {
        clearTimeout(envs.timer);
    }
}

function checkDeviceOs() {
    const ua = navigator.userAgent.toLowerCase()
    const isIPhone = envs.testRegex.test(ua)
    const isAndroid = !!~ua.indexOf('android')
    
    envs.device = isIPhone ? envs.wording.ios : isAndroid ? envs.wording.android : envs.wording.ios;

    if (envs.hidden !== "msHidden") {
        if (navigator.bluetooth) {
            envs.isChrome = true;
        } else {
            envs.isSafari = true;
        }
    }
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

exports.initDeeplink = options => {
    if (envs.isInit) {
        return;
    }

    options = options || {};

    envs.isInit = true;
    settings.appStore = options.appStore || null;
    settings.googlePlay = options.googlePlay || null;
    settings.timeout = options.timeout || null;

    try {
        setEnv();
        checkDeviceOs();
    } catch(e) {
        console.log(e);
    }
};

exports.openDeeplink = (deeplink, customTimeout, fallbackAction) => {
    if (envs.isSafari) {
        window.open(deeplink, 'deeplink');
        return;
    }

    if (fallbackAction && customTimeout) {
        const timeout = customTimeout || settings.timeout || DEFAULT_TIMEOUT;

        clearTimeout(envs.timer);

        envs.timer = setTimeout(function() {
            if (typeof fallbackAction === 'string') {
                let fallbackUrl = fallbackAction;

                if (!fallbackUrl) {
                    if (envs.device === envs.wording.ios && settings.appStore) {
                        fallbackUrl = settings.appStore;
                    } else if (envs.device === envs.wording.android && settings.googlePlay) {
                        fallbackUrl = settings.googlePlay;
                    }
                }

                if (fallbackUrl) {
                    window.location.href = fallbackUrl;
                }

                return;
            }
            
            fallbackAction && fallbackAction();
        }, timeout);
    }

    window.location.href = deeplink;
}
