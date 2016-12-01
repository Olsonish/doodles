// Required Plugins - head.js, knockout.js, jquery.tools.js (rangeinput)
head.ready(function () {

    // Keep this outside for plugin things later
    var idToCGS = $('#rp-dev');

    $(document).ready(function () {
        /* Params */
    	var slideClickAnimationSpeed = 500;
		var slideAnimationSpeed = 500;
		var changeTimeout = 20;
		
        /* Get Root Node for Current Context */
        var thisRootContext = $(idToCGS)[0];
                
        /* Handles (in context) */
        var scroll = $('.rp-scroll', thisRootContext);
        var scrollView = $('.rp-scroll-view', thisRootContext);
        var scrollItems = $('.rp-scroll-items', scroll);
        var rangeInput = $(".rp-range", thisRootContext);
        
        /* Before you do those things, do these things */
        $(scrollItems).noSelect();
        $('.rp-step-np', thisRootContext).noSelect();
        
        /* For Styling & Targeting */
        addChildItemsIdentityClass(scrollItems); // Added a class first in case ID's are useful for something else later
        
        /* Initialize RangeInput */
        $(rangeInput).rangeinput({
            css: {
                /* Define Class Names */
                input: 'rp-range',
                slider: 'rp-slider',
                progress: 'rp-progress',
                handle: 'rp-handle'
            },
            onSlide: function (ev, scrollPosition) { },
            progress: true, /* display progress bar */
            min: 0,
            max: getMaxRange(scrollItems),
            value: 0, /* initial value. also sets the DIV's initial scroll position */
            step: getActualSteps(scrollItems),
            precision: 1,
            change: function (e, i) { },
            speed: 100 /* disable drag handle animation when when slider is clicked */
        });

        /* Define Additional Things */
        var handle = $('.rp-handle', thisRootContext);
        var slider = $('.rp-slider', thisRootContext);
        
        /* Fake a Bigger Hit Area on Slider */
        slider.append('<div class="faux-slider"></div>'); /* This has to be done after range input makes whatever DOM modifications it needs to */

        
        /* ------------- Range Input API ------------- */
	        var thisRangeAPI = $(".rp-range", thisRootContext).data("rangeinput");
	        
	        thisRangeAPI.setValue(0);
	        
	        /* Things I need */
	        var minChildWidth = getMinimumChildWidth(scrollItems);
	        var stepSize = minChildWidth / 10;
	        var currentRangeValue = 0;
	        var suggestedRangeValue = 0;
	        var suggestedScrollTo = 0;
	        var doChange = true;
			var suggestedStep = 0;
			
			// Find a better spot for this
			addChildItemsStepClass(scrollItems, minChildWidth);
	        
	        $('.rp-step-next', thisRootContext).click( function() {
	        	thisRangeAPI.stepUp(stepSize); // Triggers Onslide		
	        	$('#current-range-value').html('Current Range Value: ' + thisRangeAPI.getValue());
			});
			
			$('.rp-step-prev', thisRootContext).click( function() {
				thisRangeAPI.stepDown(stepSize); // Triggers Onslide
				$('#current-range-value').html('Current Range Value: ' + thisRangeAPI.getValue());
			});
	       

			thisRangeAPI.onSlide( function() {

				currentRangeValue = this.getValue();
				
				suggestedRangeValue = roundToMinChildWidth(currentRangeValue, minChildWidth);
				suggestedScrollTo = getSuggestedScrollPosition(suggestedRangeValue);
				suggestedStep = getSuggestedStep(suggestedScrollTo);
				
				if (doChange == true) {
        			animateToSuggestedPosition(suggestedScrollTo, slideAnimationSpeed);
	        		doChange = false;
	        		setTimeout(function() {
	        			doChange = true;
	        		}, changeTimeout);
	        	}
				
				$('#current-range-value').html('Current Range Value: ' + currentRangeValue);
				$('#suggested-range-value').html('Suggested Range Value: ' + suggestedRangeValue);
				$("#suggested-scroll-to").html('Suggested Scroll To: ' + suggestedScrollTo);
				$("#current-step").html('Suggested Current Step: ' + suggestedStep);
				
	        });
			
	        thisRangeAPI.change( function() {
	        	
				currentRangeValue = this.getValue();
				
				suggestedRangeValue = roundToMinChildWidth(currentRangeValue, minChildWidth);
				suggestedScrollTo = getSuggestedScrollPosition(suggestedRangeValue);
				suggestedStep = getSuggestedStep(suggestedScrollTo);

				if (doChange == true) {
					animateToSuggestedPosition(suggestedScrollTo, slideAnimationSpeed);

	        		doChange = false;
	        		setTimeout(function() {
	        			doChange = true;
	        		}, changeTimeout);
	        	}
	        	
	        	
		        	
	        });
        /* ------------- Range Input API ------------- */
	        
        /* ------------- View Area Related ------------- */

	        
	        
        /* ------------- View Area Related ------------- */

        /* ------------- Animation Related Things ------------- */
	        
	        function animateToSuggestedPosition(scrollPosition, baseSpeed) {
	        	suggestedScrollTo = getSuggestedScrollPosition(scrollPosition);
	        	suggestedSpeed = baseSpeed;
	        	
	        	var scrollOffset = scroll.offset();
	        	var scrollOffsetDifference = suggestedScrollTo + scrollOffset.left;
	        	var differenceMultiplier = Math.round(scrollOffsetDifference / scrollView.outerWidth());
	        	
	        	/* Keep it positive */
	        	if (differenceMultiplier < 0 || differenceMultiplier > 0) {
	        		if (differenceMultiplier < 0) {
	        			differenceMultiplier = -differenceMultiplier;
	        		}
	        		/* Now do things */
		        	if (differenceMultiplier > 0) {
		        		if (differenceMultiplier <= 3) {
		        			switch(differenceMultiplier) {
					        	case 1:
					        		/*handle.css('background-color', 'green');*/
					        		suggestedSpeed = suggestedSpeed * 1.5;
					        		break;
					        	case 2:
					        		/*handle.css('background-color', 'yellow');*/
					        		suggestedSpeed = suggestedSpeed * 2;
					        		break;
		        			}
		        		} else { 
		        			/*handle.css('background-color', 'red');*/
	        				suggestedSpeed = suggestedSpeed * 3;
	        			}
		        	}
	        	}

	        	scroll.stop().animate({ left: [-suggestedScrollTo, 'easeOutQuad'] }, suggestedSpeed);        	
	        	
	        }

        /* ------------- Animation Related Things ------------- */
		
		/* ------------- Functional Things ------------- */
	        
	        function getSuggestedStep(scrollPosition) {
	        	return Math.round(scrollPosition / minChildWidth);
	        }
	        
	        function getSuggestedScrollPosition(scrollPosition) {
	        	return Math.round(scrollPosition / minChildWidth) * minChildWidth;
	        }
		
	        function addChildItemsIdentityClass(selector) {
	            var childItemCount = $(selector).children().length;
	            var childValueId = 0;
	            while (childItemCount >= childValueId) {
	                $(selector).find('li:nth-child(' + childValueId + ')').addClass('cid-' + (childValueId - 1));
	                childValueId++;
	            }
	        }

	        function addChildItemsStepClass(selector, stepSize) {
	        	var itemLeft = 0;
				var itemStep = 0;
				$(selector).children().each(function () {
					itemLeft = this.offsetLeft;
					itemStep = itemLeft / stepSize;
					$(this).addClass('sid-' + itemStep);
				});
	        }
	
	        function getSliderHandleWidthFromContentSize(sliderSelector, scrollItemsSelector) {
	        	var sliderWidth = $(sliderSelector).outerWidth();
	        	var contentWidth = getAllChildrenWidth(scrollItemsSelector);
	        	return sliderWidth;
	        }
	        
	
	        function getAllChildrenWidth(selector) {
	            var allChildrenWidth = 0;
	            $(selector).children().each(function () {
	                allChildrenWidth = allChildrenWidth + $(this).outerWidth();
	            });
	            return allChildrenWidth;
	        }
	
	        function getMinimumChildWidth(selector) {
	            var minChildWidth = 0;
	            $(selector).children().each(function () {
	                if (minChildWidth <= 0 || minChildWidth >= $(this).outerWidth()) {
	                    minChildWidth = $(this).outerWidth();
	                }
	            });
	            return minChildWidth;
	        }
	
	        function getMaximumChildWidth(selector) {
	            var maxChildWidth = 0;
	            $(selector).children().each(function () {
	                if (maxChildWidth <= 0 || maxChildWidth <= $(this).outerWidth()) {
	                    maxChildWidth = $(this).outerWidth();
	                }
	            });
	            return maxChildWidth;
	        }
	
	        function getMaxRange(selector) {
	            var minChildWidth = getMinimumChildWidth(selector);
	            var thisMaxRange = 0;
	            if (getAllChildrenWidth(selector) > 0) {
	            	thisMaxRange = getAllChildrenWidth(selector) - scrollView.outerWidth();
	            }
	            return thisMaxRange;
	        }
	
	        function getActualSteps(selector) {
	            var minChildWidth = getMinimumChildWidth(selector);
	            var actualSteps = getMaxRange(selector) / minChildWidth;
	            return actualSteps;
	        }
	        
	        function roundToMinChildWidth(n, mcw){
	        	return ((n % mcw) > 0) ? n - (n % mcw) + mcw:n;
	    	}
        
        /* ------------- Functional Things ------------- */

        
        /* ------------- Dev Junk ------------- */
        
			// Useless and Useful
			var scrollItemsCount = $(scrollItems).children().length;
			var scrollItemNumber = 0;
			
			/* This Appends the Scroll Item Number 
			 * which does not factor in requirements
			 * related to item step number */
			while (scrollItemsCount >= scrollItemNumber) {
			    $(scrollItems).find(':nth-child(' + scrollItemNumber + ')')
			    			  .find('.si-inner')
			    			  .append('This Item Number: ' + (scrollItemNumber - 1) + '<br/>');
			    scrollItemNumber++;
			}

			/* Append Outer Width & Step Number */
			var scrollItemLeft = 0;
			var scrollItemStep = 0;
			$(scrollItems).children().each(function () {
				scrollItemLeft = this.offsetLeft;
				scrollItemStep = scrollItemLeft / minChildWidth;
				$(this).find('.si-inner').append('This Item Step: ' + scrollItemStep + '<br/>');
				$(this).find('.si-inner').append('This Outer Width: ' + $(this).outerWidth() + 'px<br/>');
			});

			
	        // KO VM for Dev Inquiries
	        function viewVarDataVM() {
	            var self = this;
	
	            // Think of the children
	            self.minimumChildWidth = ko.computed(function () {
	                return getMinimumChildWidth(scrollItems);
	            }, this);
	
	            self.maximumChildWidth = ko.computed(function () {
	                return getMaximumChildWidth(scrollItems);
	            }, this);
	
	            self.allChildrenWidth = ko.computed(function () {
	                return getAllChildrenWidth(scrollItems);
	            }, this);
	
	            // How Big
	            self.actualMaxRange = ko.computed(function () {
	                return getMaxRange(scrollItems);
	            }, this);
	
	            self.actualSteps = ko.computed(function () {
	                return getActualSteps(scrollItems);
	            }, this);
	            
	            self.sliderWidthFromContentSize = ko.computed(function () {
	                return getSliderHandleWidthFromContentSize(slider, scrollItems);
	            }, this);
	            
	            // Context
	            self.showScrollContext = $(scroll).context;
	            self.showScrollItemsContext = $(scrollItems).context;
	            self.showSliderContext = $(slider).context;
	        }
	        
	        // Apply KO Bindings
	        ko.applyBindings(new viewVarDataVM());
        
        /* ------------- Dev Junk ------------- */

    }); // End Document Ready
    
}); // End Head Ready


































// Junk


/* ------------- Development Visuals ------------- */

// What's What
/*suggestedStep = getSuggestedStep(suggestedScrollTo);
liveStepItem = '.sid-' + suggestedStep;
nextStepItem = '.sid-' + (suggestedStep + 1);
previousStepItem = '.sid-' + (suggestedStep - 1);
*/
// Know Things
//
//$("#live-step-item").html('Live Step Item Class: ' + liveStepItem);

// Colorful Things		
// $(scrollItems).find(liveStepItem).find('.si-inner').css('background', 'green');
// $(scrollItems).find(liveStepItem).find('.si-inner').css(defaultSiinnerBg);
// $(scrollItems).find(nextStepItem).find('.si-inner').css('background', 'red');
// $(scrollItems).find(previousStepItem).find('.si-inner').css('background', 'blue');

/* ------------- Development Visuals ------------- */

// highlightItemsInViewport(suggestedScrollTo);

/*
$('#current-range-value').html('Current Range Value: ' + currentRangeValue);
$("#suggested-scroll-to").html('Suggested Scroll To: ' + suggestedScrollTo);
$("#current-step").html('Suggested Current Step: ' + suggestedStep);*/

//function highlightItemsInViewport(targetScrollPosition) {
//	
//	suggestedStep = getSuggestedStep(targetScrollPosition);
//	liveStepItem = '.sid-' + suggestedStep;
//	
//	$(scrollItems).find(liveStepItem).find('.si-inner').css('background', 'green');
//	
//	
//}
