
hotjs = hotjs || {};
hotjs.voice = hotjs.voice || {};

(function(){
	
//Method 1: get path using the last loaded script, 
//remember, we must append script in resource preloading.
function getCurrentScriptPath() {
	var scripts = document.getElementsByTagName("script");
	var n = scripts.length;
	while( n > 0 ) {
		n --;
		var url = scripts[ n ].src;
		if( url.indexOf('game.js') >= 0 ) return url;
	}
	return '';
}

//Method 2: get with error exception
function getCurrentScriptPath2() {
	var url = '';
	try {
		throw Error("get js path");
	}catch(ex){
		if(ex.fileName) { //Firefox
			url = ex.fileName;
		} else if(ex.sourceURL) { //Safari
			url = ex.sourceURL;
		} else if(ex.stack) { //Chrome or IE10+
			url = (ex.stack.match(/at\s+(.*?):\d+:\d+/)||['',''])[1];
		} else {
			// no such info in ex, iOS 5
		}
	}
	return url;
}

var __FILE__ = getCurrentScriptPath() || getCurrentScriptPath2();

function _F(f) {
	return hotjs.getAbsPath(f, __FILE__);
}

function _T(t) {
	return hotjs.i18n.get(t);
}

var fx = {
        '0-':_F('audio/0-.mp3'), 
        '1-':_F('audio/1-.mp3'), 
        '2-':_F('audio/2-.mp3'), 
        '3-':_F('audio/3-.mp3'), 
        '4-':_F('audio/4-.mp3'), 
        '5-':_F('audio/5-.mp3'), 
        '6-':_F('audio/6-.mp3'), 
        '7-':_F('audio/7-.mp3'),
        '8-':_F('audio/8-.mp3'),
        '9-':_F('audio/9-.mp3'),
        '10-':_F('audio/10-.mp3'),
        '0':_F('audio/0.mp3'), 
        '1':_F('audio/1.mp3'), 
        '2':_F('audio/2.mp3'), 
        '3':_F('audio/3.mp3'), 
        '4':_F('audio/4.mp3'), 
        '5':_F('audio/5.mp3'), 
        '6':_F('audio/6.mp3'), 
        '7':_F('audio/7.mp3'),
        '8':_F('audio/8.mp3'),
        '9':_F('audio/9.mp3'),
        '10':_F('audio/10.mp3'),
        '100':_F('audio/100.mp3'),
        '1000':_F('audio/1000.mp3'),
        '10000':_F('audio/10000.mp3'),
        'ready':_F('audio/ready.mp3'),
        'start':_F('audio/start.mp3'),
        'stop':_F('audio/stop.mp3'),
        'pause':_F('audio/pause.mp3')
};

var f = []; for ( var k in fx ) f.push( fx[k] );
resources.preloadFX( f );	

function voiceCount( count ) {
	
	var num = count;
	var numbers = [];
	do {
		numbers.push( num % 10 );
		num = Math.floor( num / 10 );
	} while (num > 0);

    var i = 0;
	while(numbers.length > 0) {
		var n = numbers.pop();
		if(count >= 11 && count <= 19) {
			if((n == 1) && (numbers.length == 1)) n = 10;
		}
		if(count >= 10 && count <= 90) {
			if((n == 0) && (numbers.length == 0)) n = 10;
		}
		
		n += (numbers.length>0) ? '-' : '';
        window.setTimeout(function( key ) {
            resources.playAudio( fx[ key ], true );
        }, i * 200, n );
        i ++;
	}
}

function stopAllAudio() {
	for ( var k in music ) {
		resources.stopAudio( music[k] );
	}
	for ( var k in fx ) {
		resources.stopAudio( fx[k] );
	}
}

function say( what ) {
    resources.playAudio( fx[ what ], true );
}

hotjs.voice.countNumber = voiceCount;
hotjs.voice.stopAllAudio = stopAllAudio;
hotjs.voice.say = say;

})();

