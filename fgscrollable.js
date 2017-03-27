/**
 * Created by e-frogg on 27/11/2014.
 */

/***********************
 héritage basique
 ***********************/
if (typeof Object._create !== 'function') {
	Object._create = function(o) {
		var out;
		function F() {};
		F.prototype = o;
		out = new F();
		out.uber = o;
		return out;
	};
}

Function.prototype.inheritsFrom = function( parentClassOrObject ){
	this.prototype = Object._create(parentClassOrObject.prototype);
	this.prototype.constructor = parentClassOrObject;
};


/***********************
 *
 *
 FGEvent
 *
 *
 ***********************/

FGEvent = function(eventName) {
    this.eventName = eventName;
    this.target = null;
    this.currentTarget = null;
};








/***********************
 *
 *
 FGEventDispatcher
 *
 *
 ***********************/

FGEventDispatcher = function() {
    this.listeners=[];
};
FGEventDispatcher.prototype.addEventListener = function(eventName,callable) {
	this.listeners.push({eventName:eventName,method:callable,currentTarget:this});
};
FGEventDispatcher.prototype.removeEventListener = function(eventName,callable) {
	for(var i=this.listeners.length-1;i>=0;i--) {
		var listener =this.listeners[i];
		if(listener.eventName == eventName && (callable === undefined || listener.method == callable)) {
			this.listeners.splice(i,1);
		}
	}
};
FGEventDispatcher.prototype.dispatchEvent = function(event) {
	for(var i=0;i<this.listeners.length;i++) {
		var listener =this.listeners[i];
		if(listener.eventName == event.eventName) {
			event.currentTarget = listener.currentTarget;
			event.target = this;
			listener.method.call(this,event);
		}
	}
};


// il sert a reseter tous les scrollables
scrollableDispatcher = new FGEventDispatcher();


/***********************
 *
 *
 Scrollable
 *
 *
 ***********************/

FGScrollable = function() {
	FGEventDispatcher.call(this);
};
FGScrollable.inheritsFrom(FGEventDispatcher);
FGScrollable.prototype.parent = FGEventDispatcher.prototype;
FGScrollable.prototype.init = function(jqNode) {
	this.jqNode = jqNode;
	this.oldPosition = -1;
	this.oldPositionVisible = -1;

	var self = this;
	jQuery(window).scroll(function() {
		self.onScroll.call(self);
	});
	jQuery(window).resize(function() {
		self.onScroll.call(self);
	});
	this.nodePosition = this.jqNode.offset().top;
	this.nodeHeight = this.jqNode.outerHeight();

	// au document ready,
	jQuery(function() {
		self.onScroll.call(self);
	});
	scrollableDispatcher.addEventListener("scroll",function() {
		self.onScroll.call(self);
	})
};
FGScrollable.prototype.onScroll = function(e) {
	var scrollTop = jQuery(document).scrollTop();
	var screenHeight = jQuery(window).height();
	var nodePosition = this.nodePosition;
	var nodeHeight = this.nodeHeight;

	var percent= -(nodePosition-scrollTop+nodeHeight-(screenHeight+nodeHeight))/(screenHeight+nodeHeight);
	var percentVisible = -(nodePosition-scrollTop-(screenHeight-nodeHeight))/(screenHeight-nodeHeight);

	var event = new FGEvent(FGScrollable.EVENT_SCROLL);
	event.scrollPercent = percent;
	event.scrollPercentVisible = percentVisible;
	this.dispatchEvent(event);

	var isIn = (percent>=0 && percent<=1);
	var wasIn = (self.oldPosition>=0 && self.oldPosition<=1);

	if(isIn && !wasIn) {
		event = new FGEvent(FGScrollable.EVENT_ENTER);
		this.dispatchEvent(event);
	}
	if(!isIn && wasIn) {
		event = new FGEvent(FGScrollable.EVENT_OUT);
		this.dispatchEvent(event);
	}

	var isInFull = (percentVisible>=0 && percentVisible<=1);
	var wasInFull = (self.oldPositionVisible>=0 && self.oldPositionVisible<=1);

	if(isInFull && !wasInFull) {
		event = new FGEvent(FGScrollable.EVENT_ENTER_FULL);
		this.dispatchEvent(event);
	}
	if(!isInFull && wasInFull) {
		event = new FGEvent(FGScrollable.EVENT_OUT_FULL);
		this.dispatchEvent(event);
	}

	self.oldPosition = percent;
	self.oldPositionVisible = percentVisible;
};
/*
// exemple de override function
FGScrollable.prototype.dispatchEvent = function(event) {
	this.parent.dispatchEvent.call(this,event);	// appel à la méthode parent
};
*/

// constants / statics
FGScrollable.EVENT_SCROLL = "EVENT_SCROLL";
FGScrollable.EVENT_ENTER = "EVENT_ENTER";
FGScrollable.EVENT_OUT = "EVENT_OUT";
FGScrollable.EVENT_ENTER_FULL = "EVENT_ENTER_FULL";
FGScrollable.EVENT_OUT_FULL = "EVENT_OUT_FULL";
FGScrollable.initialized = false;
FGScrollable.initSmoothScroll = function(duration) {
	if(FGScrollable.initialized) return;
	FGScrollable.initialized = true;

	var tween = null;
	var currentPosition = jQuery(window).scrollTop();
	var data = {n:currentPosition};
	var scrolling = false;
	jQuery(document).on('scroll',function(e,d) {
		if(!scrolling) {
			currentPosition = jQuery(window).scrollTop();
			data = {n:currentPosition};
		}
	});
	jQuery(document).on('mousewheel',function(e,d) {
		if(tween) tween.kill();
		currentPosition -= e.originalEvent.wheelDelta;
		currentPosition = Math.min(jQuery(document).height()-jQuery(window).height(),Math.max(0,currentPosition));

		scrolling = true;
		tween = TweenLite.to(data,duration,{n:currentPosition,onUpdate:function() {
			window.scrollTo(0,this.target.n);
		},onComplete:function() {
			scrolling = false;
		}});
		// window.scrollTo(0,jQuery(window).scrollTop()+(e.originalEvent.deltaY));
		e.preventDefault();
	});
};




/***********************
 *
 *
 Scrollable Animation
 *
 *
 ***********************/

FGScrollAnimation = function() {
	FGScrollable.call(this);	// construct parent
	this.animations = {};

	this.parseTween = function(duration,dataAnimation) {	// méthode publique non overridable
		if(dataAnimation.from) {
			dataAnimation.from.paused = true; // pas de démarrage auto
			return TweenLite.from(this.jqNode,duration,dataAnimation.from);
		} else if(dataAnimation.to) {
			dataAnimation.to.paused = true; // pas de démarrage auto
			return TweenLite.to(this.jqNode,duration,dataAnimation.to);
		}
	};
};


FGScrollAnimation.inheritsFrom(FGScrollable);
FGScrollAnimation.prototype.animateEnter = function(duration,dataAnimation) {
	this.tween = this.parseTween(duration,dataAnimation);
	this.addEventListener(FGScrollable.EVENT_ENTER_FULL,function() {
		this.tween.play();
	});
	this.addEventListener(FGScrollable.EVENT_OUT_FULL,function() {
		this.tween.reverse();
	});
};
FGScrollAnimation.prototype.animateScroll = function(range,dataAnimation) {
	var oldScroll = -1;
	var oldPourcentAnimation = -1;
	var self = this;

	if(typeof dataAnimation == "function") {
		this.tween = dataAnimation.call(this);
	} else {
		if(typeof(dataAnimation.duration) == 'undefined') dataAnimation.duration = 0.5;
		this.tween = this.parseTween(dataAnimation.duration,dataAnimation);
	}

	this.addEventListener(FGScrollable.EVENT_SCROLL, function (e) {
		//console.log("scroll animate", e.currentTarget.jqNode);
		var hasFrom = typeof(range.from) != "undefined";
		var hasTo = typeof(range.to) != "undefined";
		var from = range.from;
		var to = range.to;
		var pc = e.scrollPercent;
		if(range.full) {
			pc = e.scrollPercentVisible;
		}

		if(hasFrom && hasTo) {
			var pourcentAnimation = Math.max(0, Math.min(1, (pc - from) / (to - from)));
			//targetProgress = pourcentAnimation;
			if(oldPourcentAnimation != pourcentAnimation) {
				this.tween.seek(pourcentAnimation * dataAnimation.duration);
				if(typeof dataAnimation.callbackProgress != "undefined") {
					dataAnimation.callbackProgress.call(self,pourcentAnimation);
				}
			}

		} else if(hasFrom) {
			var wasIn = oldScroll > from;
			var isIn = pc > from;
			if(isIn && ! wasIn) {
				this.tween.play();
				if(typeof dataAnimation.callbackEnter != "undefined") dataAnimation.callbackEnter.call(self)
			} else if(wasIn && !isIn) {
				this.tween.reverse();
				if(typeof dataAnimation.callbackOut != "undefined") dataAnimation.callbackOut.call(self)

			}
		}


		oldPourcentAnimation = pourcentAnimation;
		oldScroll = pc;
	});
};

/*
static
 */
FGScrollAnimation.animate = function(jQnodes,range,animationData) {
	jQnodes.each(function() {
		var myScroll = new FGScrollAnimation();
		myScroll.init(jQuery(this));
		myScroll.animateScroll(range,animationData);
	});
};


/*
 plugin jQuery
 */
jQuery.extend(jQuery.fn,
	{
		FGanimate: function(range,animationData)
		{
			FGScrollAnimation.animate(this,range,animationData);
		}
	});


/***********************
 PARALLAX
 ***********************/

FGParallax = function(jqNode) {
	FGScrollable.call(this,jqNode);
};
FGParallax.inheritsFrom(FGScrollable);

/*
plugin jQuery
 */
jQuery.extend(jQuery.fn,
	{
		FGParallax: function(options)
		{
			this.each(function() {
				var scrollable = new FGScrollable();
				var container = jQuery(this);
				var content = container.find(".plx-content");
				scrollable.init(container);
				this.updateParalax = function(e) {
					content.each(function() {
						var oneContent = jQuery(this);
						var factor = oneContent.data("plx-factor")*1;
						factor |= 1;
						var contentHeight = oneContent.height();
						var containerHeight = container.height();
						var marge = contentHeight-containerHeight;
						var decalage = -(marge * (1-factor))/2;
						marge *= factor;
						var pc = 1-Math.max(Math.min(e.scrollPercent));
						oneContent.css({top:(decalage-marge*pc )+"px"});
					})
				};
				scrollable.addEventListener(FGScrollable.EVENT_SCROLL,this.updateParalax);
			});
		}
	});
