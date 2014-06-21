
// if device not ready, wait for device API libraries to load
var device_ready = false;

var app_key = 'com.rjfun.jumprope';
var app_data = {};

var ui_styles = [
'sportkit.css',    
'sportkit-cool.css',    
'sportkit-cartoon.css',    
'sportkit-girl.css' ];

function resetData() {
	app_data.cfg = {
		ui : 0,
		sensor : 0,
		voice_btn : 1,
		voice_count : 1,
		voice_talk : 0
	};
	
	app_data.records = [];
	
	app_data.notfirstrun = null;
}

function loadData() {
	var data_str = localStorage.getItem( app_key );
	if( data_str ) {
		app_data = JSON.parse( data_str );
	} else {
		resetData();
	}
}

function saveData() {
	localStorage.setItem( app_key, JSON.stringify(app_data) );
}

function startCount() {
	if(! hotjs.motion.isWatching()) {
		if( app_data.cfg.voice_count ) hotjs.voice.say('start');
		
		hotjs.motion.startWatch();
		
		$("#countpage_msg").html( '正在计数...' );
		$('#startstop').text('结束');
		$('#counter').html( 0 );
		$('#energy').html( 0 );
		$('#time').html( '0:00:00' );
	}
}

function stopCount() {
	if(hotjs.motion.isWatching()) {
		if( app_data.cfg.voice_count ) hotjs.voice.say('stop');
		
		hotjs.motion.stopWatch();
		
		$('#startstop').text('开始');
		$("#countpage_msg").html( '准备好了吗？' );
	}
}

function countNumber(n) {
	$('#counter').html( n );
	$('#energy').html( (hotjs.motion.getDeltaSeconds() / 60.0 * 60.0 / 60.0).toFixed(2) );

	// if number too big, count every 2
	if((n > 100) && (n % 2 == 1)) return;
	
	if( app_data.cfg.voice_count ) hotjs.voice.countNumber( n );
}

function updateDataShow( accel ) {
	$('#time').html( hotjs.motion.getDeltaTimeString() );
};

function onMotionError() {
	$("#countpage_msg").html( '运动感应错误' );
};

function drawRecords() {
	var canvas = document.getElementById( 'records_canvas' );
	if(! canvas) return;

	var w = canvas.width, h = canvas.height;
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0,0, w, h);
	
	var cx = w / 30 -1;
	var n = 30;
	ctx.fillStyle = 'green';
	for(var i=0; i<n; i++) {
		var ch = h * (0.4 + 0.6*Math.random());
		if(Math.random() < 0.1) ch = 0;
		var x = (cx +1) * i;
		var y = h - ch;
		ctx.fillRect(x, y, cx, ch);
	}
}

function shareVia( via ) {
	var msg = $('textarea#sharemsg').text();
	var subject = "晒纪录";
	var img = null;
	var link = null;
	
	if(window.plugins && window.plugins.socialsharing) {
		switch(via) {
		case 'shareviawechat':
		case 'shareviaweibo':
		case 'shareviasms':
		case 'shareviaqq':
		case 'shareviaother':
			window.plugins.socialsharing.share(msg, subject, img, link);
		}
	} else {
		alert('social sharing plugin not ready.\n\n' + subject + '\n' + msg);
	}
}

function showPage( pgid ) {
	$('div.page').hide();
	$('div#' + pgid).show();
}

function updateSettings() {
	$('.opt').each(function(i){
		var k = $(this).attr('k');
		var v = $(this).attr('v');
		var cfg_v = app_data.cfg[ k ];
		
		if($(this).attr('type') == 'checkbox') {
			if(v == cfg_v) {
				this.checked = true;
			} else {
				this.checked = false;
			}
		} else {
			if(v == cfg_v) {
				$(this).addClass('selected');
			} else {
				$(this).removeClass('selected');
			}
		}
	});
}

function applyUIStyle( n ) {
	var url = 'sportkit.css';
	switch( app_data.cfg.ui ) {
	case '1':
	case '2':
	case '3':
		url = ui_styles[ n ];
		console.log( url );
		break;
	case '0':
	default:
		break;
	}
	$('link').each(function(){
		if(($(this).attr('rel') == 'stylesheet') && ($(this).attr('type')=='text/css')) {
			$(this).attr('href', url);
			console.log( 'style = ' + url );
		}
	});
}

function applySettings() {
	// sensor
	var s = 0.4;
	switch( app_data.cfg.sensor ) {
	case '1': 
		s = 0.2; break;
	case '3': 
		s = 0.6; break;
	case '2': 
	default:
		s = 0.4; break;
	}
	hotjs.motion.setMotionSensity( s );
	
	// UI style
	applyUIStyle( app_data.cfg.ui );
	
	// voice, no need, when say, will check
}

function saveSettings() {
	app_data.cfg = {
			ui : 0,
			sensor : 0,
			voice_btn : 0,
			voice_count : 0,
			voice_talk : 0
	};
	$('input.opt').each(function(i){
		var k = $(this).attr('k');
		var v = $(this).attr('v');
		if( this.checked ) {
			app_data.cfg[ k ] = v;
			console.log( k + ' = ' + v + ',' + typeof(v) );
		}
	});

	applySettings();
	saveData();
}

function initUIEvents() {
	var isMobile = ( /(android|ipad|iphone|ipod)/i.test(navigator.userAgent) );
	var press = isMobile ? 'touchstart' : 'mousedown';
	
	// homepage
	$('#startsport').on(press,function(){
		showPage('countpage');
		adjustUI();

		$("#countpage_msg").html( '准备好了吗？' );
		if( app_data.cfg.voice_count ) hotjs.voice.say('ready');
	});
	
	$('#settings').on(press,function(){
		showPage('settingspage');
	});
	
	$('#trainer').on(press,function(){
		showPage('trainerpage');
	});
	
	$('.share').on(press,function(){
		showPage('sharepage');
	});
	
	$('#myrecords').on(press,function(){
		showPage('recordpage');
		
		drawRecords();
	});
	
	$('.backhome').on(press, function(){
		if(hotjs.motion.isWatching()) {
			stopCount();
		}

		showPage('homepage');
	});
	
	// trainer page
	$('#benefit').on(press, function(){
		showPage('benefitpage');
	});
	
	// count page
	$('#startstop').on(press, function() {
		if(! device_ready) return;
		
		if(hotjs.motion.isWatching()) {
			stopCount();
		} else {
			startCount();
		}
	});
	
	$('#pause').on(press, function(){
		var isp = ! hotjs.motion.isPaused();
		hotjs.motion.pauseCount( isp );
		if( app_data.cfg.voice_count ) hotjs.voice.say( isp ? 'pause' : 'continue');
		$('#pause').html( isp ? '继续' : '暂停' );
	});
	
	// settings page
	$('td.opt').on(press,function(){
		
		var item = $(this);
		var k = item.attr('k');
		var v = item.attr('v');
		var ischecked = false;
		console.log(k + '=' + v + ' clicked');
		$('input.opt').each(function(i){
			if($(this).attr('k') != k) return;
			if($(this).attr('v') === v) {
				ischecked = ! this.checked;
				this.checked = ischecked;
			} else {
				this.checked = false;
			}
		});
		$('td.opt').each(function(i){
			if($(this).attr('k') != k) return;
			if($(this).attr('v') === v) {
				if(ischecked) {
					$(this).addClass('selected');
				} else {
					$(this).removeClass('selected');
				}
			} else {
				$(this).removeClass('selected');
			}
		});
		
		if(k == 'ui') {
			applyUIStyle( v );
		}
	});
	
	$('#settings_save').on(press, function(){
		// save settings
		saveSettings();
		
		showPage('homepage');
	});
	$('#settings_cancel').on(press, function(){
		// restore settings
		updateSettings();
		
		showPage('homepage');
	});
	
	$('.sharevia').on(press,function(){
		var id = $(this).attr('id');
		console.log(id + ' clicked');
		
		shareVia( id );
	});
	
	$('.btn,td.opt').on(press, function(){
		if(!! app_data.cfg.voice_btn) hotjs.voice.say('click');
	});
}

function adjustUI() {
	var xy = $('img#motion_canvas_bg').offset();
	
	$('canvas#motion_canvas').css({
		left: xy.left,
		top: xy.top
	});
}

function main() {
    hotjs.Ad.init();
    
    loadData();
    updateSettings();
    applySettings();
    
    initUIEvents();
    
	hotjs.motion.setMotionCanvas( 'motion_canvas', 300, 100 );
	hotjs.motion.setMotionCallback( updateDataShow, onMotionError );
	hotjs.motion.setCountCallback( countNumber );

	$(window).resize( adjustUI );
	
	hotjs.voice.say('happymood');
	device_ready = true;
	
	window.setTimeout(function(){
		if( app_data.notfirstrun ) {
			showPage('homepage');
		} else {
			showPage('benefitpage');
			app_data.notfirstrun = true;
			saveData();
		}
		
	},1000);
}
