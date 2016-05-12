Jss.registre({
	name : 'Resize',
	css : 'css-all/css-all.css',
	require : ['Popup']
},

function ($) {
	
	/* evry extended Component have posibility to be resizable after Resize Component added */
	$.Comp.prototype.resizable = function (resizable, silhouette)
	{
		if (resizable || resizable === undefined) {
			if (!this.Resize) this.Resize = new $.Resize(this);
			this.Resize.enable();
			if (silhouette) this.Resize.silhouette(silhouette);
		} else {
			if (this.Resize) this.Resize.disable();
		}

		return this;
	}
	
	/**
	*	Resize Component
	*	Make posible visual resizing component
	*/
	$.Resize = function (Comp)
	{
		$.EventSysTarget.apply(this);
		
		Comp.Resize = this;
		Comp.popup(true);
		this.Comp = Comp;
		this.Popup = Comp.Popup;
		this.Popup.cls('resizable');

		this.edges = {};

		// add controls
		this.Popup.dom.add([
			this.edges.W = $('DIV').set({ className : 'resize-edge w-resize' }),
			this.edges.E = $('DIV').set({ className : 'resize-edge e-resize' }),
			this.edges.N = $('DIV').set({ className : 'resize-edge n-resize' }),
			this.edges.S = $('DIV').set({ className : 'resize-edge s-resize' }),
			this.edges.NW = $('DIV').set({ className : 'resize-edge nw-resize' }),
			this.edges.NE = $('DIV').set({ className : 'resize-edge ne-resize' }),
			this.edges.SE = $('DIV').set({ className : 'resize-edge se-resize' }),
			this.edges.SW = $('DIV').set({ className : 'resize-edge sw-resize' })
		]);

		var self = this;
		for (var edge in this.edges) {
			(function (edge) {
				var resizeElm = self.edges[edge];
				var resizeNode = resizeElm.node;

				function resizeEdge (e)
				{
					return self.resize(self[edge](e));
				}

				function delControl (e) {
					$.delEvent(document, 'mouseup', delControl);
					$.delEvent(document, 'mousemove', resizeEdge);

					return self.finish(edge, e);
				}

				function addControl (e) {
					$.addEvent(document, 'mousemove', resizeEdge);
					$.addEvent(document, 'mouseup', delControl);
					
					return self.start(e);
				}
				resizeElm.addEvent('mousedown', addControl);
				
			})(edge);
		}

		// Comp.node.style.position = 'absolute';
	}

	$.Resize.extend($.EventSysTarget, {
	
		offsetParent : false,
		
		/* */
		disable : function ()
		{
			for (var edge in this.edges) {
				this.edges[edge].hide();
			}
		},
		
		/*  */
		enable : function ()
		{
			for (var edge in this.edges) {
				this.edges[edge].show();
			}
		},
		
		/* for complex components with hard calculating resize evry pixel posible use silhouette */
		silhouette : function (silhouette)
		{
			if (!this.Sltt)

				this.Sltt = new $.Popup().set({
					layer		: 200,
					className	: 'silhouette',
					display		: false,
					style 		: 'position:absolute; border:1px dotted #fff'
				});
			
			this.cfg.silhouette = silhouette;
		},

		/*  */
		start : function (e)
		{
			this.Popup.sign('resizing', true);
			
			this.target = this.Comp;
			this.Layer = this.Popup;
			
			this.clientX = e.clientX;
			this.clientY = e.clientY;
			
			this.left = this.Popup.node.offsetLeft;
			this.top = this.Popup.node.offsetTop;
			this.width = this.Popup.node.offsetWidth;
			this.height = this.Popup.node.offsetHeight;

			if (this.cfg.silhouette) {
				this.target = this.Sltt
					.show()
					.height(this.height)
					.width(this.width)
					.x(this.left)
					.y(this.top)
					.appendTo(this.Comp.parentNode());
				
				this.Layer = this.Sltt;
			}
			
			this.Layer.up();
			
			$.textSelect(false);
			// e.stopPropagation();		// dublicate "return false"
			
			return false;
		},
		
		/*  */
		resize : function (cfg)
		{
			var x, y;
			
			// some browsers bad work with float in style
			for (var k in cfg) cfg[k] = Math.round(cfg[k]);
			
			this.resizeCFG = cfg;
			if (cfg.y > this.Layer.clientY) {	// for better visualization of resizing we change order of properties
				
				if (cfg.height < 0) {	// recursive resize
					// this.target.y(this.top+this.height);
					// this.target.height(-cfg.height);
				} else {
					if (cfg.x) this.target.x(cfg.x);
					if (cfg.height) this.target.manualHeight(cfg.height);
					if (cfg.width) this.target.manualWidth(cfg.width);
					if (cfg.y) this.target.y(cfg.y);
				}
				
			} else {
				if (cfg.y) this.target.y(cfg.y);
				if (cfg.height) this.target.manualHeight(cfg.height);
				if (cfg.width) this.target.manualWidth(cfg.width);
				if (cfg.x) this.target.x(cfg.x);
			}
		},
		
		/*  */
		finish : function (edge, e)
		{
			if (this.cfg.silhouette) {
				this.Comp.set(this.resizeCFG);
				this.Sltt.hide();
			}
			$.textSelect(true);
			
			this.Popup.sign('resizing', false);
		},
		
		/*  */
		N : function (e)
		{
			return {
				y : this.top + e.clientY - this.clientY,
				height: this.height - e.clientY + this.clientY
			}
		},
		
		/*  */
		E : function (e)
		{
			return {
				width	: this.width + e.clientX - this.clientX
			}
		},
		
		/*  */
		W : function (e)
		{
			return {
				x		: this.left + e.clientX - this.clientX,
				width	: this.width - e.clientX + this.clientX
			}
		},
		
		/*  */
		S : function (e)
		{
			return {
				height: this.height + e.clientY - this.clientY
			}
		},
		
		/*  */
		NE : function (e)
		{
			return {
				y		: this.top + e.clientY - this.clientY,
				width : this.width + e.clientX - this.clientX,
				height: this.height - e.clientY + this.clientY
			}
		},
		
		/*  */
		SE : function (e)
		{
			return {
				width	: this.width + e.clientX - this.clientX,
				height: this.height + e.clientY - this.clientY
			}
		},
		
		/*  */
		SW : function (e)
		{
			return {
				x			: this.left + e.clientX - this.clientX,
				width	: this.width - e.clientX + this.clientX,
				height: this.height + e.clientY - this.clientY
			}
		},
		
		/*  */
		NW : function (e)
		{
			return {
				x		: this.left + e.clientX - this.clientX,
				y		: this.top + e.clientY - this.clientY,
				width	: this.width - e.clientX + this.clientX,
				height:this.height - e.clientY + this.clientY
			}
		},
		
		/* events  */
		onstart : function (fn) { return this.on('start', fn); },
		onfinish : function (fn) { return this.on('finish', fn); },
		onresize : function (fn) { return this.on('resize', fn); }
		
	});
	
});