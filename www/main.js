
// if device not ready, wait for device API libraries to load
var device_ready = false;

function startCount() {
	if(! hotjs.motion.isWatching()) {
		hotjs.voice.say('start');
		
		hotjs.motion.startWatch();
		
		$("#accelerometer").html( '正在计数...' );
		$('#startstop').text('结束');
		$('#counter').html( 0 );
		$('#energy').html( 0 );
		$('#time').html( '0:00:00' );
	}
}

function stopCount() {
	if(hotjs.motion.isWatching()) {
		hotjs.voice.say('stop');
		
		hotjs.motion.stopWatch();
		
		$('#startstop').text('开始');
		$("#accelerometer").html( '准备就绪' );
	}
}

function countNumber(n) {
	hotjs.voice.countNumber( n );
	$('#counter').html( n );
	$('#energy').html( (hotjs.motion.getDeltaSeconds() / 60.0 * 60.0 / 60.0).toFixed(2) );
}

function updateDataShow( accel ) {
//	$("#accelerometer").html( ' (X,Y,Z): (' + 
//			accel.x.toFixed(1) + ',' +
//            accel.y.toFixed(1) + ',' +
//            accel.z.toFixed(1) + ')' );
	
	$('#time').html( hotjs.motion.getDeltaTimeString() );
};

function onMotionError() {
	$("#accelerometer").html( '运动感应错误' );
};

//document.addEventListener("deviceready", main, false);

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

function initUI() {
	// homepage
	$('#startsport').on('click',function(){
		showPage('countpage');
	});
	
	$('#settings').on('click',function(){
		showPage('settingspage');
	});
	
	$('#trainer').on('click',function(){
		showPage('trainerpage');
	});
	
	$('.share').on('click',function(){
		showPage('sharepage');
	});
	
	$('.backhome').on('click', function(){
		if(hotjs.motion.isWatching()) {
			stopCount();
		}

		showPage('homepage');
	});
	
	$('#myrecords').on('click',function(){
		showPage('recordpage');
		
		drawRecords();
	});
	
	// count page
	$('#startstop').on('click', function() {
		if(! device_ready) return;
		
		if(hotjs.motion.isWatching()) {
			stopCount();
		} else {
			startCount();
		}
	});
	
	$('#pause').on('click', function(){
		var isp = ! hotjs.motion.isPaused();
		hotjs.motion.pauseCount( isp );
		hotjs.voice.say( isp ? 'pause' : 'start');
		$('#pause').html( isp ? '继续' : '暂停' );
	});
	
	// settings page
	$('td.opt').on('click',function(){
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
	});
	
	$('#settings_save').on('click', function(){
		// save settings
		
		showPage('homepage');
	});
	$('#settings_cancel').on('click', function(){
		// restore settings
		
		showPage('homepage');
	});
	
	$('.sharevia').on('click',function(){
		var id = $(this).attr('id');
		console.log(id + ' clicked');
		
		shareVia( id );
	});
}

function main() {
    hotjs.Ad.init();
    initUI();
    
	hotjs.motion.setMotionCanvas( 'motion_canvas', 300, 100 );
	hotjs.motion.setMotionCallback( updateDataShow, onMotionError );
	hotjs.motion.setCountCallback( countNumber );

	device_ready = true;
	$("#accelerometer").html( '准备就绪' );
	hotjs.voice.say('ready');
}
