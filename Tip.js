Jss.registre({
	name : 'Tip',
	css : 'css-all/css-all.css'
},

function ($) { $.Tip = true; });	// Component loaded


Jss.registre({
	name : 'Tooltip',
	require : ['Component', 'DropDown']
},

function ($) {
	
	/**
	*	Tooltip Component
	*	emulate designed html "title" attribute
	*/	
	$.Tooltip = function (dom) {
		$.Comp.apply(this);
		this.Target = $(dom);
		this.dropable(this.Target);
		var title = this.Target.title();
		if (title) {
			this.html(title);
			this.Target.title('');
		}
		
		var self = this;
		this.Target.on('mouseenter', function () {
			self.open();
		}).onmouseleave(function () {
			self.close();
		});
		this.dropDown.position(['left', 'bottom']);
	};
	
	$.Tooltip.extend($.Comp, {
	
		defCls : 'tooltip'
		
	});
	
});


Jss.registre({
	name : 'Infotip',
	require : ['Component', 'Effect']
},

function ($) {
	
	$.lastinfotip = false;	// while last infotip exist next showed in down of last
	
	/**
	*	Infotip Component
	*	information tip in top of screen
	*/
	$.Infotip = function (title, content, timelife) {
		$.Comp.apply(this);
		
		this.addChild($().cls('title').html(title)).first();
		this.addChild($().cls('body').html(content));
		
		this.style('opacity', 0)
			.appendTo(document.body)
			.up();
		
		if ($.lastinfotip) this.y($.lastinfotip.offsetBottom());
		$.lastinfotip = this;
		
		var self = this;
		this.fadein(1000, function () {
			setTimeout(function () {
				self.fadeout(400, function () { self.close(); });
			}, timelife||2000);
		});
	};
	
	$.Infotip.extend($.Comp, {

		defCls : 'infotip',
		layer : 100,
		close : function ()
		{
			this.parentNode().removeChild(this.el);
			if ($.lastinfotip == this) $.lastinfotip = false;
			return this;
		}
		
	});
	
});