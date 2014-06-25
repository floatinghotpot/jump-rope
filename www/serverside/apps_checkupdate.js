
var apps = apps || {};

apps['com.rjfun.jumprope'] = {
	name : '天天跳绳',
	icon : 'http://rjfun.com/jumprope/icon.png',
	desc : '智能跳绳App，自动语音计数，运动达人健身神器',
	android : {
		version : '1.0.20140625',
		vercode : 20140625,
		url : 'http://rjfun.com/jumprope/jumprope-1.0.20140625.apk'
	},
	ios : {
		version : '1.0.20140625',
		vercode : 20140625,
		url : "javascript:doAlert('已提交苹果审核，敬请期待！');" 
		// url: 'https://itunes.apple.com/us/app/jing-dian-wu-zi-qi/id650241502?l=zh&ls=1&mt=8'
	}
};

// Note: all apps using applist need have following items:
// app_key, like 'com.rjfun.jumprope'
// app_vercode, like 20140622
// app_data.versionAsked
// saveData(); 

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

function listApp( div_id ) {
	var html = "";
	var platforms = ['android', 'ios'];
	
	for(var k in apps) {
		var appitem = apps[k];
		
		html += "<p><img src='" + appitem.icon + "'/>" + '<br/>' + appitem.name + '<br/>介绍: ' + appitem.desc + '<br/>下载: <ul>';
		for(var i=0; i<platforms.length; i++) {
			var platform = platforms[i];
			var veritem = appitem[ platform ];
			if(veritem && veritem.url) {
				html += "<li><a href=\"" + veritem.url + "\">" + platform + "版</a>, v" + veritem.version + "</li>";
			}
		}
		html += '<ul></p>';
	}
	
	var div = document.getElementById( div_id );
	div.innerHTML = html;
}

// now check version update
function checkUpdate( manual_check ) {
	if(manual_check == null) manual_check = true;
	
	// not from an cordova apps, ignore
	if(! app_key) return;
	if(! app_vercode) return;
	
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
	
	var ask = true;
	if(! manual_check) {
		if(app_data && saveData) {
			if(app_data.versionAsked >= veritem.vercode) ask = false;
		}
	}
	if(! ask) return;

	doConfirm(
		'发现新版本: \n' + appitem.name + ' v' + veritem.version + ', \n要更新吗？',
		'可以更新',
		function() {
			openURL( veritem.url );
		}, function() {
			if (app_data && saveData) {
				app_data.versionAsked = veritem.vercode;
				saveData();
			}
		});
}

checkUpdate( false );
