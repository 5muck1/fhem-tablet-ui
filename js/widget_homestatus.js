var widget_homestatus = {
  _homestatus: null,
  elements: null,
  drawSelector: function () {
	var sector=0;
	var c = this.g; // context
	var x=this.$.data('pageX');
	var y=this.$.data('pageY');
	var mx=this.x+this.w2;
	var my=this.y+this.w2;
	var r=this.radius*0.4;

	//Assign sector 1 for center pressed or set value 0
	if ( Math.pow((mx-x),2) + Math.pow((my-y),2) < Math.pow(r,2)
		|| this.cv == 0 ) 
		sector=1;
	
	if (sector==1){
			// inner circle
			c.lineWidth = this.radius*0.4;
			c.strokeStyle = this.o.fgColor ;
			c.beginPath(); 
			c.arc( this.xy, this.xy, this.radius*0.2, 0, 2 * Math.PI); 
			c.stroke();
		}
		else{
			// outer section
			var start=0; 
			var end = 0;
			
			if (this.cv > Math.PI*0.5 && this.cv <= Math.PI*1.5){
					start=0; end=Math.PI; sector=3;
			}
			else if (this.cv > Math.PI*1.5 && this.cv <= Math.PI*2){
					start=Math.PI; end=Math.PI*1.5; sector=2;
			}
			else if (this.cv > 0 && this.cv <= Math.PI*0.5){
					start=Math.PI*1.5; end=Math.PI*2; sector=4;
			}
														
			c.lineWidth = this.radius*0.6;
			c.beginPath();
			c.strokeStyle = this.o.fgColor;
			c.arc(this.xy, this.xy, this.radius*0.7, start, end);
			c.stroke();
		} 

		// sections
		c.strokeStyle = this.o.tkColor;
		c.lineWidth = this.radius*0.6;
		c.beginPath();
		c.arc(this.xy, this.xy, this.radius*0.7, 0, 0.02);
		c.stroke();
		c.beginPath();
		c.arc(this.xy, this.xy, this.radius*0.7, Math.PI -0.02, Math.PI);
		c.stroke();
		c.beginPath();
		c.arc(this.xy, this.xy, this.radius*0.7, 1.5 * Math.PI-0.02, 1.5 * Math.PI);
		c.stroke();
		
		// inner circle line
		c.lineWidth = 2; 
		c.strokeStyle = this.o.tkColor;
		c.beginPath(); 
		c.arc( this.xy, this.xy, this.radius*0.4, 0, 2 * Math.PI); 
		c.stroke(); 
		
		// outer circle line
		c.lineWidth = 2; 
		c.beginPath(); 
		c.arc( this.xy, this.xy, this.radius, 0, 2 * Math.PI, false); 
		c.stroke(); 
		
		c.fillStyle = (sector==1)?this.o.minColor:this.o.maxColor;
		c.font = "100 11px sans-serif";
		c.fillText("Home", this.xy-14, this.xy+15);
		c.font = "22px FontAwesome";
		c.fillText("\uf015", this.xy-12, this.xy+2);
		
		c.fillStyle = (sector==2)?this.o.minColor:this.o.maxColor;
		c.font = "22px FontAwesome";
		c.fillText("\uf236", this.xy-this.radius*0.7, this.xy-this.radius*0.4);
		c.font = "100 11px sans-serif";
		c.fillText("Night", this.xy-this.radius*0.9, this.xy-10);
		
		c.fillStyle = (sector==3)?this.o.minColor:this.o.maxColor;
		c.font = "22px FontAwesome";
		c.fillText("\uf1b9", this.xy-12, this.xy+this.radius*0.67);
		c.font = "100 11px sans-serif";
		c.fillText("Away", this.xy-12, this.xy+this.radius*0.65+15);

		c.fillStyle = (sector==4)?this.o.minColor:this.o.maxColor;
		c.font = "22px FontAwesome";
		c.fillText("\uf0f2", this.xy+this.radius*0.4, this.xy-this.radius*0.4);
		c.font = "100 11px sans-serif";
		c.fillText("Holiday", this.xy+this.radius*0.42, this.xy-10);
		
		this.o.status = sector;
	return false;
},
  init: function () {
  	_homestatus=this;
  	_homestatus.elements = $('div[data-type="homestatus"]');
 	_homestatus.elements.each(function(index) {

		var clientX=0;
		var clientY=0;
		var knob_elem =  jQuery('<input/>', {
			type: 'text',
		}).data($(this).data())
		  .data('curval', 10)
		  .appendTo($(this));
		
		$(this).bind('mousemove', function(e) {
	
			knob_elem.data('pageX',e.pageX);
			knob_elem.data('pageY',e.pageY);
			e.preventDefault();
		});

		var device = $(this).data('device');
		$(this).data('get', $(this).data('get') || 'STATE');
		$(this).data('cmd', $(this).data('cmd') || 'set');
		readings[$(this).data('get')] = true;
		
		knob_elem.knob({
			'min': 0,
			'max': 2 * Math.PI,
			'step': 0.01,
			'height':210,
			'width':210,
			'bgColor': $(this).data('bgcolor') || '#aaaaaa',
			'fgColor': $(this).data('fgcolor') || '#aa6900',
			'tkColor': $(this).data('tkcolor') || '#696969',
			'minColor': '#2A2A2A',
			'maxColor': '#696969',
			'thickness': 0.4,
			'displayInput': false,
			'angleOffset' : 0,
			'cmd': $(this).data('cmd') || 'set',
			'set': $(this).data('set') || '',
			'draw' : _homestatus.drawSelector,
			'change' : function (v) { 
				  startInterval();
			},
			'release' : function (v) { 
			  if (ready){
			  		var cmdl = this.o.cmd+' '+device+' '+this.o.set+' '+this.o.status;
				  	setFhemStatus(cmdl);
				  	$.toast(cmdl);
				  	this.$.data('curval', v);
			  }
			}	
		});	
	 });
  },
  update: function (dev,par) {

	var deviceElements;
	if ( dev == '*' )
		deviceElements= _homestatus.elements;
	else
   		deviceElements= _homestatus.elements.filter('div[data-device="'+dev+'"]');

	deviceElements.each(function(index) {
		
			var value = getDeviceValue( $(this), 'get' );
			if (value && value > -1){
				var knob_elem = $(this).find('input');
				var val=0;
				switch( value ) {
					case '3':
						val=Math.PI;
						break;
					case '4':
						val=Math.PI*0.25;
						break;
					case '2':
						val=Math.PI*1.75;
						break;
					default:
						val=0;
				}
				if ( knob_elem.data('curval') != val )
					knob_elem.val( val ).trigger('change');		
			}
	});
   },
			 
};