
var apps = apps || {};

apps['com.rjfun.jumprope'] = {
	name : '天天跳绳',
	icon : 'http://rjfun.com/jumprope/jumprope.png',
	desc : '运动达人健身神器，自动语音计数，无线跳绳App',
	android : {
		version : '1.0.20140622',
		vercode : 20140622,
		url : 'http://rjfun.com/jumprope/jumprope-1.0.apk'
	},
	ios : {
		version : '1.0.20140622',
		vercode : 20140622,
		url : 'https://itunes.apple.com/us/app/jing-dian-wu-zi-qi/id650241502?l=zh&ls=1&mt=8'
	}
};

// Note: all apps using applist need have following items:
// app_key, like 'com.rjfun.jumprope'
// app_vercode, like 20140622
// app_data.versionAsked
// saveData(); 

// now check version update
function checkUpdate( notauto ) {
	if(notauto == null) notauto = true;
	
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
	if(app_vercode >= veritem.vercode) return;
	
	var ask = true;
	if( notauto ) ask = true;
	else {
		if(app_data && saveData) {
			if(app_data.versionAsked >= veritem.vercode) ask = false;
		}
	}
	if(! ask) return;
	
	if(confirm('发现新版本: \n'+ appitem.name +' v'+ veritem.version +', \n要升级吗？')) {
		if (typeof navigator !== "undefined" && navigator.app) {
	        // Mobile device.
	        navigator.app.loadUrl(veritem.url, {openExternal: true});
	    } else {
	        // Possible web browser
	        window.open(veritem.url, "_blank");
	    }
	} else {
		if(app_data && saveData) {
			app_data.versionAsked = veritem.vercode;
			saveData();
		}
	}
}

checkUpdate( false );
