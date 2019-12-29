var DEFAULT_TIMEOUT = 2000;
var settings = {
    appStore: null,
    googlePlay: null,
    timeout: DEFAULT_TIMEOUT
};

var envs = {
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
};

function handleVisibilityChange(e) {
    if (!envs.isSafari && document[envs.hidden]) {
        clearTimeout(envs.timer);
    }
}

function checkDeviceOs() {
    var ua = navigator.userAgent.toLowerCase();
    var isIPhone = envs.testRegex.test(ua);
    var isAndroid = !!ua.indexOf('android');

    envs.device = isIPhone ? envs.wording.ios : isAndroid ? envs.wording.android : envs.wording.ios;

    if (envs.hidden !== 'msHidden') {
        if (navigator.vendor.indexOf('Google') !== -1) {
            envs.isChrome = true;
        } else {
            if (navigator.userAgent.indexOf('CriOS') !== -1) {
                envs.isChrome = true;
            } else {
                envs.isSafari = true;
            }
        }
    }
}

function setEnv() {
    if (typeof document.hidden !== 'undefined') {
        envs.hidden = 'hidden';
        envs.visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        envs.hidden = 'msHidden';
        envs.visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        envs.hidden = 'webkitHidden';
        envs.visibilityChange = 'webkitvisibilitychange';
    }

    document.addEventListener(envs.visibilityChange, handleVisibilityChange, false);
}

exports.init = function(options = {}) {
    if (envs.isInit) {
        return;
    }

    envs.isInit = true;
    settings.appStore = options.appStore || null;
    settings.googlePlay = options.googlePlay || null;
    settings.timeout = options.timeout || null;

    try {
        setEnv();
        checkDeviceOs();
    } catch (e) {
        console.log(e);
    }
};

exports.destroy = function() {
    envs.isInit = false;
    document.removeEventListener(envs.visibilityChange, handleVisibilityChange, false);
};

function makeFallbackUrl(fallbackAction = '') {
    let fallbackUrl = fallbackAction;

    // 如果後續動作是文字，表示應該有自己要去的位置
    if (typeof fallbackAction === 'function') {
        // 如果後續不是文字，那有可能有自己想做的動作，例如發送 beacon
        fallbackAction(url => {
            fallbackUrl = url;
        });
    }

    // 預設值
    if (!fallbackUrl && envs.device === envs.wording.ios && settings.appStore) {
        fallbackUrl = settings.appStore;
    } else if (!fallbackUrl && envs.device === envs.wording.android && settings.googlePlay) {
        fallbackUrl = settings.googlePlay;
    }

    return fallbackUrl;
}

// set timer
function postProcess(target, failTimeout, fallbackAction, callback) {
    envs.timer = setTimeout(function() {
        var fallbackUrl = makeFallbackUrl(fallbackAction);
        if (fallbackUrl) {
            target.location.href = fallbackUrl;
        }
        callback && callback(fallbackUrl);
    }, failTimeout);
}

// for safari
function safariProcess(deeplink, timeout, fallbackAction) {
    // 這傢伙話很多，所以要多一點時間給使用者
    var failTimeout = timeout * 3;
    // 如果是 safari, 直接 window open 開啟 deep link
    var windowDeeplink = window.open(deeplink, 'deeplink');
    // 後續 timer
    postProcess(windowDeeplink, failTimeout, fallbackAction, fallbackUrl => {
        if (fallbackUrl) {
            setTimeout(function() {
                windowDeeplink && windowDeeplink.close();
            }, failTimeout);
        } else {
            windowDeeplink && windowDeeplink.close();
        }
    });
}

// for chrome
function normalProcess(deeplink, timeout, fallbackAction) {
    // 開啟 deep link
    window.location.href = deeplink;
    // 後續 timer
    postProcess(window, timeout, fallbackAction);
}

exports.open = function(deeplink, customTimeout, fallbackAction) {
    var timeout = customTimeout || settings.timeout || DEFAULT_TIMEOUT;
    // 分流
    if (envs.isSafari) {
        safariProcess(deeplink, timeout, fallbackAction);
    } else {
        normalProcess(deeplink, timeout, fallbackAction);
    }
};
