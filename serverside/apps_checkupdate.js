
var apps = apps || {};

apps['com.rjfun.jumprope'] = {
	name : '天天跳绳',
	icon : 'http://rjfun.com/jumprope/icon.png',
	screenshot : 'http://rjfun.com/jumprope/screenshot.jpg',
	desc : "智能跳绳App，自动语音计数，运动达人健身神器。什么是智能跳绳？且看《<a href='http://mp.weixin.qq.com/s?__biz=MzAxNDAwMTMzMw==&mid=200257052&idx=1&sn=2233e605c719bea86f167f768681dc98&scene=2&from=timeline&isappinstalled=0#rd'>西门吹雪与智能跳绳</a>》。",
	android : {
		version : '1.0.20140630',
		vercode : 20140630,
		url : 'http://rjfun.com/jumprope/jumprope-1.0.20140630.apk'
	},
	ios : {
		version : '1.0.20140627',
		vercode : 20140627,
		url : "javascript:doAlert('已提交苹果审核，敬请期待！');" 
		// url: 'https://itunes.apple.com/cn/app/tian-tian-tiao-sheng/id892775490?l=zh&ls=1&mt=8'
	}
};

function doAlert(msg, title) {
	if(navigator && navigator.notification && navigator.notification.alert) {
		navigator.notification.alert(msg, function(){}, title);
	} else {
		alert(msg);
	}
}

function doConfirm(msg, title, okfunc, cancelfunc) {
	if(navigator && navigator.notification && navigator.notification.confirm) {
		navigator.notification.confirm(msg, function(btnIndex){
			if(btnIndex == 1) okfunc();
			else cancelfunc();
		}, title);
	} else {
		if(confirm(msg)) okfunc();
		else cancelfunc();
	}
}

function openURL( url ) {
	if (typeof navigator !== "undefined" && navigator.app) {
		// Mobile device.
		navigator.app.loadUrl(url, {
			openExternal : true
		});
	} else {
		// Possible web browser
		window.open(url, "_blank");
	}
}


// Note: all apps using applist need have following items:
// app_key, like 'com.rjfun.jumprope'
// app_vercode, like 20140622
// app_data.versionAsked
// saveData(); 

function listApp( div_id ) {
	var html = "";
	var platforms = ['android', 'ios'];
	
	for(var k in apps) {
		var appitem = apps[k];
		
		html += "<p><div><img src='" + appitem.icon + "' style='float:left;margin:5px;'/>" + 
		'<br/><strong>' + appitem.name + '</strong>' +
		'<br/>介绍: ' + appitem.desc + '</div>' +
		'<br/>下载: <ul>';
		for(var i=0; i<platforms.length; i++) {
			var platform = platforms[i];
			var veritem = appitem[ platform ];
			if(veritem && veritem.url) {
				html += "<li><a href=\"" + veritem.url + "\">" + platform + "版</a>, v" + veritem.version + "</li>";
			}
		}
		html += '</ul>';
		html += "<img width=300 src='" + appitem.screenshot + "'/></p>";
	}
	
	var div = document.getElementById( div_id );
	div.innerHTML = html;
}

// now check version update
function checkUpdate( manual_check ) {
	if(manual_check == null) manual_check = true;
	
	// not from an cordova apps, ignore
	if(typeof app_key == 'undefined') return;
	if(typeof app_vercode == 'undefined') return;
	if(typeof app_data !== 'object') return;
	if(typeof saveData !== 'function') return;
	
	var platform = 'android';
	if( /(android)/i.test(navigator.userAgent) ) platform = 'android';
	else if( /(iphone|ipad|ipod)/i.test(navigator.userAgent) ) platform = 'ios';
	
	var platform = 'android';
	if( /(android)/i.test(navigator.userAgent) ) platform = 'android';
	else if( /(iphone|ipad|ipod)/i.test(navigator.userAgent) ) platform = 'ios';

	var appitem = apps[ app_key ];
	if(! appitem) return;
	
	var veritem = appitem[ platform ];
	if(! veritem) return;

	// already newer version
	if(app_vercode >= veritem.vercode) {
		if(manual_check) doAlert('这已经是最新版本了。', '无需更新');
		return;
	}
	
	var needAsk = (!! manual_check) 
			|| (! app_data.versionAsked)
			|| (app_data.versionAsked < veritem.vercode);
	if(! needAsk) return;

	doConfirm(
		'发现新版本: \n' + appitem.name + ' v' + veritem.version + ', \n要更新吗？',
		'可以更新',
		function() {
			openURL( veritem.url );
		}, function() {
			app_data.versionAsked = veritem.vercode;
			saveData();
		});
}

checkUpdate( false );
