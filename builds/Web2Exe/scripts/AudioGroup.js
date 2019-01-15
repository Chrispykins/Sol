//AudioGroup class
function globalAudioGroup (global) {
	
	function AudioGroup() {

		this.clips= arguments;
		this.playStyle= 'random';
		this.index= 0;

		this.volume= 1;
		this.fadeStart= 0;
		this.volumeDelta= 0;

		//deprecated, copies sound files in group into the object itself
		/*for (var i = 0; i < arguments.length; i++) {
			this[arguments[i]]= global.sounds[arguments[i]].cloneNode();
		}*/

		this.temp= [];
	}

	AudioGroup.prototype.play= function () {

		if (this.playStyle== 'random') {
			this.playRandom();
		}
		else if (this.playStyle== 'sequence') {
			this.playSequence();
		}
		else {
			var clip= this.clips[this.index];
			var newNode= sounds[clip].cloneNode();
			newNode.volume= this.volume * sounds[clip].volume;
			newNode.play()

			this.temp.push(newNode);
		}
	}

	AudioGroup.prototype.playRandom= function () {

		var that= this;
		
		var random= Math.floor(Math.random() * this.clips.length);
		var clip= this.clips[random];
		var newNode= clip.cloneNode();
		newNode.volume= this.volume * clip.volume;

		newNode.addEventListener('ended', function end() {
			that.temp.splice(that.temp.indexOf(this), 1);
			newNode.removeEventListener('ended', end);
		});

		newNode.play();

		this.index= random;
		this.temp.push(newNode);
	}

	AudioGroup.prototype.playSequence= function() {

		var clip = this.clips[this.index];
		var newNode= clip.cloneNode();
		newNode.volume= this.volume * clip.volume;
		newNode.play()

		this.temp.push(newNode);
		this.index++;
		this.index= this.index%this.clips.length;
	}

	AudioGroup.prototype.stop= function() {
		
		for (var i= 0; i < this.temp.length; i++) {
			this.temp[i].pause();
		}

		this.temp= [];
	}



	HTMLAudioElement.prototype.fadeOut= function(length) {

		this.fadeStart= Date.now();
		var origVol= this.volume;

		var loop= setInterval(function() {
			var interpolation = (length - (Date.now() - this.fadeStart))/length
			interpolation= Math.min(1, Math.max(0, interpolation));
			if (interpolation > 0.001) {
				this.volume= interpolation * origVol;
			}
			else {
				this.currentTime= 0;
				this.pause();
				this.volume= 1;
				this.fadeStart= null;
				clearInterval(loop);
			}
		}.bind(this) , 10);
	}

	HTMLAudioElement.prototype.fadeIn= function(length, endVolume) {

		if (!endVolume) {
			endVolume= 1;
		}
		if (this.paused) {
			this.play();
		}

		this.fadeStart= global.Date.now();
		var origVol= this.volume;

		var loop= setInterval(function() {
			var interpolation = (global.Date.now() - this.fadeStart)/length
			interpolation= global.Math.min(endVolume, global.Math.max(0, interpolation));
			if (interpolation < 1) {
				this.volume= interpolation * (endVolume - origVol) + origVol;
			}
			else {
				this.volume= endVolume;
				this.fadeStart= null;
				clearInterval(loop);
			}
		}.bind(this) , 10);
	}

	global.AudioGroup= AudioGroup;

}