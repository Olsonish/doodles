var nlApp = angular.module('nlApp', []);

// CONTROLLERS
nlApp
.controller("nlController", function($scope, $rootScope, nlService) {

    /**
     * nlController:
     * natural language form controller
     */

	// solution or win selection items 
	$scope.solutionOrWinItems = nlService.getSolutionOrWinItems();

	// by default the solution or win value is set to solution
	$scope.solutionOrWin = nlService.getSolutionOrWinSelection();

    // have angular service filter industry and product items
    nlService.setUniqueIndustryItems();
    nlService.setUniqueProductItems();

    // set the industry and product items key value list for selection
    $scope.industryItems = nlService.getUniqueIndustryItems();
    $scope.productItems = nlService.getUniqueProductItems();

    // set the current industry and product item selections
    $scope.currentIndustryItem = nlService.getCurrentIndustryItem();
    $scope.currentProductItem = nlService.getCurrentProductItem();

    // win or solution selection and toggle
	$scope.nlSolutionOrWinFieldOpen = false;
	$scope.nlSolutionOrWinFieldOpenToggle = function(key) {

        // if a key is present and it is a new selection update selection and 
        // the form
		if (key && nlService.getSolutionOrWinSelection() != key) {

			// set solution or win as the selected key
			nlService.setSolutionOrWinSelection(key);
			$scope.solutionOrWin = nlService.getSolutionOrWinSelection();

            // reset industry and product item selections to default
            $scope.currentIndustryItem = nlService.resetCurrentIndustryItem();
            $scope.currentProductItem = nlService.resetCurrentProductItem();

            // update unique industry and product selections
            nlService.setUniqueIndustryItems();
            nlService.setUniqueProductItems();

            // udpate industry and product items for scope
            $scope.industryItems = nlService.getUniqueIndustryItems();
            $scope.productItems = nlService.getUniqueProductItems();
		}

		// set field open back to what it was (false) for class toggle
		$scope.nlSolutionOrWinFieldOpen = !$scope.nlSolutionOrWinFieldOpen;
	}
    $scope.solutionOrWinOptionsMouseOut = function() {
        $scope.nlSolutionOrWinFieldOpen = false;
    }

    // industry selection and toggle
    $scope.nlIndustryFieldOpen = false;
    $scope.nlIndustryFieldOpenToggle = function(key) {
        if (key) {

            // reset product item selection to default
            $scope.currentProductItem = nlService.resetCurrentProductItem();

            // set industry selection in angular service and update scope
            nlService.setCurrentIndustryItem(key);
            $scope.currentIndustryItem = nlService.getCurrentIndustryItem();

            // update then get unique product items according to industry key
            nlService.setUniqueProductItems(key);
            $scope.productItems = nlService.getUniqueProductItems();

        }
        $scope.nlIndustryFieldOpen = !$scope.nlIndustryFieldOpen;
    }
    $scope.industryOptionsMouseOut = function() {
        $scope.nlIndustryFieldOpen = false;
    }

    // product selection and toggle
    $scope.nlProductFieldOpen = false;
    $scope.nlProductFieldOpenToggle = function(key) {
        if (key) {
            nlService.setCurrentProductItem(key);
            $scope.currentProductItem = nlService.getCurrentProductItem();
        }
        $scope.nlProductFieldOpen = !$scope.nlProductFieldOpen;
    }
    $scope.productItemsMouseOut = function() {
        $scope.nlProductFieldOpen = false;
    }

    // clicked on find it!
    $scope.nlFindItClicked = function() {
        var out = {},
            fakeSearchURL = "http://httpserver.lucid.vm/#",
            fakeURLQuery;

        out.type = nlService.getSolutionOrWinSelection();
        out.industry = nlService.getCurrentIndustryItem();
        out.product = nlService.getCurrentProductItem();

        // build a fake query string for the seearch example
        fakeURLQuery = "search?type=" + out.type +
                        "&industry=" + out.industry +
                        "&product=" + out.product;

        // spaces to %20
        fakeURLQuery = fakeURLQuery.split(' ').join('%20');

        // add the fake query to the fake url
        fakeSearchURL += fakeURLQuery;

        // since this is fake and a demo just open a real new window to the fake
        // # url
        window.open(fakeSearchURL);
    }
})
.controller("nlResultsController", function($scope, $rootScope, nlService) {

    /**
     * nlResultsController:
     * natural language form results controller
     */

    // common function for showing or hiding results
    selectionMade = function() {
        if(nlService.getCurrentProductItem() != nlService.getDefaultProductItem() ||
            nlService.getCurrentIndustryItem() != nlService.getDefaultIndustryItem()) {
            $scope.nlSelectionMade = true;
        } else {
            $scope.nlSelectionMade = false;
        }
    }

    // show hide results if selections are made
    $scope.nlSelectionMade = false;
    $rootScope.$on('nlProductSelected', selectionMade);
    $rootScope.$on('nlIndustrySelected', selectionMade);
    $rootScope.$on('nlProductsUpdated', function() {
        // when products are updated the nl form is reset and results should be
        // hidden again
        $scope.nlSelectionMade = false;
    });

    // results
    $scope.products = nlService.getAllProductItems();
    $rootScope.$on('nlProductsUpdated', function() {
        $scope.products = nlService.getAllProductItems();
    });    
    // filter
    $scope.matchNL = function() {
        return function(product) {
            var isMatch = false;
            // if an industry is selected show all matches for the industry
            if (nlService.getCurrentIndustryItem() != nlService.getDefaultIndustryItem()) {
                // if the product item industry matches the current selection return true
                if (product.industry == nlService.getCurrentIndustryItem()) {
                    isMatch = true;
                }
                // if product selection is not default set match back to false and 
                // check that the product item product and industry match the current
                // product and industry selections
                if (nlService.getCurrentProductItem() != nlService.getDefaultProductItem()) {
                    isMatch = false;
                    if (product.product == nlService.getCurrentProductItem() &&
                        product.industry == nlService.getCurrentIndustryItem()) {
                        isMatch = true;
                    }
                }
            }
            // if no industry is selected still do a check to see if a product 
            // is selected
            else {
                if (nlService.getCurrentProductItem() != nlService.getDefaultProductItem()) {
                    if (product.product == nlService.getCurrentProductItem()) {
                        isMatch = true;
                    }
                }
            }
            return isMatch;
        };
    }
});
// /CONTROLLERS

// SERVICES
nlApp.factory('nlService', function($http, $rootScope) {
	var service = {},
		_solutionOrWinItems = { solution: "solution", win: "win" },
        _solutionItems = [{"name":"Solution 1","industry":"Finance","product":"ITOM"},{"name":"Solution 2","industry":"Finance","product":"ITSM"},{"name":"Solution 3","industry":"Education","product":"ITSM"},{"name":"Solution 4","industry":"Media","product":"HR Service Automation"},{"name":"Solution 5","industry":"Federal","product":"ITSM"},{"name":"Solution 6","industry":"Federal","product":"ITBM"},{"name":"Solution 7","industry":"Retail","product":"Knowledge Management"},{"name":"Solution 8","industry":"Retail","product":"SIAM"},{"name":"Solution 9","industry":"Technology","product":"Work Management"},{"name":"Solution 10","industry":"Services","product":"Asset Management"}],
        _winItems = [{"name":"Solution Wins 1","industry":"Finance","product":"IT Cost Management"},{"name":"Solution Wins 2","industry":"Finance","product":"Facilities Service Management"},{"name":"Solution Wins 3","industry":"Education","product":"Facilities Service Management"},{"name":"Solution Wins 4","industry":"Media","product":"HR Service Automation"},{"name":"Solution Wins 5","industry":"Federal","product":"Facilities Service Management"},{"name":"Solution Wins 6","industry":"Federal","product":"IT Governance, Risk, and Compliance"},{"name":"Solution Wins 7","industry":"Media","product":"Knowledge Management"},{"name":"Solution Wins 8","industry":"Media","product":"IT Governance, Risk, and Compliance"},{"name":"Solution Wins 9","industry":"Technology","product":"Work Management"},{"name":"Solution Wins 10","industry":"Technology","product":"Asset Management"}],
        _industryProductItems = [],
        _uniqueIndustryItems = {},
        _uniqueProductItems = {},
		_solutionOrWin = _solutionOrWinItems.solution,
        _defaultIndustryItem = "any industry",
        _defaultProductItem = "any product",
        _currentIndustryItem = angular.copy(_defaultIndustryItem),
        _currentProductItem = angular.copy(_defaultProductItem);

    // by default solutions are selected
    _industryProductItems = angular.copy(_solutionItems);

    service.getAllProductItems = function() {
        return _industryProductItems;
    }
	service.getSolutionOrWinItems = function() {
		return _solutionOrWinItems;
	}
	service.getSolutionOrWinSelection = function() {
		return _solutionOrWin;
	}
	service.setSolutionOrWinSelection = function(key) {

        // set industry product items data according to key
        if (key == "solution") {
            _industryProductItems = angular.copy(_solutionItems);
        }
        if (key == "win") {
            _industryProductItems = angular.copy(_winItems);
        }

        // set display and selection value
		_solutionOrWin = _solutionOrWinItems[key];
        $rootScope.$broadcast('nlProductsUpdated');
	}

    service.getUniqueIndustryItems = function() {
        return _uniqueIndustryItems;
    }
    service.setUniqueIndustryItems = function() {
        var out = {
                "any industry": "any industry"
            },
            industries = [];
        // setup unique industries list
        angular.forEach(_industryProductItems, function(item) {
            var industry = item.industry;
            if (industries.indexOf(industry) === -1) {
                industries.push(industry);
                out[industry] = industry;
            }
        });
        _uniqueIndustryItems = out;
    }
    service.getCurrentIndustryItem = function() {
        return _currentIndustryItem;
    }
    service.setCurrentIndustryItem = function(selection) {
        _currentIndustryItem = selection;
        $rootScope.$broadcast('nlIndustrySelected');
    }

    service.getUniqueProductItems = function() {
        return _uniqueProductItems;
    }
    service.setUniqueProductItems = function(industry) {
        var out = {
                "any product": "any product"
            },
            products = [];
        // setup unique products list
        angular.forEach(_industryProductItems, function(item) {
            var product = item.product;
            if (products.indexOf(product) === -1) {

                // if industry is defined exclude non matches
                if (industry) {
                    if (item.industry == industry) {
                        products.push(product);
                        out[product] = product;
                    }
                    // sometimes the selection is the same as the default or
                    // returns to default "any industry"
                    else if (_currentIndustryItem == _defaultIndustryItem) {
                        products.push(product);
                        out[product] = product;
                    }
                }
                // if industry is default include
                else if (_currentIndustryItem == _defaultIndustryItem) {
                    products.push(product);
                    out[product] = product;
                }
                // otherwise do not include
            }
        });
        _uniqueProductItems = out;
    }
    service.getCurrentProductItem = function() {
        return _currentProductItem;
    }
    service.setCurrentProductItem = function(selection) {
        _currentProductItem = selection;
        $rootScope.$broadcast('nlProductSelected');
    }

    service.resetCurrentIndustryItem = function() {
        _currentIndustryItem = angular.copy(_defaultIndustryItem);
        return _currentIndustryItem;
    }
    service.resetCurrentProductItem = function() {
        _currentProductItem = angular.copy(_defaultProductItem);
        return _currentProductItem;
    }
    service.getDefaultProductItem = function() {
        return _defaultProductItem;
    }
    service.getDefaultIndustryItem = function() {
        return _defaultIndustryItem;
    }

	return service;
});
// /SERVICES
