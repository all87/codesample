Jss.registre({
	name : 'Combobox',
	css : 'css-all/css-all.css',
	require : ['TextInput', 'InputList', 'DropDown']
},

// TODO : chk key nav in ie8
// TODO : chk ie7 crossbrowser

function ($) {

	/**
	*	DropDownInput Component
	*	Base Component for DropDown Form Elements
	*/
	$.DropDownInput = function (el)
	{
		$.TextInput.apply(this, arguments);
		this.autocomplete(false);
	};
	
	$.DropDownInput.extend($.TextInput, {
		
		defCls : 'dropdown-input',
		
		/* close drop down component */
		close : function ()
		{
			this.focus();
			if (this.DropComp) this.DropComp.dropDown.close();
			return this;
		},
		
		/* show/hide arrow button */
		arrow : function (arrow)
		{
			var self = this;
			
			if (!this.Arrow) {
				this.add(
					this.Arrow = new $.Comp()
						.cls('dropdown-toggle')
						.onclick(function () {
							self.clickArrow();
						})
				);
				this.sign('arrow', true);
			}

			if (arrow !== undefined) {
				this.Arrow.display(arrow);
				this.sign('arrow', arrow);
			}

			return this;
		},
		
		/* called on click arrow button */
		clickArrow : function ()
		{
			this.toggle();
		},
		
		/* set/get textInput value without call change event */
		inputValue : function ()	// method wich used for set by comp (that not call dble chg DropComp)
		{
			return $.TextInput.prototype.value.apply(this, arguments);
		},
		
		/* init drop component */
		list : function (list)
		{			
			if (!this.DropComp)
			{
				this.DropComp = $(list, this.listFactory)
					.dropable(this)
					.cls('dropdown-list');
			}
			
			return this.DropComp;
		},
		
		/* settings button */
		settingButton : function (but)
		{
			var self = this;

			// TODO : make support change settings click event
			if (!this.SettingButton) {	// create button
				this.add(
					this.SettingButton = new $.Comp()
						.cls('setting-button')
						.onclick(function () {
							if (typeof(but) == 'string') {
								eval(but);
							} else {
								but.apply(self);
							}
						})
				);
				this.sign('settingButton', true);
			}

			if (but !== undefined) {	// show/hide button
				this.SettingButton.display(but);
				this.sign('settingButton', but ? true : false);
			}

			return this;
		},
		
		/* posibility change options if need by Form.values({..options:{..}}) */
		options : function (options)
		{
			this.inputValue("");
			this.list().options(options);
			return this;
		}
		
	});

	
	/**
	*	Combobox Component
	*	Form Element Component emulating standart html "select"
	*/
	$.Combobox = $.MARKUP['SELECT'] = $.MARKUP['SELECT[select-one]'] = function (el)
	{
		var dom = $.dom($.node(el));
		if (dom.tag('select')) {
			$.DropDownInput.apply(this);
			this.wrapper().dom.after(dom);
			this.list(el);
		} else {
			$.DropDownInput.apply(this, arguments);
		}
		
		// markup oninputvaluechange
		if (this.DropComp) {
			var oninputvaluechange = this.DropComp.Input.att("data-oninputvaluechange");
			if (oninputvaluechange) this.on('inputValue', function () { eval(oninputvaluechange)(this); });
		}
		
		this.arrow(true);
		
		// markup filtrable
		this.filtrable(this.DropComp && this.DropComp.Input.att('autocomplete')!==null);
		
		// markup disable
		if (dom.el.disabled) this.disable();
		
		// markup user defined filtrate
		if (dom.att("data-filtrate")) {
			this.filtrate = function () { return window[dom.att("data-filtrate")].apply(this, arguments); };
		}
		
		// markup settingButton
		if (this.DropComp && this.DropComp.Input.att('data-settingButton')!==null) this.settingButton(this.DropComp.Input.att('data-settingButton') || true);
	};

	$.Combobox.extend($.DropDownInput, {
	
		defCls : 'combobox',

		// prompt				: '',
		listFactory			: 'InputList',
		selectonly			: false,
		
		/* set combo filtrable */
		filtrable : function (filtrable)
		{
			if (filtrable || filtrable === undefined) {
				this.sign('filtrable', true);
				if (!this.Magnifier)
					this.Magnifier = this.addChild(new $.Icon().icon('magnifier opaque1')).first();
				this.readonly(false);
			} else {
				this.readonly(true);
				this.sign('filtrable', false);
			}
			return this;
		},
		
		/* called on click arrow button */
		clickArrow : function ()
		{
			if (this.cfg.filtrable) {
				this.toggle();
				if (this.DropComp.cfg.dropped) this.filtrate('');
			} else
				this.toggle();
		},
		
		/* set combo filtrable */
		list : function (list)	// old support ??
		{
			var self = this;
			
			if (!this.DropComp || list !== undefined) {
			
				$.DropDownInput.prototype.list.apply(this, arguments);
				
				var dropList = this.DropComp
					.onchange(function (item) { self.listItemWasSelected(); })
					.on('defItem', function (item) { self.defItem(item); });

				if (dropList.Input) {
					dropList.Input.appendTo(this.wrapper()); // 15.12.2012 <input>><select/></input>
					dropList.Input.el.Comp = this;	// optimize in future
				}
				
				if (self.multiple()) {
					this.listItemWasSelected();
				} else {
					// by default in combobox requareSelection is On
					if (dropList.cfg.requireSelection === undefined) this.requireSelection();
					if (dropList.selectedItem) this.listItemWasSelected(dropList.selectedItem);
				}
			}

			if (list !== undefined) {
				return this;
			} else {
				return this.DropComp;
			}
		},
		
		/* open dropDown list */
		open : function ()
		{
			if (this.DropComp) {
				this.DropComp.style({minWidth : this.wrapper().width() + 'px'});
				$.DropDownInput.prototype.open.apply(this, arguments);
				this.DropComp.focus(false); // focus after open (ie8 focus only visible)
			}
			return this;
		},
		
		/* default value */
		defItem : function (item)
		{
			if (item) this.Input.el.value = this.Input.htmlDecodeValue(item.label());	// dont call value() that not call change() event
			return this;
		},
		
		/* enable/disable or return current state of multiple combobox  */
		multiple : function (multiple)
		{
			if (multiple !== undefined) {
				this.DropComp.multiple(multiple);
				return this;
			} else {
				return this.DropComp.multiple();
			}
		},
		
		/*  */
		value : function (value)
		{
			if (value !== undefined) {
				return this.SetValue.apply(this, arguments);
			} else {
				return this.GetValue();
			}
		},
		
		/*  */
		SetValue : function (value)
		{
			this.DropComp.value.apply(this.DropComp, arguments);
				
			if (this.multiple()) { // for multiple just insertr again labels
				this.inputValue(this.values(', '), true);
			} else if ( this.DropComp.selectedItem && (this.selectedItem != this.DropComp.selectedItem || this.DropComp.cfg.requireSelection) ) { // select-one item value
				this.inputValue(this.DropComp.selectedItem.text(), true);
			} else { // custom value
				if (arguments.length==1 && !$.isArray(value) && (!this.DropComp.selectedItem || this.DropComp.selectedItem.text() != value))
				{
					this.DropComp.clearSelection();
					this.inputValue(value, true);
				}
			}
			
			return this;
		},
		
		/*  */
		GetValue : function (value)
		{
			return this.DropComp.value();
		},
		
		/* get ajax data */
		request : function ()
		{
			return this.DropComp.request();
		},
		
		/*  set combo readonly */
		readonly : function (readonly)
		{
			if (readonly !== undefined) {
				var self = this;
				if (readonly) {
					this.sign('readonly', true);
					if (this.DropComp) 
						this.Input.el.onmouseup = function () { self.toggle(); };
				} else {
					this.sign('readonly', false);
					if (this.DropComp) {
						this.Input.el.mouseup = function () { self.filtrate(); };
						this.Input.el.onkeyup = function (e) { if ((e||event).keyCode != 13) self.filtrate(); };
					}
					// TODO : remove click
					// TODO : optimize in future
				}
			}

			return $.TextInput.prototype.readonly.apply(this, arguments);
		},
		
		/* on/off require selection  */
		requireSelection : function ()
		{
			this.DropComp.requireSelection.apply(this.DropComp, arguments);
			return this;
		},

		/* old support  */
		setItems : function (items)
		{
			this.items.apply(this, arguments);
			return this;
		},
		
		/* change combo list items */
		items : function (items)
		{
			var self = this;
			if (typeof(items)=='object') {
				this.Input.el.value = '';	// that not call onchange event, on items not need onchange
				var list = this.list();
					list.setItems.apply(list, arguments);
				this.defItem(list.selectedItem); // save value	// TODO: support multiple
				this.inputValue(this.values(', '), true);
			}
			return this;
		},

		/* filtrate combobox list by some text */
		filtrate : function (value)
		{
			if (this.DropComp) {
				if (value === undefined) value = this.inputValue();
				this.DropComp.filtrate(value);
				if (!this.DropComp.visibleItems.length) {
					if (!this.closed()) this.close();
				} else {
					if (this.closed()) this.open();
				}
			}
			return this;
		},
		
		/* reset to default state */
		reset : function ()
		{
			this.DropComp.reset();
			this.inputValue(this.values(', '), true);
			return this;
		},
		
		/* return values of Drop Component */
		values : function ()
		{
			var values = [];
			for (var i=0; i<this.DropComp.selectedItems.length; i++) {
				values.push(this.DropComp.selectedItems[i].text());
			}
			
			return values;
		},
		
		/* Synhronize selected items from Drop List with Drop Down Text Input value  */
		listItemWasSelected : function ()
		{
			if (!this.changed) this.flag('changed');

			this.selectedItem = this.DropComp.selectedItem;
			if (this.multiple()) {
				this.inputValue(this.values(', '));
			} else {
				this.inputValue(this.selectedItem && this.selectedItem.text() || '');
				this.DropComp.dropDown.close();
			}

			return this;
		},
		
		/* by this method you can add events for combobox when item selected */
		onchange : function (fn) {return this.on("listItemWasSelected", fn)}
	});

});