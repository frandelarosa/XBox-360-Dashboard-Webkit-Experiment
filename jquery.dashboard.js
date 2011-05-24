/*******************************************************************
*
*	Author:	Francisco de la Rosa
*	E-Mail:	frandelarosa@gmail.com
*	Date: 24-03-11
*
*	Description: Webkit Experiment to re-create Xbox 360 Old Slider.
*
*	Copyright (c) 2011 Francisco de la Rosa
*
*	Permission is hereby granted, free of charge, to any
*	person obtaining a copy of this software and associated
*	documentation files (the "Software"), to deal in the
*	Software without restriction, including without limitation
*	the rights to use, copy, modify, merge, publish,
*	distribute, sublicense, and/or sell copies of the
*	Software, and to permit persons to whom the Software is
*	furnished to do so, subject to the following conditions:
*
*	The above copyright notice and this permission notice
*	shall be included in all copies or substantial portions of
*	the Software.
*
*	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY
*	KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
*	WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
*	PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS
*	OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
*	OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
*	OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
*	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*
*
*
********************************************************************/


(function($){

	$.fn.dashboard = function(options){
	
		var numpanels = 0;
		var panels = [];
		var valueTable = [];
		var idx = -1;
		
		/*
			marginLeft: Initial value of marginLeft between each element.
			point: Initial reference point.
			scale: Inital scale value.
			scaleDecrement: Decrement scale value to calculate the size of each panel.
			zIndex: Initial zindex value.
		*/
	
		var defaults = {
			marginLeft: 200,
			point: 'middle',
			scale: 1,
			scaleDecrement: 0.1,
			zIndex: 9001,
		}
		
		// Overwrite options
		var opts = $.extend({}, defaults, options);
		
		// Static functions
		$.dashboard = {}
			
		$.dashboard.navigate = function(mode){
			_navigate(mode);
		}
		
		$.dashboard.toggle = function(){
			_toggleMenu();
		}
		
		$.dashboard.create = function(){
			_init();
		}
		
		$.dashboard.position = function(position){
			
			// Reset values
			valueTable = [];
			
			// Update positions and draw again
			opts.point = position;
			
			_setPreferences();
			_makeValueTable();
			_drawPanels();
			
		}
		
		$.dashboard.animateFrontPanel = function(pos){
			_animateFrontPanel(pos);
		}
		
		_init();
		
		// Main function
		return this.each(function(i){		
		
			// Current planel
			var panel = $(this);	
        	
        	$(panel).attr("idx",i);
        	
        	// Add to panel list
        	panels.push(panel);	
        	
        	// Increase index
        	numpanels++;
		
		});
		
		/*
			
			The panels give us the values that will be used to calculate
			the distance and scale.
			
		*/
		function _setPreferences(){
		
			if (numpanels > 0 && numpanels <=5){
				opts.scaleDecrement = 0.15;
			}else if (numpanels >= 5 && numpanels <=10){
				opts.scaleDecrement = 0.075;
			}else if (numpanels >= 10 && numpanels <=15){
				opts.scaleDecrement = 0.05;
			}
		
		}
		
		// Init Point
		function _calculateInitPoint(width,left){
		
			var pointStart = 0;
		
			switch(opts.point){
			
				case 'init':
					pointStart = parseInt((width*25/100))+parseInt(left,10);
				break;
			
				case 'middle':
					pointStart = parseInt((width*50/100))+parseInt(left,10);
				break;
				
				case 'end':
					pointStart = parseInt((width*75/100))+parseInt(left,10);
			
				default:
				break;
				
			}
			
			return pointStart;
		
		}
		
		// Make the table with position values to draw the panels
		function _makeValueTable(){
			
			var scale = 0;
			var zindex = 0;
		
			$.each(panels,function(i){
			
				var panel = $(this);
				
				var value = [];
				var width = 0;
				var left = 0;
				var pointStart = 0;
				
				// Take first panel to set initial value
				if (i == 0){
				
					width = panel.outerWidth(true) * opts.scale;
					left = opts.marginLeft;
					
					// Calculate middle point of previous panel to get inital point of current panel
					pointStart = _calculateInitPoint(width,left);
				
					value["scale"] = opts.scale;
					value["point"] = opts.marginLeft;
					value["zindex"] = opts.zIndex;
					
					scale = opts.scale;
					zindex += opts.zIndex;
					
					
				}else{
				
					/*
						To draw current element, get the initial point of previous element.
						Next step is calculate initial point of current element to set
						left position of next element.
					
					*/
				
					width = parseInt(panel.outerWidth(true)) * valueTable[i-1]["scale"];
					left = valueTable[i-1]["point"];
					
					// Init Point
					pointStart = _calculateInitPoint(width,left);
					
					// Set values
					scale -= parseFloat(opts.scaleDecrement);
					zindex--;
					
					value["scale"] = scale;
					value["point"] = pointStart;
					value["zindex"] = zindex;
				
				}
				
				// Save values
				valueTable.push(value);
			
			});
			
		}
		
		
		
		// Init function
		function _init(){
		
      		// The panel which has frontPanel class shows the toolbar and statusbar
      			
			$(".frontPanel").live('mouseenter',
				function(){
					_showBars();
				}
			);
			
			$(".frontPanel").live('mouseleave',
				function(){
					_hideBars();
				}
			);
			
			// Set init preferences, make value table with scale, position and z-index of each panel
			_setPreferences();
			_makeValueTable();
			_drawPanels();
					
		}
		
		// Remove frontPanel class
        function _removeClass() {
        
        	$.each(panels,function(){
        	
        		$(this).removeClass("frontPanel");
        	
        	});
        	
      
		}
		
		// Navegigate right
		function _navigateRight(){
		
			idx++;
			
			
			if (idx == numpanels -1){
				idx--;
			}
		
			// Remove all frontPanel classes
			_removeClass();
		
			// Get current panel
			panel = panels[idx];
			
			// Hide the panel
			$(panel).removeClass("frontPanel").addClass("outside");
			// Apply outside effect
 			$(panel).css("opacity","0").css("-webkit-transform","scale(1.5) translateX(-100px)");
 			
 			// Get position of next panel
 			begin = idx+1;
 			
 			// Add frontPanel class to next panel
 			panels[begin].addClass("frontPanel");
 			
 			idxValue = 0;
			
			// Redraw panels
			for (i=begin; i<numpanels; i++){
			
				var panel = panels[i];
								
				left = valueTable[idxValue]["point"];
				scale = valueTable[idxValue]["scale"];
				zindex = valueTable[idxValue]["zindex"];
				
				// Update panel position									
				_panelUpdate(left,scale,zindex,panel);	
				
				idxValue++;
				
			}		
		
		}
		
		// Navigate left
		function _navigateLeft(){
		
			// Udpate index
			idx--;
			
			// Check if the index is in the beginning of the list
			if (idx == -2){
				idx++;
			}
						
			begin = idx+1;
			
			_removeClass();

			// Shows the last panel that was hidden
			$(panels[begin]).removeClass("outside").addClass("frontPanel");
			$(panels[begin]).css("opacity","1");			
			
	 		idxValue = 0;

			for (i=begin; i<numpanels; i++){
			
				var panel = panels[i];
				
				left = valueTable[idxValue]["point"];
				scale = valueTable[idxValue]["scale"];
				zindex = valueTable[idxValue]["zindex"];
				
				_panelUpdate(left,scale,zindex,panel);	
				
				idxValue++;
			
			}
					
		}
      
      	// Navigation mode
     	function _navigate(mode) {
     		
			_hideBars();
     	
     		if (mode == 'left'){
     		
     			_navigateLeft();
     	 				
			}else if (mode == 'right'){
			
				_navigateRight();
						
			}
		
		}
				
		// Draw panels on the screen
		function _drawPanels(){
					
			$.each(panels,function(i){
			
				var panel = panels[i];
				
				if (i == 0){
					panel.addClass("frontPanel");
				}
									
				// Panel values
				left = valueTable[i]["point"];
				scale = valueTable[i]["scale"];
				zindex = valueTable[i]["zindex"];
								
				_panelUpdate(left,scale,zindex,panel);	
				
			});
		
		
		}
		
		// Apply properties to the panel
		function _panelUpdate(left,scale,zindex,obj){
		
			obj.
			css("left",left).
			css("-webkit-transform","scale("+scale+")").
			css("z-index",zindex);
		
		}
	  
	  	// Shows the toolbar 
		function _showBars(){
		
			var layer = $(".frontPanel");
		
			if ($(layer).hasClass("frontPanel") == true){
			
				// Get the toolbar of current panel
				var toolbar = $(layer).find(".panel_toolbar");
			
				$(toolbar).show('fast',function(){
					$(this).css("top","0px");
				});
				
				// Get statebar of current panel
				var statebar = $(layer).find(".panel_state");
				
				$(statebar).show('fast',function(){
					$(this).css("bottom","-25px");
				});
							
			}
		
		}
			
		// Hide toolbar and statebar		
		function _hideBars(){
		
			var layer = $(".frontPanel");
		
			if ($(layer).hasClass("frontPanel") == true){
				
				var toolbar = $(layer).find(".panel_toolbar");
				
				// Apply css transformation
				$(toolbar).css("top","50px");
				
				var statebar = $(layer).find(".panel_state");
				
				$(statebar).css("bottom","25px");
			
			}
				
		
		}
		
		// Show/hide panels
		function _toggleMenu(){
		
			$(".dashboard_panels").toggle();
		
		}
	
	};


})(jQuery);


      
      
