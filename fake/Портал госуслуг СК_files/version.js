function checkBrowserName() {
    var browserName = navigator.userAgent;
    var browserType;
    if (browserName.search(/Firefox/) > 0) {
        browserType = "Firefox";
    } else if (browserName.search(/Chrome/) > 0) {
        browserType = "Google Chrome";
    } else if (browserName.search(/Safari/) > 0) {
        browserType = "Safari";
    } else if (browserName.search(/Opera/) > 0) {
        browserType = "Opera";
    } else if (browserName.search(/MSIE/) > 0) {
        browserType = "Internet Explorer";
    } else {
        browserType = "Другой браузер";
    }

    if (browserType == "Internet Explorer") {
        if (document.documentMode <= 8) {
            alert(
                "Ваш браузер не поддерживается, пожалуйста обновите ваш браузер или откройте в любом другом браузере Firefox, Google Chrome, Safari, Opera"
            );
        }
    }
}
