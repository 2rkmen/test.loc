function signVersion() {
    return new Promise(function (resolve, reject) {
        if (cadesplugin.CreateObject) {
            try {
                var about = cadesplugin.CreateObject("CAdESCOM.About");
                resolve(about.Version);
            } catch (e) {
                err(e);
            }
        } else {
            cadesplugin.then(function () {
                return cadesplugin.CreateObjectAsync("CAdESCOM.About");
            }).then(function (about) {
                return about.Version;
            }).then(function (version) {
                console.log(version);
                resolve(version);
            }, err);
        }

        function err(e) {
            console.log(e);
            reject(cadesplugin.getLastError(e));
        }
    });
}

//signVersion().then(function (res) {console.log(res)}, function (err) {console.log(err)});

/**
 * Получить список доступных для подписывания сертификатов
 * @returns {Promise} В случае resolve в параметрах Promise будет массив сертификатов, в случае reject в параметрах будет описание ошибки err.
 */
function signCertList() {
    return new Promise(function (resolve, reject) {
        if (cadesplugin.CreateObject) {
            try {
                var oStore = cadesplugin.CreateObject("CAPICOM.Store");
                oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
                var count = oStore.Certificates.Count;
                var res = [];
                var date = new Date();
                for (var i = 1; i <= count; i++) {
                    var cert = oStore.Certificates.Item(i);
                    if (cert.IsValid().Result && cert.HasPrivateKey() && cert.ValidToDate >= date) {
                        res.push(signGetCert(cert));
                    }
                }
                oStore.Close();
                resolve(res);
            } catch (e) {
                err(e);
            }
        } else {
            cadesplugin.CreateObjectAsync("CAPICOM.Store").then(function (oStore) {
                oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED).then(function () {
                    oStore.Certificates.then(function (Certificates) {
                        Certificates.Count.then(function (count) {
                            var res = [];
                            var date = new Date();
                            var n = 1;
                            for (var i = 1; i <= count; i++) {
                                Certificates.Item(i).then(function (Item) {
                                    signGetCertAsync(Item, true).then(function (cert) {
                                        n++;
                                        if(cert)
                                            res.push(cert);
                                        if(n > count) {
                                            oStore.Close().then(function () {
                                                resolve(res);
                                            }, err)
                                        }
                                    }, err);
                                }, err);
                            }
                        }, err);
                    }, err)
                }, err);
            }, err)
        }
        function err(e) {
            reject(cadesplugin.getLastError(e))
        }
    });

}


/**
 * Подписывание данных
 * @param {String} certId - Идентификатор сертификата
 * @param {String} data - Строка данных которые необходимо подписать
 * @returns {Promise} В случае resolve в параметрах Promise будет объект подписи sign, в случае reject в параметрах будет описание ошибки err.
 */
function signCreate(certId, data) {
    var xmlData =
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<Envelope xmlns="urn:envelope">' +
        '<Data>' +
        data +
        '</Data>' +
        '</Envelope>';
    return new Promise(function (resolve, reject) {
        var algo, oCertificates, oCertificate, oSigner, oStore, oSignedXML, sSignedMessage;
        if (cadesplugin.CreateObject) {
            try {
                oStore = cadesplugin.CreateObject("CAPICOM.Store");
                oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

                oCertificates = oStore.Certificates.Find(
                    cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certId);
                if (oCertificates.Count == 0) {
                    err("Certificate not found: " + certId);
                    return;
                }
                oCertificate = oCertificates.Item(1);

                var pubKey = oCertificate.PublicKey();
                var algoOid = pubKey.Algorithm.Value;
                algo = getAlgo(algoOid);
                if(!algo) {
                    err("Поддерживается подпись сертификатами с алгоритмом ГОСТ Р 34.10-2012, ГОСТ Р 34.10-2001");
                    return;
                }

                oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
                oSigner.Certificate = oCertificate;
                //oSigner.Options = cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN;
                oSignedXML = cadesplugin.CreateObject("CAdESCOM.SignedXML");
                oSignedXML.Content = xmlData;
                // Указываем тип подписи - в данном случае вложенная
                oSignedXML.SignatureType = cadesplugin.CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED;
                // Указываем алгоритм подписи
                oSignedXML.SignatureMethod = algo.signMethod;
                // Указываем алгоритм хэширования
                oSignedXML.DigestMethod = algo.digestMethod;
                sSignedMessage = oSignedXML.Sign(oSigner);
                oStore.Close();
                resolve(fromXML(sSignedMessage));
            } catch (e) {
                err(e);
                return;
            }
        } else {
            cadesplugin.CreateObjectAsync("CAPICOM.Store").then(function (_oStore) {
                oStore = _oStore;
                return oStore.Open(
                    cadesplugin.CAPICOM_CURRENT_USER_STORE,
                    cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
                );
            }).then(function () {
                return oStore.Certificates;
            }).then(function (CertificatesObj) {
                return CertificatesObj.Find(
                    cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH,
                    certId
                );
            }).then(function (_oCertificates) {
                oCertificates = _oCertificates;
                return oCertificates.Count;
            }).then(function (Count) {
                if (Count == 0) {
                    err("Certificate not found: " + certId);
                    return;
                }
                return oCertificates.Item(1);
            }).then(function (_oCertificate) {
                oCertificate = _oCertificate;
                return oCertificate.PublicKey()
            }).then(function (pubKey) {
                return pubKey.Algorithm;
            }).then(function (Algorithm) {
                return Algorithm.Value;
            }).then(function (algoOid) {
                var signMethod, digestMethod;
                algo = getAlgo(algoOid);
                if(!algo) {
                    err("Поддерживается подпись сертификатами с алгоритмом ГОСТ Р 34.10-2012, ГОСТ Р 34.10-2001");
                    return;
                }
                return cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
            }).then(function (_oSigner) {
                oSigner = _oSigner;
                return oSigner.propset_Certificate(oCertificate);
            }).then(function () {
                return oSigner.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN);
            }).then(function () {
                return cadesplugin.CreateObjectAsync("CAdESCOM.SignedXML");
            }).then(function (_oSignedXML) {
                oSignedXML = _oSignedXML;
                return oSignedXML.propset_Content(xmlData);
            }).then(function () {
                // Указываем тип подписи - в данном случае вложенная
                return oSignedXML.propset_SignatureType(cadesplugin.CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED);
            }).then(function () {
                // Указываем алгоритм подписи
                return oSignedXML.propset_SignatureMethod(algo.signMethod);
            }).then(function () {
                // Указываем алгоритм хэширования
                return oSignedXML.propset_DigestMethod(algo.digestMethod);
            }).then(function () {
                return oSignedXML.Sign(oSigner);
            }).then(function (_sSignedMessage) {
                sSignedMessage = _sSignedMessage;
                return oStore.Close();
            }).then(function () {
                resolve(fromXML(sSignedMessage));
            }, err);
        }
        function err(err) {
            reject(cadesplugin.getLastError(err))
        }

        function fromXML(xml) {
            xml = $($.parseXML(xml));
            return {
                //data: data,
                signatureMethod: xml.find("SignatureMethod").attr("Algorithm"),
                digestMethod: xml.find("DigestMethod").attr("Algorithm"),
                digestValue: xml.find("DigestValue").text(),
                signatureValue: xml.find("SignatureValue").text(),
                x509Certificate: xml.find("X509Certificate").text()
            }
        }

        function getAlgo(algoOid) {
            if (algoOid == "1.2.643.7.1.1.1.1") {   // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 256 бит
                return {
                    signMethod: "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256",
                    digestMethod: "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256"
                };
            } else if (algoOid == "1.2.643.7.1.1.1.2") {   // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 512 бит
            } else if (algoOid == "1.2.643.2.2.19") {  // алгоритм ГОСТ Р 34.10-2001
                return {
                    signMethod: cadesplugin.XmlDsigGost3410Url,
                    digestMethod: cadesplugin.XmlDsigGost3411Url
                };
            } else {
                return null;
            }
        }
    });
}

/**
 * Проверка подписанных данных
 * @param {Object} sign Объект подписи
 * @param {String} data Строка данных которые необходимо проверить
 * @returns {Promise} В случае resolve в параметрах будут параметры сертификата который использовался для подписи,
 * в случае reject в параметрах будет описание ошибки.
 */
function signVerify(sign, data) {
    var xml = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<Envelope xmlns="urn:envelope"><Data>' + data + '</Data><Signature xmlns="http://www.w3.org/2000/09/xmldsig#">\n' +
        '<SignedInfo>\n' +
        '<CanonicalizationMethod Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>\n' +
        '<SignatureMethod Algorithm="' + sign.signatureMethod + '"/>\n' +
        '<Reference URI="">\n' +
        '<Transforms>\n' +
        '<Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>\n' +
        '<Transform Algorithm="http://www.w3.org/2001/10/xml-exc-c14n#"/>\n' +
        '</Transforms>\n' +
        '<DigestMethod Algorithm="' + sign.digestMethod + '"/>\n' +
        '<DigestValue>' + sign.digestValue + '</DigestValue>\n' +
        '</Reference>\n' +
        '</SignedInfo>\n' +
        '<SignatureValue>' + sign.signatureValue + '</SignatureValue>\n' +
        '<KeyInfo>\n' +
        '<X509Data>\n' +
        '<X509Certificate>' + sign.x509Certificate + '</X509Certificate>\n' +
        '</X509Data>\n' +
        '</KeyInfo>\n' +
        '</Signature></Envelope>\n';
    var oSignedXML;
    return new Promise(function (resolve, reject) {
        if (cadesplugin.CreateObject) {
            oSignedXML = cadesplugin.CreateObject("CAdESCOM.SignedXML");
            try {
                oSignedXML.Verify(xml);
                var cert = oSignedXML.Signers.Item(1).Certificate;
                resolve(signGetCert(cert));
            } catch (e) {
                err(e);
            }
        } else {
            cadesplugin.CreateObjectAsync("CAdESCOM.SignedXML").then(function (_oSignedXML) {
                oSignedXML = _oSignedXML;
                return oSignedXML.Verify(xml);
            }).then(function () {
                return oSignedXML.Signers;
            }).then(function (Signers) {
                return Signers.Item(1);
            }).then(function (Item) {
                return Item.Certificate;
            }).then(function (cert) {
                return signGetCertAsync(cert, false);
            }).then(function (res) {
                resolve(res);
            }, err);
        }
        function err(e) {
            reject(cadesplugin.getLastError(e))
        }
    });
}

/**
 * Подписывание данных
 * @param {String} certId - Идентификатор сертификата (Thumbprint)
 * @param {String} base64EncodedData - Строка данных которые необходимо подписать (полученная из encodeBase64())
 * @returns {Promise} В случае resolve в параметрах Promise будет объект подписи sign, в случае reject в параметрах будет описание ошибки err.
 */
function signPKCS7(certId, base64EncodedData) {
    return new Promise(function (resolve, reject) {
        if (cadesplugin.CreateObject) {
            try {
                var oStore = cadesplugin.CreateObject("CAPICOM.Store");
                oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
                var oCertificates = oStore.Certificates.Find(
                    cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certId);
                if (oCertificates.Count == 0) {
                    err("Certificate not found: " + certId);
                    return;
                }
                var oCertificate = oCertificates.Item(1);
                var pubKey = oCertificate.PublicKey();
                var algo = pubKey.Algorithm;
                var algoOid = algo.Value;
                if (algoOid != PKCS7Config.algoOid) {
                    err("Выбранный сертификат(с algoOid = '" + algoOid
                        + "') не поддерживает необходимый алгоритм подписи (" + PKCS7Config.algoOid +")");
                    return;
                }
                var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
                oSigner.Certificate = oCertificate;
                oSigner.Options = cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN;
                var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
                oSignedData.ContentEncoding = cadesplugin.CADESCOM_BASE64_TO_BINARY;
                oSignedData.Content = base64EncodedData;
                var sSignedMessage = oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true);
                oStore.Close();
                var sSignature = sSignedMessage;
                resolve(sSignature);
            } catch (e) {
                err(e);
                return;
            }
        } else {
            cadesplugin.CreateObjectAsync("CAPICOM.Store").then(function (oStore) {
                oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED).then(function () {
                    oStore.Certificates.then(function (CertificatesObj) {
                        CertificatesObj.Find(
                            cadesplugin.CAPICOM_CERTIFICATE_FIND_SHA1_HASH, certId).then(function (oCertificates) {
                            oCertificates.Count.then(function (Count) {
                                if (Count == 0) {
                                    err("Certificate not found: " + certId);
                                }
                                oCertificates.Item(1).then(function (oCertificate) {
                                    cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner").then(function (oSigner) {
                                        oSigner.propset_Certificate(oCertificate).then(function () {
                                            //oSigner.propset_Options(cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN).then(function () {
                                                cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData").then(function (oSignedData) {
                                                    oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY).then(function () {
                                                        oSignedData.propset_Content(base64EncodedData).then(function () {
                                                            oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true).then( function (sSignature) {
                                                                oStore.Close().then(function () {
                                                                    resolve(sSignature);
                                                                }, err);
                                                            }, err);
                                                        }, err);
                                                    }, err);
                                                }, err);
                                            //}, err);
                                        }, err);
                                    }, err);
                                }, err);
                            }, err);
                        }, err);
                    }, err);
                }, err);
            }, err);
        }
        function err(err) {
            // reject(cadesplugin.getLastError(err));
            reject(err);
        }
    });
}

function signVerifyPKCS7(sSignature, sDataInBase64ToVerify) {
    return new Promise(function (resolve, reject) {
        if (cadesplugin.CreateObject) {
            var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
            try {
                oSignedData.ContentEncoding = cadesplugin.CADESCOM_BASE64_TO_BINARY;
                oSignedData.Content = sDataInBase64ToVerify;
                oSignedData.VerifyCades(sSignature, cadesplugin.CADESCOM_CADES_BES, true);
                var cert = oSignedData.Signers.Item(1).Certificate;
                resolve(signGetCert(cert));
            } catch (err) {
                alert("Failed to verify signature. Error: " + cadesplugin.getLastError(err));
                return false;
            }
            resolve(true);
        } else {
            cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData").then(function (oSignedData) {
                oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY).then(function () {
                    return oSignedData.propset_Content(sDataInBase64ToVerify);
                }).then(function () {
                    return oSignedData.VerifyCades(sSignature, cadesplugin.CADESCOM_CADES_BES, true);
                }).then(function () {
                    return oSignedData.Signers;
                }).then(function (Signers) {
                    return Signers.Item(1);
                }).then(function (Item) {
                    return Item.Certificate;
                }).then(function (cert) {
                    return signGetCertAsync(cert, false);
                }).then(function (res) {
                    resolve(res);
                }, err);
            }, err);
        }

        function err(e) {
            reject(cadesplugin.getLastError(e));
        }
    });
}

function signGetCert(cert) {
    return {
        certId:        cert.Thumbprint,
        validFromDate: cert.ValidFromDate,
        validToDate:   cert.ValidToDate,
        subjectName:   cert.SubjectName,
        issuerName:    cert.IssuerName,
        providerName:  cert.PrivateKey ? cert.PrivateKey.ProviderName : null,
        algorithm:     cert.PublicKey().Algorithm.FriendlyName
    }
}

function signGetCertAsync(cert, doCheck) {
    return new Promise(function (resolve, reject) {
        Promise.all([
            cert.IsValid(),
            cert.HasPrivateKey(),
            cert.ValidFromDate,
            cert.ValidToDate,
            cert.Thumbprint,
            cert.SubjectName,
            cert.IssuerName,
            doCheck ? cert.PrivateKey : null,
            cert.PublicKey()
        ]).then(function (res) {
            var IsValid = res[0];
            var HasPrivateKey = res[1];
            var ValidFromDate = new Date(res[2]);
            var ValidToDate = new Date(res[3]);
            var Thumbprint = res[4];
            var SubjectName = res[5];
            var IssuerName = res[6];
            var PrivateKey = res[7];
            var PublicKey = res[8];
            Promise.all([
                IsValid.Result,
                PrivateKey ? PrivateKey.ProviderName : null,
                PublicKey.Algorithm
            ]).then(function (res) {
                var Result = res[0];
                var ProviderName = res[1];
                var Algorithm = res[2];
                if (!doCheck || (Result && HasPrivateKey && ValidToDate >= new Date())) {
                    Algorithm.FriendlyName.then(function (FriendlyName) {
                        resolve({
                            certId:        Thumbprint,
                            validFromDate: ValidFromDate,
                            validToDate:   ValidToDate,
                            subjectName:   SubjectName,
                            issuerName:    IssuerName,
                            algorithm:     FriendlyName
                        });
                    }, err);
                } else {
                    resolve(null);
                }
            }, err);
        }, err);
        function err(e) {
            reject(e);
        }
    });
}

function encodeBase64(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}

function decodeBase64(str) {
    return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
