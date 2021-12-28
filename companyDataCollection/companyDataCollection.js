// ==UserScript==
// @name          公司数据收集
// @author        岚浅浅
// @description   自用
// @namespace     http://tampermonkey.net/
// @homepageURL   https://github.com/LanQianqian/greasyForkScripts
// @version       2.0.2
// @include        *://search.51job.com/list*
// @include        *://www.liepin.com/zhaopin*
// @include        *://www.qcc.com/web/search?key=*
// @grant         GM_addStyle
// @license       GPL-3.0 License
// @require       https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.min.js
// @require       https://cdn.bootcdn.net/ajax/libs/underscore.js/1.13.1/underscore.min.js
// ==/UserScript==
// jshint esversion: 6

$(function () {
    let IS_DEBUG = false;

    let TOOLBAR_CSS = `
            #toolbar {
                z-index: 999999;
                position: fixed;
                top: 10px;
                left: 10px;
                width: 120px;
                opacity: 0.6;
                border: 1px solid #a38a54;
                border-radius: 3px;
                background-color: white
            }
            .clickable a {
                cursor: pointer;
            }
        `;
    let TOOLBAR_HTML = `
            <div id='toolbar' class="clickable" style="display:flex;flex-direction:column">
                <div style="margin:2px auto">
                    <a id="start-btn" style="margin:auto">开始收集</a>
                </div>
            </div>
        `;

    let IS_51JOB = location.href.indexOf("search.51job.com/list") > 0;
    let IS_LIEPIN = location.href.indexOf("www.liepin.com/zhaopin") > 0;
    let IS_QCC = location.href.indexOf("www.qcc.com/web") > 0;

    let Start = {
        init() {
            if (!IS_51JOB && !IS_LIEPIN) {
                return;
            }
            GM_addStyle(TOOLBAR_CSS);
            $('body').append(TOOLBAR_HTML);
            Start.registerEvent();
        }, registerEvent() {
            $(document).on('click', '#start-btn', function () {
                let companyNames = [];
                if (IS_51JOB) {
                    let companyNameNodes = $(".j_joblist").find(".er");
                    let count = IS_DEBUG ? 3 : companyNameNodes.length;
                    for (let i = 0; i < count; i++) {
                        let companyNameNode = $(companyNameNodes[i]).find(".cname");
                        if (companyNameNode.length > 0) {
                            companyNames.push($(companyNameNode[0]).text().replace("...", ""));
                        }
                    }
                } else if (IS_LIEPIN) {
                    let companyNameNodes = $(".company-name");
                    let count = IS_DEBUG ? 3 : companyNameNodes.length;
                    for (let i = 0; i < count; i++) {
                        let companyNameNode = companyNameNodes[i];
                        companyNames.push($(companyNameNode).text().trim());
                    }
                }
                let companyNameStrs = JSON.stringify(Array.from(new Set(companyNames)));
                window.open(`https://www.qcc.com/web/search?key=${encodeURI(companyNameStrs)}`);
            });
        }
    };

    let Collect = {
        init() {
            if (!IS_QCC) {
                return;
            }
            mask();
            GM_addStyle(TOOLBAR_CSS);
            let companyNameStrs = getParamValue('key');
            if (!companyNameStrs) {
                return;
            }
            let companyNames = JSON.parse(decodeURI(companyNameStrs));
            let remainProgress = companyNames.length * 2;
            let companyDatas = [];
            let detailCallback = function (response) {
                let html = $.parseHTML(response, true);
                let script = $(html).get(28).getInnerHTML();
                let matches = script.match(/__INITIAL_STATE__=({.+});\(function/);
                if (!matches) {
                    return;
                }
                let result = JSON.parse(matches[1]);
                let companyBrief = result.company.companyDetail;
                let companyData = {
                    name: companyBrief.Name,
                    phoneNumber: companyBrief.ContactInfo.PhoneNumber,
                    scale: companyBrief.profile.Info
                };
                if (!companyData.phoneNumber) {
                    return;
                }
                companyDatas.push(companyData);
                remainProgress--;
                if (remainProgress === 0) {
                    let companyDataStrs = _.map(companyDatas, function (v) {
                        return `${v.name}\t${v.phoneNumber}\t${v.scale}`;
                    }).join('\n');
                    $("body").append(`
                            <div id='toolbar' class="clickable" style="display:flex;flex-direction:column">
                                <div style="margin:2px auto">
                                    <span style="margin:auto">收集完毕</span>
                                </div>
                                <div style="margin:2px auto" class="showmsg">
                                    <textarea id="result" style="font-size:10px;width:120px;height:100px">${companyDataStrs}</textarea>
                                </div>
                            </div>
                        `);
                    unmask();
                }
            };
            let seachCallback = function (response) {
                let html = $.parseHTML(response, true);
                let script = $(html).get(22).getInnerHTML();
                let matches = script.match(/__INITIAL_STATE__=({.+});\(function/);
                if (!matches) {
                    remainProgress--;
                    return;
                }
                let result = JSON.parse(matches[1]);
                let companyBriefs = result.search.searchRes.Result;
                if (!companyBriefs) {
                    remainProgress--;
                    return;
                }
                let companyBrief = companyBriefs[0];
                let keyNo = companyBrief.KeyNo;
                remainProgress--;
                getRequest(`https://www.qcc.com/firm/${keyNo}.html`, detailCallback);
            };
            _.each(companyNames, function (companyName) {
                getRequest(`https://www.qcc.com/web/search?key=${encodeURI(companyName)}`, seachCallback);
            });
        }
    };

    Start.init();
    Collect.init();

    function getParamValue(key, url) {
        let query = url ? url.split('?')[1] : location.search.substring(1);
        let params = query.split('&');
        for (let param of params) {
            let pair = param.split('=');
            if (pair[0] === key) {
                return pair[1];
            }
        }
        return ('');
    }

    function getRequest(url, callback) {
        $.ajax({
            type: 'GET', url: url, xhrFields: {
                withCredentials: true
            }, success: callback
        });
    }

    function mask(obj) {
        if (!obj) {
            obj = 'body';
        }
        let hoverdiv = '<div class="divMask" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; background: #EEEEEE;opacity: 0.5; filter: alpha(opacity=40);z-index:5;"></div>';
        $(obj).wrap('<div class="position:relative;"></div>');
        $(obj).before(hoverdiv);
        $(obj).data("mask", true);
    }

    function unmask(obj) {
        if (!obj) {
            obj = 'body';
        }
        if ($(obj).data("mask") == true) {
            $(obj).parent().find(".divMask").remove();
            $(obj).unwrap();
            $(obj).data("mask", false);
        }
        $(obj).data("mask", false);
    }
});
