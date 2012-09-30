describe('Ambience mixin', function() {
	var ambience;
	
	var background;
	var backgroundNode;
	
	beforeEach(function() {
		backgroundNode = document.createElement('div');
		document.body.appendChild(backgroundNode);
		background = new Ambience.Layer(backgroundNode);
		
		var foregroundNode = document.createElement('div');
		var foreground = new Ambience.Layer(foregroundNode);
		
		ambience = new Ambience(background, foreground);
	});
	
	beforeEach(function() {
		this.addMatchers({
			toBeBetween: function(first, second) {
				var lowest = Math.min(first, second);
				var highest = Math.max(first, second);
				
				return lowest <= this.actual && this.actual <= highest;
			}
		});
	});
	
	afterEach(function() {
		document.body.removeChild(backgroundNode);
	});
	
	it('replaces defined properties', function() {
		var scene = new Ambience.Scene();
		scene.text = 'Test';
		ambience.play(scene);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.text = 'Mixin';
		ambience.play(mixin);
		
		expect(backgroundNode.querySelector('.text').textContent).toBe('Mixin');
	});
	
	it('retains undefined properties', function() {
		var scene = new Ambience.Scene();
		scene.text = 'Test';
		ambience.play(scene);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.image = 'test-image.jpg';
		ambience.play(mixin);
		
		expect(backgroundNode.querySelector('.text').textContent).toBe('Test');
		expect(backgroundNode.querySelector('.image').style.backgroundImage).toMatch(/test-image/);
	});
	
	it('ignores fading when another scene is playing', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.text = 'Test';
			ambience.play(scene);
			
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			mixin.fadeDuration = 2000;
			ambience.play(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBe(1);
		});
	});
	
	it('respects fading when another scene is not playing', function() {
		runs(function() {
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			mixin.fadeDuration = 2000;
			ambience.play(mixin);
		});
		
		waits(1000);
		
		runs(function() {
			expect(Number(backgroundNode.style.opacity)).toBeBetween(0.25, 0.75);
		});
	});
	
	it('respects current visual fade level when mixed-in during fade', function() {
		runs(function() {
			var base = new Ambience.Scene();
			base.image = 'test-image.jpg';
			base.fadeDuration = 2000;
			ambience.play(base);
		});
		
		waits(500);
		
		runs(function() {
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.text = 'Mixin';
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			var opacity = Number(backgroundNode.style.opacity);
			expect(opacity).toBeBetween(0.25, 0.75);
		});
	});
	
	it('respects current audio fade level when mixed-in during fade', function() {
		runs(function() {
			var base = new Ambience.Scene();
			base.sounds = ['test-audio.ogg'];
			base.fadeDuration = 2000;
			ambience.play(base);
		});
		
		waits(500);
		
		runs(function() {
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.sounds = ['test-audio.ogg'];
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			var volume = backgroundNode.getElementsByTagName('audio')[0].volume;
			expect(volume).toBeBetween(0.25, 0.75);
		});
	});
	
	it('only mixes in properties of media when media itself is present', function() {
		var base = new Ambience.Scene();
		base.text = 'Base';
		base.textStyle = { color: 'red' }
		ambience.play(base);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.textStyle = { color: 'blue' };
		ambience.play(mixin);
		
		expect(backgroundNode.querySelector('.text.inner').style.color).toBe('red');
	});
	
	it('keeps playing scene with image even after audio of mixed-in audio-only scene ends', function() {
		runs(function() {
			var scene = new Ambience.Scene();
			scene.image = 'test-image.jpg';
			ambience.play(scene);
			
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.sounds = ['test-audio-2s.ogg'];
			mixin.loops = false;
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			expect(backgroundNode.getElementsByTagName('audio').length).toBe(1);
		});
		
		waits(3000);
		
		runs(function() {
			expect(ambience.sceneIsPlaying).toBe(true);
		});
	});
	
	it('displays visual mixin even when previous scene was not visual', function() {
		var scene = new Ambience.Scene();
		scene.sounds = ['test-audio-2s.ogg'];
		ambience.play(scene);
		
		var mixin = new Ambience.Scene();
		mixin.isMixin = true;
		mixin.image = 'test-image.jpg';
		ambience.play(mixin);
		
		expect(backgroundNode.style.visibility).toBe('visible');
	});
	
	it('respects volume of mixed-in scene', function() {
		var scene = new Ambience.Scene();
		scene.sounds = ['test-audio-2s.ogg'];
		
		runs(function() {
			ambience.play(scene);
			var mixin = new Ambience.Scene();
			mixin.isMixin = true;
			mixin.sounds = ['test-audio-2s.ogg'];
			mixin.volume = 0.5;
			ambience.play(mixin);
		});
		
		waits(500);
		
		runs(function() {
			var volume = backgroundNode.getElementsByTagName('audio')[0].volume;
			expect(volume).toBeBetween(0.45, 0.55);
		});
	});
});