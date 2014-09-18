//require-css <xataface/modules/geopicker/widgets/geopicker.css>

(function(){
    var $ = jQuery;
    var pkg = XataJax.load('xataface.modules.geopicker.widgets');
    pkg.MapWidget = MapWidget;
	
	var geodata = null;
	var marker = null;
    
	//ctor of MapWidget, "o" contains attributes for the map
    function MapWidget(o){
        var self = this;
        this.input = o.input;
        this.readOnly = o.readOnly || false;
        this.mapOpts = o.mapOpts || {};
        this.width = o.width || '100%';
        this.height = o.height || '500px';
        this.el = $('<div class="xf-geopicker-wrapper" style="height:'+this.height+'; width:'+this.width+'"></div>').get(0);
                //$(this.el).insertAfter(this.input);
        if ( this.readOnly ){
            this.mapOpts.disableDefaultUI = true;
            this.mapOpts.panControl = false;
            this.mapOpts.zoomControl = false;
            this.mapOpts.scaleControl = false;
            this.mapOpts.scrollwheel = false;
            this.mapOpts.navigationControl = false;
            this.mapOpts.mapTypeControl = false;
            this.mapOpts.draggable = false;
            this.mapOpts.disableDoubleClickZoom = true;
        }
        
        this.map = new google.maps.Map(this.el, this.mapOpts);
        
		
        this.features = o.features || {};
        if ( !this.readOnly ){
            var updateTimeout = null;
            
            google.maps.event.addListener(this.map, 'click', function(e){
                updateTimeout = setTimeout(function(){
                    self.onMapClick({position : e.latLng});
                }, 200);
            });
            
            google.maps.event.addListener(this.map, 'dblclick', function(e){
                clearTimeout(updateTimeout);
            });
        }
        
    }
    
    $.extend(MapWidget.prototype, {
        
        onMapClick : function(o)
		{
            var self = this;
			
			if (!this.readOnly)
				this.Geocode(o);
        },
		
		
		addMarker : function(o)
		{
			var self = this;
			
			if (marker != null)  // se c'é già un marker
				marker.setMap(null); // lo cancello dalla mappa
			marker = new google.maps.Marker({ // aggingo un marker
				position : (o.position instanceof google.maps.LatLng) ? o.position : new google.maps.LatLng(o.position[0], o.position[1]), // nella posizione indicata da latLong
				map: self.map,
				draggable:false ,
			}); // sulla mappa
			
			//if(!self.readOnly)
			//	google.maps.event.addListener(marker, 'dragend', function() {self.onMapDrag();});
        },
        
		Geocode : function(o){
			var self = this;
			var geocoder = new google.maps.Geocoder(); // bisgona adesso trovare l'indirizzo corrispondente alle coordinate specificate
			var rv = null;
			
			geocoder.geocode({'latLng': o.position}, function (results, status)   // richiamo la funzione geocode (come fatto precedentemente con la ricerca)
			{
				if (status == google.maps.GeocoderStatus.OK) 
				{ // controllo che la richiesta sia OK

					if (results[1]) 
					{ // se trovo risultati...
						var municipality = ''; 
						var province = ''; 
						var region = ''; 
						var state = '' ;
						var postal_code = '' ;
						
						var postcode = '';
						var route = '';
						var locality = '' ;
						var number = '' ;
						
						for (i = 0; i < results[0].address_components.length; i++) 
						{ // ciclo dell'array dei risultati
							for (j = 0; j < results[0].address_components[i].types.length; j++) 
							{
								if (results[0].address_components[i].types[j] == "administrative_area_level_3")
								municipality = results[0].address_components[i].long_name; // valorizzo municipality con il valore trovato
								
								if (results[0].address_components[i].types[j] == "administrative_area_level_2")
								province = results[0].address_components[i].long_name; // valorizzo province con il valore trovato							

								if (results[0].address_components[i].types[j] == "administrative_area_level_1")
								region = results[0].address_components[i].long_name; // valorizzo region con il valore trovato				
								
								if (results[0].address_components[i].types[j] == "country")
								state = results[0].address_components[i].long_name; // valorizzo state con il valore trovato
							
								if (results[0].address_components[i].types[j] == "postal_code")
								postal_code = results[0].address_components[i].long_name; // valorizzo postal_code con il valore trovato
							
								if (results[0].address_components[i].types[j] == "route")
								route = results[0].address_components[i].long_name; // valorizzo strada con il valore trovato
							
								if (results[0].address_components[i].types[j] == "street_number") 
								number = results[0].address_components[i].long_name;
							
								if (results[0].address_components[i].types[j] == "locality")  
								locality = results[0].address_components[i].long_name; // valorizzo localit� con il valore trovato
							
							} 
						}
						
						if (number != '') 
							postcode = route + ', ' + number ; // valorizzo il campo di testo con id #postcode (viene mostrato all'utente) CASO A, con numero civico
						else
							postcode = route ; // valorizzo il campo di testo con id #postcode (viene mostrato all'utente) CASO B, senza numero civico
						
						if (locality != '' && locality.toLowerCase() != municipality.toLowerCase())
							postcode = postcode + ' - ' + locality ; 
						
						rv = {};
						rv.position = [o.position.lat(), o.position.lng()] ;
						rv.route = route ;
						rv.number = number ;
						rv.locality = locality;
						rv.postal_code = postal_code;
						rv.municipality = municipality;
						rv.province = province;
						rv.region = region;
						rv.state = state;
						rv.postcode = postcode ;
						rv.result = results; //store full data into db
						
						var newDiv = $(document.createElement('div')); 
						newDiv.html(
									"Address: " + rv.postcode + 
									"</br>Municipality: " + rv.municipality + 
									"</br>Province: " + rv.province + 
									"</br>Coordinates: " + rv.position[0] + ", " + rv.position[1]);
						newDiv.dialog({
							resizable: false,
							height:260,
							width:400,
							modal: true,
							title:"Geographic data acquired",
							buttons: 
							{
								"Confirm": function() 
								{
									$( this ).dialog( "close" );
									geodata = rv;
									self.push();
									self.addMarker(o);
								},
								"Cancel": function() 
								{
									$( this ).dialog( "close" );
									return;
								}
							}
						});
						
					}
					else 
					{
						var newDiv = $(document.createElement('div')); 
						newDiv.html("No result found!");
						newDiv.dialog({
							resizable: false,
							height:200,
							width:400,
							modal: true,
							title:"Error",
							buttons: 
							{
								Ok: function() {$( this ).dialog( "close" );}
							}
						});
						
						return;
					} // gestione errori
				
				}
				else 
				{
					var newDiv = $(document.createElement('div')); 
					newDiv.html("Geocoding failed!");
					newDiv.dialog({
						resizable: false,
						height:200,
						width:400,
						modal: true,
						title:"Error",
						buttons: 
						{
							Ok: function() {$( this ).dialog( "close" );}
						}
					});
					
					return;
				}
				
			 });
		
		},
	  
		
        install : function(){
            var self = this;
            $(this.el).insertAfter(this.input);
            $(this.input).hide();
            this.pull();
            if ( !this.readOnly ){
                $(this.input.form).submit(function(){
                    self.push();
                    return true;
                });
            }
			
			$( "#dialog" ).dialog();
  
        },
        pull : function(){
            var self = this;
            var data = $(this.input).val();
			
			try 
			{
                geodata = JSON.parse(data);
				this.map.setCenter(new google.maps.LatLng(geodata.position[0], geodata.position[1]));
				this.map.setZoom(this.readOnly ? 13 : 14); //zoom to point
				self.addMarker(geodata);
			}
			catch(err) 
			{
				geodata = null;
				self.push();
				this.map.setCenter(new google.maps.LatLng(18, 18)); //default latlon world
				this.map.setZoom(2); //default zoom
            }
            
        },
        push : function()
		{
			if (geodata)
				$(this.input).val(JSON.stringify(geodata));
			else
				$(this.input).val(null);
				
			$(this.input).trigger( "change" )
        }
    });
    
    MapWidget.initialized = false;
    MapWidget.queue = [];
    MapWidget.initialize = function(){
        MapWidget.initialized = true;
        while ( MapWidget.queue.length > 0 ){
            var f = MapWidget.queue.shift();
            f();
        }
    };
    MapWidget.ready = function(f){
        if ( MapWidget.initialized ){
            f();
        } else {
            MapWidget.queue.push(f);
        }
    };
    
    
    MapWidget.load = function(){
        var script = document.createElement('script');
        script.type = 'text/javascript';
        var k = '';
        if ( window.location.hostname !== 'localhost' && typeof(window.XF_GEOPICKER_API_KEY) !== 'undefined'){
            k = 'key='+encodeURIComponent(window.XF_GEOPICKER_API_KEY)+'&';
        }
        script.src = 'https://maps.googleapis.com/maps/api/js?'+k+'v=3.exp&sensor=false&' +
            'callback=xataface.modules.geopicker.widgets.MapWidget.initialize';
        document.body.appendChild(script);
		
    };
    
    MapWidget.load();
    
	//it will be executed for any part of the page that is added even after page load
    registerXatafaceDecorator(function(node){
        MapWidget.ready(function(){
            
			// Find all elements with the xf-geopicker CSS class
           $('input.xf-geopicker', node).each(function(){
                var atts = {
                    input : this, //the CSS element
                    mapOpts : {},
                    features : {}
                };
                
				//parse attributes and build "atts" variable with map attributes
                if ( $(this).attr('data-geopicker-zoom') ){
                    atts.mapOpts['zoom'] = parseInt($(this).attr('data-geopicker-zoom'));
                } else {
                    atts.mapOpts['zoom'] = 8;
                }
                if ( $(this).attr('data-geopicker-center') ){
                    var ctrStr = $(this).attr('data-geopicker-center').split(',');
                    
                    atts.mapOpts['center'] = new google.maps.LatLng(parseFloat(ctrStr[0]), parseFloat(ctrStr[1]));
                } else {
                    atts.mapOpts['center'] = new google.maps.LatLng(49.25,123.1);
                }
                
                if ( $(this).attr('data-geopicker-width') ){
                    atts.width = $(this).attr('data-geopicker-width');
                    
                }
                if ( $(this).attr('data-geopicker-height') ){
                    atts.height = $(this).attr('data-geopicker-height');
                }
                
                if ( $(this).attr('data-geopicker-read-only')){
                    atts.readOnly = true;
                }
                
				//build and install a MapWidget
                var widget = new MapWidget(atts);
                widget.install();
           });
        });
    });
    
    
    
    
})();
