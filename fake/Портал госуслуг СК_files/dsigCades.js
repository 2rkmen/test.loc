window.signCadesPlugin_NPAPI = function(text, cert) {
    var tmp = "";
    var xmlDoc = "";
    var signedXML = "";

    //    console.log(text);
    if (window.DOMParser) { // Standard
        tmp = new DOMParser();
        xmlDoc = tmp.parseFromString(text, "text/xml");
    } else { // IE
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(text);
    }
    var toSignElement = getSignElement(xmlDoc);
    var dataToSign = new XMLSerializer().serializeToString(toSignElement);

    if (dataToSign.trim().indexOf('<?xml') !== 0)
        dataToSign = '<?xml version="1.0" encoding="UTF-8"?>' + dataToSign;
    try {
        var sSignedPart = MakeXMLSign_NPAPI(dataToSign, cert);
        if (window.DOMParser) { // Standard
            tmp = new DOMParser();
            signedXML = tmp.parseFromString(sSignedPart, "text/xml");
        } else { // IE
            signedXML = new ActiveXObject("Microsoft.XMLDOM");
            signedXML.async = "false";
            signedXML.loadXML(sSignedPart);
        }
        toSignElement.appendChild(signedXML.documentElement.getElementsByTagNameNS(
            "http://www.w3.org/2000/09/xmldsig#", "Signature")[0]);
        var res = new XMLSerializer().serializeToString(xmlDoc);
        return res;
    } catch (ex) {
        throw new Error(GetErrorMessage(ex))
    }
}

var async_code_included = 0;
var async_Promise;
var async_resolve;

function MakeXMLSign_NPAPI(dataToSign, certObject) {
    var errormes = "";
    try {
        var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    } catch (err) {
        errormes = "Failed to create CAdESCOM.CPSigner: " + err.number;
        alert(errormes);
        throw errormes;
    }

    if (oSigner) {
        oSigner.Certificate = certObject;
    } else {
        errormes = "Failed to create CAdESCOM.CPSigner";
        alert(errormes);
        throw errormes;
    }

    var XmlDsigGost3410Url = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411";
    var XmlDsigGost3411Url = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411";
    var CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED = 0;

    try {
        var oSignedXML = cadesplugin.CreateObject("CAdESCOM.SignedXML");
    } catch (err) {
        alert('Failed to create CAdESCOM.SignedXML: ' + GetErrorMessage(err));
        return;
    }

    oSignedXML.Content = dataToSign;
    oSignedXML.SignatureType = CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED;
    oSignedXML.SignatureMethod = XmlDsigGost3410Url;
    oSignedXML.DigestMethod = XmlDsigGost3411Url;

    var sSignedMessage = "";
    try {
        sSignedMessage = oSignedXML.Sign(oSigner);
    } catch (err) {
        errormes = "Не удалось создать подпись из-за ошибки: " + GetErrorMessage(err);
        alert(errormes);
        throw errormes;
    }

    return sSignedMessage;
};

function GetCertificate_NPAPI(certValue) {
    var thumbprint = certValue.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase();
    try {
        var oStore = cadesplugin.CreateObject("CAPICOM.Store");
        oStore.Open();
    } catch (err) {
        alert('Failed to create CAdESCOM.Store: ' + GetErrorMessage(err));
        console.log('Failed to create CAdESCOM.Store: ' + GetErrorMessage(err));
        return;
    }

    var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
    var oCerts = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

    if (oCerts.Count == 0) {
        alert("Certificate not found");
        return;
    }
    var oCert = oCerts.Item(1);
    return oCert;
};

function getSignElement(doc) {
    var result = null;
    var nodeList = doc.getElementsByTagNameNS("http://smev.gosuslugi.ru/rev120315", "AppData");
    if (!nodeList || nodeList.length == 0) nodeList = doc.getElementsByTagNameNS("http://smev.gosuslugi.ru/rev111111",
        "AppData");
    if (!nodeList || nodeList.length == 0) nodeList = doc.getElementsByTagName("AppData");
    if (!nodeList || nodeList.length == 0) nodeList = doc.getElementsByTagNameNS(
        "urn://x-artefacts-smev-gov-ru/services/message-exchange/types/basic/1.1", "MessagePrimaryContent");
    if (nodeList.length > 0) {
        result = nodeList[0];
    } else {
        alert("Cant get element to sign!");
    }
    return result;
}

function include_async_code() {
    if (async_code_included) {
        return async_Promise;
    }
    var fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", "/js/lib/cades/async_code.js");
    document.getElementsByTagName("head")[0].appendChild(fileref);
    async_Promise = new Promise(function(resolve) {
        async_resolve = resolve;
    });
    async_code_included = 1;
    return async_Promise;
}

function initCadesPlugin_Async(pluginInfo) {
    return include_async_code().then(function() {
        return getPluginInfoAsync(pluginInfo);
    });
}

function initCadesPlugin_NPAPI(pluginInfo) {
    console.log('npapi');
    pluginInfo.status = true;
    pluginInfo.plug_ver = cadesplugin.CreateObject("CAdESCOM.About").Version;
    pluginInfo.csp_ver = GetCSPVersion_NPAPI();
}

function GetCSPVersion_NPAPI() {
    try {
        var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
    } catch (err) {
        alert('Failed to create CAdESCOM.About: ' + GetErrorMessage(err));
        return;
    }
    var ver = oAbout.CSPVersion("", 75);
    return ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
}

function getCertList_Cades() {

    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    } catch (ex) {
        console.log("Ошибка при открытии хранилища: " + GetErrorMessage(ex));
        return;
    }

    var certCnt;

    try {
        certCnt = oStore.Certificates.Count;
        if (certCnt == 0)
            throw "Cannot find object or property. (0x80092004)";
    } catch (ex) {
        var message = GetErrorMessage(ex);
        if ("Cannot find object or property. (0x80092004)" == message
            || "oStore.Certificates is undefined" == message
            || "Объект или свойство не найдено. (0x80092004)" == message) {
            oStore.Close();
            return;
        }
    }

    var lst = [];
    for (var i = 1; i <= certCnt; i++) {
        var cert;
        try {
            cert = oStore.Certificates.Item(i);
        } catch (ex) {
            alert("Ошибка при перечислении сертификатов: " + GetErrorMessage(ex));
            return;
        }

        var oOpt = {};
        var dateObj = new Date();
        try {
            if (dateObj < cert.ValidToDate && cert.HasPrivateKey() && cert.PrivateKey.ProviderType == '75') {
                var certObj = new CertificateObj(cert);
                oOpt.text = certObj.GetCertString();
            } else {
                continue;
            }
        } catch (ex) {
            alert("Ошибка при получении свойства SubjectName: " + GetErrorMessage(ex));
        }
        try {
            oOpt.value = cert.Thumbprint;
        } catch (ex) {
            alert("Ошибка при получении свойства Thumbprint: " + GetErrorMessage(ex));
        }

        lst.push(oOpt);
    }

    oStore.Close();
    return lst;
}

function CertificateObj(certObj) {
    this.cert = certObj;
    this.certFromDate = new Date(this.cert.ValidFromDate);
    this.certTillDate = new Date(this.cert.ValidToDate);
}
CertificateObj.prototype.check = function(digit) {
    return (digit < 10) ? "0" + digit : digit;
}

CertificateObj.prototype.extract = function(from, what) {
    certName = "";

    var begin = from.indexOf(what);

    if (begin >= 0) {
        var end = from.indexOf(', ', begin);
        certName = (end < 0) ? from.substr(begin) : from.substr(begin, end - begin);
    }

    return certName;
}

CertificateObj.prototype.DateTimePutTogether = function(certDate) {
    return this.check(certDate.getUTCDate()) + "." + this.check(certDate.getMonth() + 1) + "." + certDate.getFullYear()
        + " "
        + this.check(certDate.getUTCHours()) + ":" + this.check(certDate.getUTCMinutes()) + ":" + this.check(
            certDate.getUTCSeconds());
}

CertificateObj.prototype.GetCertString = function() {
    return this.extract(this.cert.SubjectName, 'CN=') + "; Выдан: " + this.GetCertFromDate();
}

CertificateObj.prototype.GetCertFromDate = function() {
    return this.DateTimePutTogether(this.certFromDate);
}

CertificateObj.prototype.GetCertTillDate = function() {
    return this.DateTimePutTogether(this.certTillDate);
}

CertificateObj.prototype.GetPubKeyAlgorithm = function() {
    return this.cert.PublicKey().Algorithm.FriendlyName;
}

CertificateObj.prototype.GetCertName = function() {
    return this.extract(this.cert.SubjectName, 'CN=');
}

CertificateObj.prototype.GetIssuer = function() {
    return this.extract(this.cert.IssuerName, 'CN=');
}

function GetErrorMessage(e) {
    var err = e.message;
    if (!err) {
        err = e;
    } else if (e.number) {
        err += " (0x" + decimalToHexString(e.number) + ")";
    }
    return err;
}
