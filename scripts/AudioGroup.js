//AudioGroup class
function run_AudioGroup(global) {

	var manager = global.audioManager;
	
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

	AudioGroup.prototype.play= function() {

		if (this.playStyle== 'random') {
			this.playRandom();
		}
		else if (this.playStyle== 'sequence') {
			this.playSequence();
		}
		else {

			var clip= this.clips[this.index];
			var sound = manager.play(clip, this.volume, this);
			this.temp.push(sound);
			/*
			var newNode= sounds[clip].cloneNode();
			newNode.volume= this.volume * sounds[clip].volume;

			newNode.addEventListener('ended', function end() {
				that.temp.splice(that.temp.indexOf(this), 1);
				this.remove();
				newNode.removeEventListener('ended', end);
			});

			newNode.play()

			this.temp.push(newNode);
			*/
		}
	}

	AudioGroup.prototype.playRandom= function () {

		var random= Math.floor(Math.random() * (this.clips.length - 1)) + 1;
		var clip = this.clips[random];
		var sound = manager.play(clip, this.volume, this);
		this.temp.push(sound);

		this.index = random;
/*
		var that= this;
		
		var random= Math.floor(Math.random() * this.clips.length);
		var clip= this.clips[random];
		var newNode= clip.cloneNode();
		newNode.volume= this.volume * clip.volume;

		newNode.addEventListener('ended', function end() {
			that.temp.splice(that.temp.indexOf(this), 1);
			this.remove();
			newNode.removeEventListener('ended', end);
		});

		newNode.play();

		this.index= random;
		this.temp.push(newNode);
		*/
	}

	AudioGroup.prototype.playSequence= function() {

		var clip = this.clips[this.index];
		manager.play(clip, this.volume, this);

/*
		var clip = this.clips[this.index];
		var newNode= clip.cloneNode();
		newNode.volume= this.volume * clip.volume;

		newNode.addEventListener('ended', function end() {
			that.temp.splice(that.temp.indexOf(this), 1);
			this.remove();
			newNode.removeEventListener('ended', end);
		});

		newNode.play()

		this.temp.push(newNode);
*/

		this.index++;
		this.index= this.index%this.clips.length;
	
	}

	AudioGroup.prototype.onEnd = function(sound) {

		var index = this.temp.indexOf(sound);

		if (index >= 0) {
			this.temp[index] = this.temp[this.temp.length - 1];
			this.temp.length--;
		}
	}

	AudioGroup.prototype.stop= function() {
		
		for (var i= 0; i < this.temp.length; i++) {
			this.temp[i].pause();
			if (this.temp[i].endEvent) this.temp[i].endEvent();
		}

		this.temp= [];

	}

	AudioGroup.prototype.fadeTo = function(volume, length) {

		for (var i= 0; i < this.temp.length; i ++) {
			this.temp[i].fadeTo(volume, length);
		}
	}

	function fadeTo(element, volume, length) {
	    
	    if (element.interval) {
	        element.clearInterval();
	    }
	    
	    element.toVolume = volume;
	    var fromVolume = element.volume;
	    var fadeStart = Date.now();
	    
	    element.interval = setInterval(function() {
	        
	        var progress = (Date.now() - fadeStart) / length;
	        
	        if (progress < 1) {
	        
	            element.volume = Math.smoothStep(fromVolume, volume, progress);
	        }
	        else {
	            
	            element.volume = volume;
	            element.toVolume = undefined;
	            
	            element.clearInterval();
	        }
	        
	    }, 10)

	    element.clearInterval = function() { clearInterval(element.interval); element.interval = null;}
	}

	HTMLAudioElement.prototype.fadeOut= function(length, endVolume) {

		endVolume = endVolume || 0;

		fadeTo(this, 0, length);
	}

	HTMLAudioElement.prototype.fadeIn= function(length, endVolume) {

		endVolume = endVolume || 1;

		fadeTo(this, endVolume, length);

		this.play();
	}

	global.AudioGroup= AudioGroup;

}


//hook the cloneNode function and add some custom procedures to it so we can access the audio later
/*
(function(originalClone) {

	HTMLAudioElement.prototype.cloneNode = function() {

		var newNode = originalClone.call(this);

		newNode.volume = this.volume;

		newNode.addEventListener('ended', function end() {
			this.removeEventListener('ended', end);
			this.remove();
		});

		preload.appendChild(newNode);

		return newNode;
	}

})(HTMLAudioElement.prototype.cloneNode);
*/