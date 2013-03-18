Ambience.App.Adventure.prototype.upgrade = function() {
	Ambience.App.Adventure.upgraders[this.version].call(this);
};

Object.defineProperty(Ambience.App.Adventure.prototype, 'isObsolete', {
	get: function() {
		return this.version < Ambience.App.Adventure.version;
	}
});

Ambience.App.Adventure.upgraders = {
	1: function() {
		delete this.media;
		
		this.scenes.forEach(function(scene) {
			scene.background = { color: scene.background };
			
			scene.fade = {
				direction: scene.fadeDirection,
				duration: scene.fade
			};
			delete scene.fadeDirection;
			
			delete scene.media;
			
			scene.sound.tracks.forEach(function(track) {
				delete track.isPlayable;
			});
		});
	}
};

for ( var version in Ambience.App.Adventure.upgraders ) {
	var upgrader = Ambience.App.Adventure.upgraders[version];
	Ambience.App.Adventure.upgraders[version] = function() {
		upgrader.call(this, arguments);
		this.version = Number(version) + 1;
		// A recursive call should be made if the adventure needs to be upgraded by more than one version.
	};
}