function run_AudioManager(global) {

	var sounds = global.sounds;

	var manager = global.audioManager = { 

		sounds: {},
		webAudio: {},
	}


	manager.play = function(sound, volume, listener) {

		if (volume === undefined) volume = 1;

		var sounds = this.sounds[sound];
		volume *= sounds[0].volume;

		//find copy of sound that is not playing
		for (var i = 1; i < sounds.length; i++) {

			//check if sound is playing
			if (!sounds[i].paused && sounds[i].currentTime) continue;
			else {
				sounds[i].currentTime = 0;
				playSound(sounds[i], volume, listener);
				return sounds[i];
			}
		}

		//if we didn't find a version that's not playing, create a new one
		var newSound = this.copy(sound);
		playSound(newSound, volume, listener);

		return newSound;
	}

	manager.playWebAudio = function(sound, volume, delay) {

		if (!global.audioContext) return;

		var gainNode = global.audioContext.createGain();
		gainNode.gain = volume;

		var sourceNode = global.audioContext.createBufferSource();
		sourceNode.buffer = this.webAudio[sound];

		sourceNode.connect(gainNode);
		gainNode.connect(global.audioContext.destination);

		sourceNode.start(global.audioContext.currentTime + (delay || 0));

		return gainNode;
	}

	manager.copy = function(sound) {

		var newSound = this.sounds[sound][0].cloneNode();

		newSound.preload = 'auto';
		preload.append(newSound);

		newSound.pause();
		newSound.currentTime = 0;

		//hack to preload sounds
		newSound.volume = 0;
		newSound.play();

		this.sounds[sound].push(newSound);

		return newSound;
	}

	function playSound(sound, volume, listener) {

		sound.volume = volume;

		if (listener) {

			sound.endEvent = function(event) {

				if (listener.onEnd) listener.onEnd(this);

				this.removeEventListener('ended', sound.endEvent);

			}

			sound.addEventListener('ended', sound.endEvent);
		}

		sound.play();
	}

}