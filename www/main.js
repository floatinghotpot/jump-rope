
// if device not ready, wait for device API libraries to load
var device_ready = false;

var app_key = 'com.rjfun.jumprope';
var app_version = '1.0.20140624';
var app_vercode = 20140624;

var app_url = 'http://rjfun.com/jumprope/';
var autorun_url = 'http://rjfun.com/jumprope/autorun.js';

var app_data = {};

function resetData() {
	app_data.cfg = {
		ui : 0,
		sensor : 0,
		voice : 0,
		voice_btn : 1,
		voice_count : 1,
		voice_talk : 0
	};
	
	app_data.records = {};
	
	app_data.maxCount = 0;
	app_data.lastCount = 0;
	app_data.totalCount = 0;
	app_data.totalTime = 0;
	app_data.maxSpeed = 0;
	
	app_data.notfirstrun = null;
}

function mockData() {
	app_data.maxCount = 0;
	app_data.totalCount = 0;
	
	app_data.records = {};
	var now = new Date();
	var year = now.getFullYear();
	var mon = now.getMonth();
	var date = now.getDate();
	for(var i=0; i<100; i++) {
		var d = new Date(year, mon, date-i).getTime();
		var n = Math.round( 200 * (Math.random() * 0.4 + 0.6) );
		if( app_data.maxCount < n ) app_data.maxCount = n;
		app_data.records[ d ] = n * 3;
		app_data.totalCount += n * 3;
	}
	app_data.totalTime = app_data.totalCount / 115.0 * 60; 
	console.log( app_data );
}

function loadData() {
	var data_str = localStorage.getItem( app_key );
	if( data_str ) {
		app_data = JSON.parse( data_str );
	} else {
		resetData();
	}

	if(! app_data.cfg) app_data.cfg = {};
	if(! app_data.cfg.ui) app_data.cfg.ui = 0;
	if(! app_data.cfg.sensor) app_data.cfg.sensor = 0;
	if(! app_data.cfg.voice) app_data.cfg.voice = 0;
	
	if(! app_data.records) app_data.records = {};
	
	if(! app_data.maxCount) app_data.maxCount = 0;
	if(! app_data.lastCount) app_data.lastCount = 0;
	if(! app_data.totalCount) app_data.totalCount = 0;
	if(! app_data.totalTime) app_data.totalTime = 0;
	if(! app_data.maxSpeed) app_data.maxSpeed = 0;
	
	//mockData();
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
		
		var count = hotjs.motion.getCount();
		var time = hotjs.motion.getDurationSeconds();
		if(time > 3) {
			app_data.lastCount = count;
			
			if(! app_data.totalCount) app_data.totalCount = 0;
			app_data.totalCount += count;
			
			if(! app_data.totalTime) app_data.totalTime = 0;
			app_data.totalTime = Math.round(app_data.totalTime + time);
			
			
			if( (! app_data.maxCount) || (app_data.maxCount < count)) {
				app_data.maxCount = count;
			}
			
			var speed = Math.round(count * 60 / time);
			if( (! app_data.maxSpeed) || (app_data.maxSpeed < speed)) {
				app_data.maxSpeed = speed;
			}
		}
		
		var now = new Date();
		var todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
		
		if(app_data.records == null) app_data.records = {};
		var n = app_data.records[ todayTime ];
		if(! n) n = 0;
		n += count;
		app_data.records[ todayTime ] = n;
		
		saveData();
		
		$('#startstop').text('开始');
		$("#countpage_msg").html( '准备好了吗？' );
	}
}

function sportTimeToEnergy( sec ) {
	var myKg = 60.0;
	var standardKg = 60.0;
	var jumpCostPerMin = 12.0;
	return (jumpCostPerMin * (sec / 60.0) * (myKg / standardKg)).toFixed(1);
}

// 1 Kg Fat = 7716 C energy
function energyToFat( e ) {
	return (e / 7.716).toFixed(1);
}

function durationToString(s) {
	s = Math.round(s);
	var m = Math.floor(s / 60); s = s % 60;
	var h = Math.floor(m / 60); m = m % 60;
	
	var str = s;
	if(s < 10) str = '0' + str;
	str = m + ':' + str;
	if(m < 10) str = '0' + str;
	str = h + ':' + str;

	return str;
}

function countNumber(n) {
	$('#counter').html( n );
	
	$('#energy').html( sportTimeToEnergy(hotjs.motion.getDurationSeconds()) );

	// if number too big, count every 2
	if((n > 100) && (n % 2 == 1)) return;
	
	if( app_data.cfg.voice_count ) hotjs.voice.countNumber( n );
}

function updateDataShow( accel ) {
	$('#time').html( durationToString( hotjs.motion.getDurationSeconds() ) );
};

function onMotionError() {
	$("#countpage_msg").html( '运动感应错误' );
};

var offset_month = 0;

function drawRecords( off ) {
	if(! off) off = 0;
	if(! off) offset_month = 0;
	else offset_month += off;
	
	var canvas = document.getElementById( 'records_canvas' );
	if(! canvas) return;

	var now = new Date();
	var themonth = new Date(now.getFullYear(), now.getMonth() + offset_month, 1);
	year = themonth.getFullYear();
	mon = themonth.getMonth();
	$('span#themonth').text( year + '年' + (mon+1) + '月')
	
	var data = [];
	var dataMax = 0;
	for(var i=1; i<=31; i++) {
		var dayTime = (new Date(year, mon, i)).getTime();
		var count = app_data.records[ dayTime ];
		if(! count) count = 0;
		data.push( count );
		if(dataMax < count) dataMax = count;
	}
	var n = data.length;
	
	var w = canvas.width, h = canvas.height;
	var ctx = canvas.getContext("2d");
	//ctx.clearRect(0,0, w, h);
	ctx.fillStyle = 'white';
	ctx.fillRect(0,0, w,h);

	var cx = w / 30 -1;
	ctx.fillStyle = 'green';
	for(var i=0; i<n; i++) {
		var count = data.shift();
		var ch = h * count / dataMax;
		var x = (cx +1) * i;
		var y = h - ch;
		ctx.fillRect(x, y, cx, ch);
	}
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
	var ui_styles = [
	              	'sportkit.css',    
	              	'sportkit-cool.css',    
	              	'sportkit-cartoon.css',    
	              	'sportkit-girl.css' 
	              ];

	var url = 'sportkit.css';
	switch( app_data.cfg.ui ) {
	case '1':
	case '2':
	case '3':
		url = ui_styles[ n ];
		//console.log( url );
		break;
	case '0':
	default:
		break;
	}
	$('link').each(function(){
		if(($(this).attr('rel') == 'stylesheet') && ($(this).attr('type')=='text/css')) {
			$(this).attr('href', url);
			//console.log( 'style = ' + url );
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
	var v = 'robot';
	switch( app_data.cfg.voice ) {
	case '1': v = 'aunt'; break;
	case '2': v = 'uncle'; break;
	case '3': v = 'grandma'; break;
	case '0':
	default:
		v = 'robot'; break;
	}
	hotjs.voice.init( v );
}

function saveSettings() {
	app_data.cfg = {
			ui : 0,
			sensor : 0,
			voice: 0,
			voice_btn : 0,
			voice_count : 0,
			voice_talk : 0
	};
	$('input.opt').each(function(i){
		var k = $(this).attr('k');
		var v = $(this).attr('v');
		if( this.checked ) {
			app_data.cfg[ k ] = v;
			//console.log( k + ' = ' + v + ',' + typeof(v) );
		}
	});

	applySettings();
	saveData();
}

var stackedPages = [];
var currentPage = null;

function showPage( pgid ) {
	$('div.page').hide();
	$('div#' + pgid).show();
	currentPage = pgid;
}

function pushPage( pgid ) {
	if(currentPage != null) stackedPages.push( currentPage );
	showPage( pgid );
}

function popPage() {
	if( stackedPages.length >0) {
		showPage( stackedPages.pop() );
		return true;
	}
	
	return false;
}

function pageBack() {
	if(hotjs.motion.isWatching()) {
		stopCount();
	}
	popPage();
}

function onClickBackHome(e) {
	e.preventDefault(); 
	pageBack();
}

function onClickBackButton(e) {
	e.preventDefault();
	if(!! app_data.cfg.voice_btn) hotjs.voice.say('click');
	
	if(stackedPages.length >0) {
		pageBack();
	} else {
		navigator.app.exitApp();
	}
}

function onClickStartSport(e) {
	e.preventDefault(); 
	pushPage('countpage');
	adjustUI();
	
	$('span.maxcount').text( app_data.maxCount );
	$('span.lastcount').text( app_data.lastCount );

	$("#countpage_msg").html( '准备好了吗？' );
	if( app_data.cfg.voice_count ) hotjs.voice.say('ready');
}

function onClickSettings(e){
	e.preventDefault(); 
	pushPage('settingspage');
}

function onClickMyRecord(e){
	e.preventDefault();
	
	pushPage('recordpage');
	adjustUI();
	if( app_data.cfg.voice_talk ) hotjs.voice.say('amazing');
	
	$('span.maxcount').text( app_data.maxCount );
	$('span.maxspeed').text( app_data.maxSpeed );
	
	$('span#totalcount').text( app_data.totalCount );
	$('span#totaltime').text( durationToString(app_data.totalTime) );
	
	var energy = sportTimeToEnergy( app_data.totalTime );
	$('span#totalenergy').text( energy );
	$('span#totalfat').text( energyToFat( energy ) );
	
	drawRecords();
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function onClickShare(e){
	e.preventDefault(); 
	
	pushPage('sharepage');
	if( app_data.cfg.voice_talk ) hotjs.voice.say('excellent');
	
	var now = new Date();
	var todayTime = (new Date(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
	var count = app_data.records[ todayTime ];
	if(! count) count = 0;

	var days = Object.size( app_data.records );
	
	var sharemsg = "#天天跳绳#再创新纪录！今天跳了" + count + "次！我已坚持 " + days + "天，累计跳绳 " + 
		app_data.totalCount + "次，燃烧脂肪 " + 
		energyToFat(sportTimeToEnergy(app_data.totalTime)) + "克。最高连续跳跃 " + 
		app_data.maxCount + "下，最快速度 " + 
		app_data.maxSpeed + "次／分钟。#运动达人#健身神器，无线跳绳App：" +
		app_url;
	
	$('textarea#sharemsg').text( sharemsg );
}

function onClickBenefit(e){
	e.preventDefault(); 
	pushPage('benefitpage');
}

function onClickMyPlan(e) {
	e.preventDefault(); 
	pushPage('myplanpage');
}

function onClickCheckUpdate(e){
	e.preventDefault(); 
	if(checkUpdate) checkUpdate();
}

function onClickAbout(e){
	e.preventDefault(); 
	pushPage('aboutpage');
}

function onClickToDismiss(e) {
	e.preventDefault(); 
	if(!! app_data.cfg.voice_btn) hotjs.voice.say('click');
	popPage();
}

function onClickHomeTrainer(e) {
	e.preventDefault(); 
	pushPage('trainerpage');
	if( app_data.cfg.voice_talk ) hotjs.voice.say('addoil');
}

function onClickStartStop(e) {
	e.preventDefault(); 
	if(! device_ready) return;
	
	if(hotjs.motion.isWatching()) {
		stopCount();
	} else {
		$('span.maxcount').text( app_data.maxCount );
		$('span.lastcount').text( app_data.lastCount );
		startCount();
	}
}

function onClickPauseContinue(e){
	e.preventDefault(); 
	var isp = ! hotjs.motion.isPaused();
	hotjs.motion.pauseCount( isp );
	if( app_data.cfg.voice_count ) hotjs.voice.say( isp ? 'pause' : 'continue');
	$('#pause').html( isp ? '继续' : '暂停' );
}

function onClickOptionItem(e){
	//e.preventDefault(); 
	
	var item = $(this);
	var k = item.attr('k');
	var v = item.attr('v');
	var ischecked = false;
	//console.log(k + '=' + v + ' clicked');
	$('input.opt').each(function(i){
		if($(this).attr('k') != k) return;
		if($(this).attr('v') === v) {
			if($(this).attr('checkable') != null) ischecked = ! this.checked;
			else ischecked = true;
			
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
}

function onClickSaveSettings(e){
	e.preventDefault(); 
	saveSettings();
	popPage();
}

function onCancelSave(e){
	e.preventDefault(); 
	updateSettings();
	popPage();
}

function doAlert(msg, title) {
	if(navigator && navigator.notification && navigator.notification.alert) {
		navigator.notification.alert(msg, function(){}, title);
	} else {
		alert(msg);
	}
}

function onShareFailed(){
	doAlert('请检查是否安装了相应的APP','未能分享');
}

function onClickShareVia(e){
	e.preventDefault(); 
	var via = $(this).attr('id');
	//console.log(id + ' clicked');
	
	var isios = ( /(ipad|iphone|ipod)/i.test(navigator.userAgent) );

	var msg = $('textarea#sharemsg').text();
	var subject = "天天跳绳晒纪录";
	var img = 'http://rjfun.com/jumprope/jumprope.jpg';
	var link = null;
	
	if(window.plugins && window.plugins.socialsharing) {
		switch(via) {
		case 'shareviasms':
			window.plugins.socialsharing.shareViaSMS(msg, subject, null, link);
			break;
		case 'shareviawechat':
			var shareapp = isios ? 'com.tencent.xin' : 'com.tencent.mm';
			window.plugins.socialsharing.shareVia(shareapp, msg, subject, img, link, null, onShareFailed);
			break;
		case 'shareviaqq':
			var shareapp = isios ? 'com.tencent.qq' : 'qq';
			window.plugins.socialsharing.shareVia(shareapp, msg, subject, img, link, null, onShareFailed);
			break;
		case 'shareviaweibo':
			var shareapp = isios ? 'com.apple.social.sinaweibo' : 'weibo';
			window.plugins.socialsharing.shareVia(shareapp, msg, subject, img, link, null, onShareFailed);
			break;
		case 'shareviaother':
			window.plugins.socialsharing.share(msg, subject, img, link);
		}
	} else {
		alert('social sharing plugin not ready.\n\n' + subject + '\n' + msg);
	}
}

function onClickThisMonth(e){
	e.preventDefault(); 
	drawRecords(0);
}

function onClickLastMonth(e){
	e.preventDefault(); 
	drawRecords(-1);
}

function onClickNextMonth(e){
	e.preventDefault(); 
	drawRecords(+1);
}

function initUIEvents() {
	var isMobile = ( /(android|ipad|iphone|ipod)/i.test(navigator.userAgent) );
	var click = isMobile ? 'touchstart' : 'mousedown';
	
	$(document).on('backbutton', onClickBackButton);
	$('.backhome').on(click, onClickBackHome);
	$('div#aboutpage, div#benefitpage').on(click, onClickToDismiss);

	// homepage
	$('#trainer').on(click, onClickHomeTrainer);
	$('#myrecords').on(click, onClickMyRecord);
	$('#startsport').on(click, onClickStartSport);
	$('.share').on(click, onClickShare);
	$('#settings').on(click, onClickSettings);
	
	// trainer page
	$('#benefit').on(click, onClickBenefit);
	$('#my_plan').on(click, onClickMyPlan);
	$('#checkupdate').on(click, onClickCheckUpdate);
	$('#about').on(click, onClickAbout);
	
	// count page
	$('#startstop').on(click, onClickStartStop);
	$('#pause').on(click, onClickPauseContinue);

	// my records page
	$('#thismonth').on(click, onClickThisMonth);
	$('#lastmonth').on(click, onClickLastMonth);
	$('#nextmonth').on(click, onClickNextMonth);
	
	// settings page
	$('td.opt').on(click, onClickOptionItem);
	$('#settings_save').on(click, onClickSaveSettings);
	$('#settings_cancel').on(click, onCancelSave);
	
	// share page
	$('.sharevia').on(click, onClickShareVia);
	
	$('.btn,td.opt').on(click, function(e){
		e.preventDefault(); 
		if(!! app_data.cfg.voice_btn) hotjs.voice.say('click');
	});

}

// if canvas in table, sometimes it will mess the page, so we make it float over the right position
function adjustUI() {
	var xy = $('img#motion_canvas_bg').offset();
	$('canvas#motion_canvas').css({
		left: xy.left,
		top: xy.top
	});

	xy = $('img#records_canvas_bg').offset();
	$('canvas#records_canvas').css({
		left: xy.left,
		top: xy.top
	});
}

function main() {
	//console.log('enter main');
	
    hotjs.Ad.init();
    hotjs.motion.init();
    
    loadData();
    updateSettings();
    applySettings();
    
    initUIEvents();
    
	hotjs.motion.setMotionCanvas( 'motion_canvas', 300, 100 );
	hotjs.motion.setMotionCallback( updateDataShow, onMotionError );
	hotjs.motion.setCountCallback( countNumber );

	$(window).resize( adjustUI );
	
	showPage('splashpage');
	
	window.setTimeout(function(){
		hotjs.voice.say('happymood');
		device_ready = true;
		
		showPage('homepage');
		
		if( ! app_data.notfirstrun ) {
			pushPage('benefitpage');
			app_data.notfirstrun = true;
			saveData();
		}
		
		hotjs.require( autorun_url );
		
	},2000);
}
