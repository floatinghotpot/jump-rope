
// if device not ready, wait for device API libraries to load
var device_ready = false;

function onClickStartStop() {
	if(! device_ready) return;
	
	if(hotjs.motion.isWatching()) {
		hotjs.voice.say('stop');
		
		hotjs.motion.stopWatch();
		
		$('#startstop').text('开始');
		$("#accelerometer").html( '准备就绪' );
	} else {
		hotjs.voice.say('start');
		
		hotjs.motion.startWatch();
		
		$("#accelerometer").html( '正在计数...' );
		$('#startstop').text('结束');
		$('#counter').html( 0 );
		$('#energy').html( 0 );
		$('#time').html( '0:00:00' );
	}
}

function onClickPause() {
	hotjs.voice.say('pause');
	
	if(! device_ready) return;
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

function main() {
    hotjs.Ad.init();
    
	hotjs.motion.setMotionCanvas( 'motion_canvas', 300, 100 );
	hotjs.motion.setMotionCallback( updateDataShow, onMotionError );
	hotjs.motion.setCountCallback( countNumber );

	device_ready = true;
	$("#accelerometer").html( '准备就绪' );
	hotjs.voice.say('ready');
}
