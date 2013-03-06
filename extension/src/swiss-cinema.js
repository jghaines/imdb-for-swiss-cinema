// ==UserScript==                                                               
// @name			IMDB for Swiss cinema
// @namespace		http://www.jhaines.name/imdb-for-swiss-cinema/
// @author			Jason Haines
// @version			0.0
// @description		Add IMDb links and ratings to Swiss cinema sites.
// ==/UserScript==                                                              


//
// Chrome prefers the @match declarations, but this prevents cross-origin requests (http://code.google.com/chrome/extensions/xhr.html)
// from cineman.ch to imdb.com
//

function CinemanListHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on a www.cineman.ch list page
    //
    // cineman.ch movie links look like:
    //   <td width="300" class="">
    //     <a class="listingtitle" href="/en/movie/2011/DieSchluempfe/" title="The Smurfs">The Smurfs</a>
    //   ...</td>
    //   <td><a class="ceebox">...</a>...</td>
    //
    // The IMDb links are added before the "ceebox"
    // </summary>

	var loggingOn = false;
    
    // regex to match the cineman pages
    var cinemanUrlRegex = new RegExp( 
    	"cineman.ch/.*/(comingsoon|jetzt_im_kino.php|openair/movies.php|process.php|showtimes/|theatre/detail.php)" );
    
    // regex to match the cineman movie URLs so that the year ($1) can be extracted
    var cinemanMovieUrlRegex = new RegExp( "/movie/(19[0-9]{2}|20[0-9]{2})/" );
    
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return ( null !=
			href.match( cinemanUrlRegex ));
	};
	
    
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // This cineman.ch version looks for @class=listingtitle elements
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

        return baseElement.getElementsByClassName("listingtitle");
    };
    
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        // The function decides on the best positioning of the element for the page layout.
        // A simple version might be to insert the ratingElement immediately before the movieElement.
        //
        // This cineman.ch version adds the element to the adjacent TD table cell.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		loggingOn?GM_log( "CinemanListHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0); 

        var ratingTableCell = movieElement.parentElement.nextElementSibling;
        ratingTableCell.insertBefore( ratingElement, ratingTableCell.firstChild );
    };
    
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // This cineman.ch version is able to extract the release year and this is appended.
        //
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

        var movieName = movieElement.innerHTML;
		movieName = movieName.replace( /^\s+/, "" ); // strip leading whitespace
		movieName = movieName.replace( /\s+$/, "" ); // strip trailing whitespace
        
		var href = movieElement.getAttribute("href");
		loggingOn?GM_log( "CinemanListHandler.getMovieNameForMovieElement() Checking for year in href=" + href + " )" ):void(0); 
        var match = cinemanMovieUrlRegex.exec( href );
        if ( match ) {
            var movieYear = match[1];
            movieName = movieName + " (" + movieYear + ")";
        }
        
        return movieName;
    };
};

function CinemanMovieHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on a www.cineman.ch movie page
    //
    // cineman.ch movie links look like:
    //   <td width="300" class="">
    //     <a class="listingtitle" href="/en/movie/2011/DieSchluempfe/" title="The Smurfs">The Smurfs</a>
    //   ...</td>
    //   <td><a class="ceebox">...</a>...</td>
    //
    // The IMDb links are added before the "ceebox"
    // </summary>

	var loggingOn = false;
    
    // regex to match the cineman movie URLs so that the year ($1) can be extracted
    var cinemanMovieUrlRegex = new RegExp("/movie/(19\d\d|20\d\d)/");
    
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return ( null != href.match( "cineman.ch/movie/(19\d\d|20\d\d)/" ));
	};
	
    
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // This cineman.ch version looks for @class=listingtitle elements
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

        return [ $( "div[class=moviedetailTitle] h1 a" ) ];
    };
    
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        // The function decides on the best positioning of the element for the page layout.
        // A simple version might be to insert the ratingElement immediately before the movieElement.
        //
        // This cineman.ch version adds the element to the adjacent TD table cell.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		loggingOn?GM_log( "CinemanMovieHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0); 
        $( ratingElement ).insertAfter("div[class=sparte_header]");
    };
    
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // This cineman.ch version is able to extract the release year and this is appended.
        //
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

        var movieName = movieElement.innerHTML;
        
        var match = cinemanMovieUrlRegex.exec( window.location.pathname );
        if ( match ) {
            var movieYear = match[1];
            movieName = movieName + " (" + movieYear + ")";
        }
        
        return movieName;
    };
};

function FilmPodiumHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on filmpodium.ch.
    // </summary>

	var loggingOn = false;
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return (null != href.match( "filmpodium.ch/.*/ReiheInfo.aspx" ));
	};
	
    
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

		return $("a[href^='FilmDetails.aspx']", baseElement);
    };
    
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		loggingOn?GM_log( "FilmPodiumHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0); 
		movieElement.parentElement.appendChild( document.createElement("br") );
		movieElement.parentElement.appendChild( ratingElement );

        // var ratingTableCell = movieElement.parentElement.parentElement.parentElement.nextElementSibling;
        // ratingTableCell.insertBefore( ratingElement, ratingTableCell.firstChild );
    };
    
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

        var movieName = movieElement.text;
        
		// add year
		var matchYear = movieElement.parentElement.textContent.match( /Regie:.*\s(19\d\d|20\d\d)/ ); // eg. Regie: Richard Lester, GB 1964
		if ( null != matchYear ) {
			movieName = movieName + " (" + matchYear[1] + ")"; // first group contains year
		}

        return movieName;
    };
};

function extractKitagMovieName( movieName ) {
	if ( undefined != movieName ) {
		movieName = movieName.replace( /\s*-\s*(DIGITAL|3D)\s*$/, '' );
		movieName = movieName.replace( /^\w+\s+M.NNERABEND\s+/, '' );
		movieName = movieName.replace( /^\w+\s+LADIES NIGHT\s+/, '' );
	}
               
	return movieName;
}
               
function KitagIndexHandler () {
	// <summary>
	// Implement a PageHandler for finding movie links on kitag.com list pages - Index.aspx, Kino.aspx
	// </summary>
 
	var loggingOn = false;
	var log = log4javascript.getLogger("SwissCinema.KitagIndexHandler");
			   
	this.match = function(href) {
		// <summary>
		// Whether this class is a handler for the given href
		//
		// @parameter href The URL we are on
		// @returns whether we can handle this page
		// </summary>

		return (null != href.match( "kitag\.(com|ch)/Programm/(Index|Kino).aspx" ));
	};
			   
   
	this.getMovieElements = function(baseElement, href) {
		// <summary>
		// Find and return all the DOM Elements that are associated with movie references in the given page
		//
		// @parameter baseElement the DOM Element (document.body) to search in
		// @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
		// </summary>

		return $('a[href^="Film.aspx"]:not(:has(img)):not([id$="Trailer"])', baseElement);
	};
   
	
	this.addRatingElement = function( ratingElement, movieElement ) {
		// <summary>
		// Adds a given DOM ratingElement relative to the given movieElement.
		// The function decides on the best positioning of the element for the page layout.
		// A simple version might be to insert the ratingElement immediately before the movieElement.
		//
		// @parameter ratingElement the DOM Element to add
		// @parameter movieElement an element from the list from this.getMovieElements()
		// </summary>

		log.info( "KitagHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" );
		var ratingContainer = $(movieElement).parent().parent().next().find('td');
							   
		ratingContainer.prepend("<br />");
		ratingContainer.prepend( ratingElement );
	};
   
	
	this.getMovieNameForMovieElement = function(movieElement) {
		// <summary>
		// Returns the movie name for the given movieElement.
		//
		// @parameter movieElement an element from the list from this.getMovieElements()
		// @returns The name of the movie, optionally with " (release-year)" appended
		// </summary>
 
		return extractKitagMovieName(movieElement.text);
	};
};
 
function KitagFilmHandler () {
	// <summary>
	// Implement a PageHandler for finding movie links on kitag.com.
	// </summary>
 
	var loggingOn = false;
   
	this.match = function(href) {
		// <summary>
		// Whether this class is a handler for the given href
		//
		// @parameter href The URL we are on
		// @returns whether we can handle this page
		// </summary>
						   
		return (null != href.match( "kitag\.(com|ch)/Programm/Film.aspx" ));
	};
			   
   
	this.getMovieElements = function(baseElement, href) {
		// <summary>
		// Find and return all the DOM Elements that are associated with movie references in the given page
		//
		// @parameter baseElement the DOM Element (document.body) to search in
		// @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
		// </summary>
							   
		return $('td[class="tdMatrixMovie"] span', baseElement);
	};
   
	
	this.addRatingElement = function( ratingElement, movieElement ) {
		// <summary>
		// Adds a given DOM ratingElement relative to the given movieElement.
		// The function decides on the best positioning of the element for the page layout.
		// A simple version might be to insert the ratingElement immediately before the movieElement.
		//
		// @parameter ratingElement the DOM Element to add
		// @parameter movieElement an element from the list from this.getMovieElements()
		// </summary>

		loggingOn?GM_log( "KitagHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0);
							   
		var ratingContainer = $( $( movieElement ).parent().parent().next().children()[0] );
							   
		ratingContainer.prepend("<br />");
		ratingContainer.prepend( ratingElement );
	};
   
	
	this.getMovieNameForMovieElement = function(movieElement) {
		// <summary>
		// Returns the movie name for the given movieElement.
		//
		// @parameter movieElement an element from the list from this.getMovieElements()
		// @returns The name of the movie, optionally with " (release-year)" appended
		// </summary>
 
		return extractKitagMovieName( movieElement.innerText );
	};
};

function extractOrangeCinemaMovieName( movieName ) {
	movieName = movieName.replace( /^\s*[^\w]+/, "" ); // strip leading non-word (left angle quote)
	movieName = movieName.replace( /^\s*/, "" ); // strip leading spaces
	movieName = movieName.replace( /^.+Night\s*\:\s*/, "" ); // strip special Nights (Orange, ZKB etc)
	movieName = movieName.replace( /^.*Vorpremiere\s*\:\s*/, "" ); // other prefixes
	movieName = movieName.replace( /^Deutschschweizer Erstauff.hrung\s*\:\s*/, "" );
	movieName = movieName.replace( /^Z.rich Film Festival\s*\:\s*/, "" );
	movieName = movieName.replace( /^Live orchestriert\s*\:\s*Charlie Chaplin\s*[-\:]*\s*/, "" );
	movieName = movieName.replace( /^\s*/, "" ); // strip leading spaces again
	movieName = movieName.replace( /\s*[^\w]?\s*$/, ""); // strip trailing non-word (right angle quote)

	return movieName;
};

function OrangeCinemaProgramHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on orangecinema.ch.
    //
    // The IMDb links are added 
    // </summary>

	var loggingOn = false;
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return (null != href.match( "orangecinema.ch/.*/overview.php" ));
	};
	
    
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // This cineman.ch version looks for @class=listingtitle elements
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

		return $(baseElement).find("a[href^='event.php']");
    };
    
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        // The function decides on the best positioning of the element for the page layout.
        // A simple version might be to insert the ratingElement immediately before the movieElement.
        //
        // This version adds the element to the adjacent TD table cell.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		loggingOn?GM_log( "OrangeCinemaHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0); 
		$( movieElement ).parents("tr:first").children("td:last").prev().append( ratingElement );

        // var ratingTableCell = movieElement.parentElement.parentElement.parentElement.nextElementSibling;
        // ratingTableCell.insertBefore( ratingElement, ratingTableCell.firstChild );
    };
    
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

        var movieName = extractOrangeCinemaMovieName( movieElement.text );

		// add year
		var movieDescription = $( movieElement).parents("tr:first").next().text();
		var matchYear = movieDescription.match( /\s+(19[0-9]{2}|20[0-9]{2}),/ ); // e.g. " 2012,"
		if ( null != matchYear ) {
			movieName = movieName + " (" + matchYear[1] + ")"; // first group contains year
		}
		
        return movieName;
    };
};

function OrangeCinemaSpecialsListHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on the specials list page on orangecinema.ch.
    //
	//
    // The IMDb links are added 
    // </summary>

	var loggingOn = false;
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return (null != href.match( "orangecinema.ch/.*/specials_01.php" ));
	};
	
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // This cineman.ch version looks for @class=listingtitle elements
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

		var elements = $(baseElement).find("a[href^='specials']");
		elements = elements.filter(function () { return /specials_(?!01).*.php/.test(this.href); }); // not specials_01 links
		elements = elements.filter(function () { return /\w+/.test(this.innerText); }); // not tab links (empty, IMG links)
		return elements;
    };
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        // The function decides on the best positioning of the element for the page layout.
        // A simple version might be to insert the ratingElement immediately before the movieElement.
        //
        // This version adds the element to the adjacent TD table cell.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		loggingOn?GM_log( "OrangeCinemaSpecialsHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0); 
		var containingRow = $( movieElement ).parents("tr:first");
		var newTd = document.createElement("td");
		newTd.appendChild(ratingElement);
		containingRow.append(newTd);
    };
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

        return extractOrangeCinemaMovieName( movieElement.text );
    };
};

function StarticketHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on a www.starticket.ch movie page
    // </summary>

	var loggingOn = false;
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return ( null != href.match( "starticket.ch/orangecinema.*/0Showlist.asp.*" ));
	};
    
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

		return $( "tr[class=bglightgray][onmouseover]", baseElement );
    };
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		loggingOn?GM_log( "StarticketHandler.addRatingElement( " + ratingElement + ", " + movieElement + " )" ):void(0); 
		$("td:nth-child(4)", movieElement).append(ratingElement);
    };
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // This cineman.ch version is able to extract the release year and this is appended.
        //
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

        var movieName = $( "a:first", movieElement).text();
        movieName = extractOrangeCinemaMovieName( movieName );
   		loggingOn?GM_log( "StarticketHandler.getMovieNameForMovieElement( " + movieElement + " )=" + movieName ):void(0); 
        return movieName;
    };
};

function ZffHandler () {
    // <summary>
    // Implement a PageHandler for finding movie links on a zff.com movie page
    // </summary>

	var loggingOn = false;
    
	this.match = function(href) {
        // <summary>
        // Whether this class is a handler for the given href
        //
        // @parameter href The URL we are on
        // @returns whether we can handle this page
        // </summary>
		
		return ( null != href.match( "zff.com/(en/programme|de/programm|fr/programme)/" ));
	};
    
    this.getMovieElements = function(baseElement) {
        // <summary>
        // Find and return all the DOM Elements that are associated with movie references in the given page
        //
        // @parameter baseElement the DOM Element (document.body) to search in 
        // @returns an array of DOM Elements of each movie reference (e.g. their hyperlink)
        // </summary>

		return $('a[href *= "/movies/"]', baseElement );
    };
    
    this.addRatingElement = function( ratingElement, movieElement ) {
        // <summary>
        // Adds a given DOM ratingElement relative to the given movieElement.
        //
        // @parameter ratingElement the DOM Element to add
        // @parameter movieElement an element from the list from this.getMovieElements()
        // </summary>

		$(ratingElement).css( "float", "right" );

		$('h3', movieElement).append( ratingElement );
    };
    
    this.getMovieNameForMovieElement = function(movieElement) {
        // <summary>
        // Returns the movie name for the given movieElement.
        // 
        // This cineman.ch version is able to extract the release year and this is appended.
        //
        // @parameter movieElement an element from the list from this.getMovieElements()
        // @returns The name of the movie, optionally with " (release-year)" appended 
        // </summary>

		return $('h3', movieElement).clone()
            .children()
            .remove()
            .end()
            .text();
        };
};

// function to be embedded into ImdbInfo objects
function getImdbUrl() {
	// <summary>
	// The IMDb URL of this movie
	//
	// @returns A URL that will return the link for this movie in IMDb
	// </summary>
	
	return "http://www.imdb.com/title/" + this.imdbID + "/";       
};

function ImdbInfo () {
    // <summary>
    // A class to encapsulate IMDb reference info.
    // </summary>
    
    this.ID 	= "";	// IMDb Id. e.g. tt0499549
    this.Title	= "";	// the movie title
    this.Year	= 0;	// release year
    this.Rating	= 0;	// IMDb rating out of 10.0
    
    this.getUrl = getImdbUrl;	// method to return IMDB URL
};

function ImdbComMovieLookup () {
    // <summary>
    // A class that uses http://www.imdb.com/ to lookup movie info
    // </summary>
    // this doesn't appear to be working (march 2013)

    
    var loggingOn = false;

	this.imdbSearchUrl = function(movieName) {
        // <summary>
        // Utility function. A URL to do a title search for the given movieName on IMDb.
        // Search is more accurate if release year is appended. e.g. "Avatar (2009)" 
        //
        // @parameter movieName The movie name as on the original page
        // @returns A URL that will return search results from IMDb
        // </summary>
        
        return "http://www.imdb.com/find?s=tt&q=" + movieName;
    };
  

    this.parseImdbSearchPage = function( movieName, imdbPageText, onloadImdbInfo ) {
        // <summary>
        // Parse an IMDb search results page. Parse (via callback) the first results link.
        //
        // @parameter movieName The movie name as on the original page
        // @parameter imdbPageText The text of the search results page
		// @parameter onloadImdbInfo Function(movieName, imdbInfo) that is called on completion
        // <summary>
        var imdbFirstResultRegex = new RegExp('Popular Titles.*?href="(/title/tt[0-9]+/)"');

        var resultMatch = imdbFirstResultRegex.exec(imdbPageText); 
        
        if ( resultMatch == null ) {
            GM_log("ImdbComMovieLookup.parseImdbSearchPage() - Couldn't find first search result for " + movieName);
        } else {
                    
            var firstResultUrl = "http://www.imdb.com" + resultMatch[1]; 
            var that = this; // ensure callback to correct object
        
            GM_xmlhttpRequest({
                'method': 'GET',
                'url': firstResultUrl,
                'onload': function (xhr) {
                    that.parseImdbPage( movieName, xhr.responseText, onloadImdbInfo );
                }
            });
        }
    };

	
	this.parseImdbPage = function( movieName, imdbPageText, onloadImdbInfo ) {
        // <summary>
        // Parse a page returned from an IMDb search. May be a movie result or a search page.
        //
        // @parameter movieName The movie name as on the original page
        // @parameter imdbPageText The text of the page. 
		// @parameter onloadImdbInfo Function(movieName, imdbInfo) that is called on completion
        // </summary>

		loggingOn?GM_log("ImdbComMovieLookup.parseImdbPage( " + movieName + ", <imdbPageText> " + onloadImdbInfo + " )"  ):void(0);

       
        // search resolved to a movie page
        var searchPageRegex = new RegExp("<title>.*?Search.*?</title>", "m"); 
        var moviePageRegex = new RegExp("<title>(.*?) \\((\\d{4}).*?</title>(?:.*?\n)*?.*?/title/(tt\\d+)/", "im"); 
        
        if ( searchPageRegex.test( imdbPageText )) { // search returned a results page
            loggingOn?GM_log("multiple matches found"):void(0);

            this.parseImdbSearchPage(movieName, imdbPageText, onloadImdbInfo );
 
        } else if ( moviePageRegex.test( imdbPageText ) ) { // search returned a movie page
            
            var imdbInfo = new ImdbInfo(); // extracted movieInfo
                                          
            imdbInfo.Title = RegExp.$1;
            imdbInfo.Year = RegExp.$2;
            imdbInfo.imdbID = RegExp.$3;
            
            var ratingRegex = new RegExp('<span [^>]*itemprop="ratingValue"[^>]*>([\.0-9]+)</span>');
            var matchRatingRegex = ratingRegex.exec(imdbPageText);
            if ( matchRatingRegex != undefined ) {
                imdbInfo.Rating = matchRatingRegex[1];

				// invoke the callback - we have the data!
				onloadImdbInfo( movieName, imdbInfo );
			} else {
				// match failed
         	   loggingOn?GM_log( "ImdbComMovieLookup.parseImdbPage() couldn't match span on " + movieName ):void(0);
        	}
            
        } else {
            // match failed
            loggingOn?GM_log( "ImdbComMovieLookup.parseImdbPage() couldn't parse IMDb search result page for " + movieName ):void(0);
        }
	};
	
	
    this.loadImdbInfoForMovieName = function( movieName, onloadImdbInfo ) {
		// <summary>
		// Load the ImdbInfo for the given movieName, invoke the onloadImdbInfo callback on completion.
		//
        // @parameter movieName The movie name as on the original page
		// @parameter onloadImdbInfo Function(movieName, imdbInfo) that is called on completion
		// </summary>

		loggingOn?GM_log("ImdbComMovieLookup.loadImdbInfoForMovieName( " + movieName + ", " + onloadImdbInfo + " )"  ):void(0);
		
		var that = this; // route the XHR callback to correct object
        GM_xmlhttpRequest({
            'method': 'GET',
            'url':  this.imdbSearchUrl(movieName),
            'onload': function (xhr) {
                that.parseImdbPage( movieName, xhr.responseText, onloadImdbInfo );
            }
        });
	}
}

function ImdbapiComMovieLookup () {
    // <summary>
    // A class that uses http://www.omdbapi.com/ to lookup movie info
    // </summary>


    var loggingOn = false;

	this.imdbSearchUrl = function(movieName) {
        // <summary>
        // A URL that will search for the movieName on imdb.com.
		// We use imdb.com since imdbapi.com doesn't return (particarly) human readable results
        //
        // @parameter movieName The movie name as on the original page
        // @returns A URL that will return search results from IMDb
        // </summary>
        
        return "http://www.imdb.com/find?s=tt&q=" + movieName;
    };
  

	this.imdbapiSearchUrl = function(movieSearchString) {
        // <summary>
        // Utility function. A URL to do a title search for the given movieName on IMDb.
        // Search is more accurate if release year is provided. 
        //
        // @parameter movieName The movie name as on the original page
        // @parameter movieYear (optional) The year of the movie
        // @returns A URL that will return search results from IMDb
        // </summary>
        
        var movieName = movieSearchString;
        var movieYear;

        var movieYearRegex = new RegExp( /\s*\(([0-9]+)\)$/ );
        var movieYearRegexMatch = movieSearchString.match( movieYearRegex );

        if ( movieYearRegexMatch != null ) {
            movieYear = movieYearRegexMatch[1];
            movieName = movieSearchString.replace( movieYearRegex, "" ); // name is search string without the year
        }
        
        movieName = movieName
            .replace( /\s+and\s+/g, ' ' ) // fix "and" vs "&" omdbapi 'bug' 
            .replace( /\xE9/g, 'e' ) // accent-e euro-character omdbapi bug
            .replace( /\xE4/g, 'a' ) // umlaut-a euro-character omdbapi bug
            .replace( /\xF6/g, 'o' ) // umlaut-o euro-character omdbapi bug
            .replace( /\xFC/g, 'u' ) // umlaut-u euro-character omdbapi bug
        ;
        
        var searchUrl = "http://www.omdbapi.com/?s=" + movieName;
        if ( movieYear ) { // optional argument was provided
            searchUrl += "&y=" + movieYear;
        }

        return searchUrl;
    };
  

    this.parseApiSearchResults = function( movieSearchString, imdbApiSearchInfo, onloadImdbInfo ) {
        // <summary>
        // Parse a page returned from an IMDb API search.
        //
        // @parameter movieName The movie name as on the original page
        // @parameter imdbPageText The text of the page. 
        // @parameter onloadImdbInfo Function(movieName, imdbInfo) that is called on completion
        // @returns An IMDb info object 
        // </summary>

        loggingOn?GM_log("ImdbapiComMovieLookup.parseApiSearchResults( " + movieSearchString + ", <imdbPageText> " + onloadImdbInfo + " )" ):void(0);

        // filter only movies, get the imdbID of the first (best) match
        var imdbID = $( imdbApiSearchInfo["Search"] ).filter( function() { return "movie" == this["Type"]; } )[0]["imdbID"]

        if ( imdbID ) {
            var lookupUrl = "http://www.omdbapi.com/?tomatoes=true&i=" + imdbID;
            loggingOn?GM_log("ImdbapiComMovieLookup.parseApiSearchResults() lookupUrl=" + lookupUrl ):void(0);

            var that = this; // route the XHR callback to correct object
            $.ajax({
                dataType: "json",
                url: lookupUrl,
                success: function(data) { 
                    that.parseApiLookupResult( movieSearchString, data, onloadImdbInfo );
                }
            });
        } else  {
            loggingOn?GM_log("ImdbapiComMovieLookup.parseApiSearchResults() lookup failed" ):void(0);
            loggingOn?GM_log("ImdbapiComMovieLookup.parseApiSearchResults() omdbapi Error: " + imdbApiSearchInfo["Error"] ):void(0);
        }

    };
    
    
    this.parseApiLookupResult = function( movieSearchString, imdbInfo, onloadImdbInfo ) {
        // <summary>
        // Parse a page returned from an IMDb search. May be a movie result or a search page.
        //
        // @parameter movieName The movie name as on the original page
        // @parameter imdbPageText The text of the page. 
        // @parameter onloadImdbInfo Function(movieName, imdbInfo) that is called on completion
        // @returns An IMDb info object 
        // </summary>

        loggingOn?GM_log("ImdbapiComMovieLookup.parseApiPage( " + movieSearchString + ", <imdbPageText> " + onloadImdbInfo + " )"  ):void(0);

        // augment with getUrl function
        imdbInfo.getUrl = getImdbUrl;

        onloadImdbInfo( movieSearchString, imdbInfo );
    };
    
    
    this.loadImdbInfoForMovieName = function( movieSearchString, onloadImdbInfo ) {
		// <summary>
		// Load the ImdbInfo for the given movieName, invoke the onloadImdbInfo callback on completion.
		//
        // @parameter movieSearchString The movie name, with optional year in brackets (e.g. "Matrix (1999)")
		// @parameter onloadImdbInfo Function(movieName, imdbInfo) that is called on completion
		// </summary>

		loggingOn?GM_log("ImdbapiComMovieLookup.loadImdbInfoForMovieName( " + movieSearchString + ", " + onloadImdbInfo + " )"  ):void(0);

		var searchUrl = this.imdbapiSearchUrl( movieSearchString );
		loggingOn?GM_log("ImdbapiComMovieLookup.loadImdbInfoForMovieName() - searchUrl=" + searchUrl  ):void(0);
		
		var that = this; // route the callback to correct object
        $.ajax({
            dataType: "json",
            url: searchUrl,
            success: function(data) { 
                that.parseApiSearchResults( movieSearchString, data, onloadImdbInfo );
            }
        });
	}
}

function ImdbMarkup ( pageHandler, movieLookupHandler, cache ) {
    // <summary>
    // Markup a page with IMDb ratings.
    //
    // The public doMarkup() method will markup the specified page.
    //
    // @parameter pageHandler An object that implements the website-specific methods that will find the movie elements in the HTML page.
    // @parameter movieLookupHandler An object that implements the methods that will lookup movie details from an external website.
	// @parameter cache (optional) A Map object for caching movienames and imdbInfo objects
    // <summary>
    this.pageHandler = pageHandler;
	this.movieLookupHandler = movieLookupHandler;
    this.cache = cache;
    
    var loggingOn = false;
    
	
	this.putImdbInfoToCache = function( movieName, imdbInfo ) {
		// <summary>
		// Store the mappings in local cache:
		//   movieName.*  -> imdbId
		//   imdbId.*     -> imdbInfo
		//
        // @parameter movieName The movie name as on the original page
        // @parameter imdbInfo The movie info from IMDb
		// </summary>

        loggingOn?GM_log("ImdbMarkup.putImdbInfoToCache( " + movieName + ", [" + typeof(imdbInfo) + "]" + imdbInfo + " )"  ):void(0);

		if ( null != cache ) {
            if ( null != imdbInfo["imdbID"] && null != movieName ) {
    		  cache.put( "moviename."  + movieName, imdbInfo["imdbID"] ); // movie name on page (may be overwritten, below)
    		}
            if ( null != imdbInfo["imdbID"] && null != imdbInfo["Title"] ) {
                cache.put( "moviename."  + imdbInfo["Title"], imdbInfo["imdbID"] ); // official IMDB movie name
            }
            if ( null != imdbInfo["imdbID"] && null != imdbInfo["Title"] && null != imdbInfo["Year"] ) {
            	cache.put( "moviename."  + imdbInfo["Title"] + " (" + imdbInfo["Year"] + ")", imdbInfo["imdbID"] ); // official IMDB movie name with year
            }

            if ( null == imdbInfo.retrievedDate ) {
                imdbInfo.retrievedDate = new Date();
            }


            if ( null != imdbInfo &&  null != imdbInfo["imdbID"] ) {
                cache.put( "imdbId."+ imdbInfo["imdbID"], JSON.stringify( imdbInfo ));
            }
		}
	}
	
    // Expire the cache if any of the following are true...
    var cacheExpiryMaxDays = 7; // cache entry is older than x days
    var cacheExpiryBeforeDate = new Date( 2012, 3, 6 ); // cache entry is older than this date 
	
	this.getImdbInfoFromCache = function( movieName ) {
		// <summary>
		// Try to find the given movie in the cache and return the imdbInfo object if found.
		//
        // @parameter movieName The movie name as on the original page
        // @returns An imdbInfo object, or 'undefined' if not found in the cache
		// </summary>

        loggingOn?GM_log( "ImdbMarkup.getImdbInfoFromCache( '" + movieName + "' )"  ):void(0);

		if ( null == cache ) {
            return null; // no cache used
        }

		var imdbId = cache.get("moviename." + movieName);
		loggingOn?GM_log( "ImdbMarkup.getImdbInfoFromCache() - cache[moviename." + movieName  + "]=" + imdbId  ):void(0);

        if ( null == imdbId ) {
            return null; // moviename not found
        }

		var imdbInfoString  = cache.get("imdbId." + imdbId);
		loggingOn?GM_log( "ImdbMarkup.getImdbInfoFromCache() - cache[imdbId." + imdbId  + "]=" + imdbInfoString  ):void(0);

		if ( null == imdbInfoString ) {
            return null; // imdbInfo not found
        }

		var imdbInfo = jQuery.parseJSON( imdbInfoString );

        if ( null == imdbInfo.retrievedDate ) {
            return null; // imdbInfo added with old version
        }

        var now = new Date();
        var dayDifference = ( now - imdbInfo.retrievedDate ) / 1000/*->sec*/ / 60/*->minute*/ / 60/*->hours*/ / 24/*->days*/;

        // cache has expired, don't return the item
        if (    dayDifference > cacheExpiryMaxDays
            ||  imdbInfo.retrievedDate < cacheExpiryBeforeDate ) {
            return null;
        }

        // all ok!

		// augment with getUrl function
		imdbInfo.getUrl = getImdbUrl;
		return imdbInfo;
	}
	
	
	this.imdbInfoLoaded = function( movieName, imdbInfo ) {
		// <summary>
		// Callback function. Called once the movie information has been loaded
		//
        // @parameter movieName The movie name as on the original page
        // @parameter imdbInfo The movie info from IMDb
		// </summary>

        loggingOn?GM_log( "ImdbMarkup.imdbInfoLoaded( " + movieName + ", [" + typeof(imdbInfo) + "]" + imdbInfo + " )"  ):void(0);
        this.setRatingsByMovieName( movieName, imdbInfo );
		this.putImdbInfoToCache( movieName, imdbInfo );
	}
	
	
    this.setRatingOnElement = function( ratingElement, imdbInfo ) {
        // <summary>
        // Set the rating info on the given DOM element.
        //
        // @paramater ratingElement The DOM element to display the info in.
        // @parameter imdbInfo The movie info from IMDb
        // </summary>
        
		loggingOn?GM_log( "ImdbMarkup.setRatingOnElement( " + ratingElement + ", " + imdbInfo + " )"  ):void(0);
		if ( 'undefined' == typeof( imdbInfo ) || 'undefined' == typeof( imdbInfo.imdbRating ) ) {
			ratingElement.getElementsByClassName("imdbRating")[0].innerHTML = "???";

		} else {
			ratingElement.getElementsByClassName("imdbRating")[0].innerHTML = imdbInfo.imdbRating;
			ratingElement.getElementsByTagName("a")[0].setAttribute( "href", imdbInfo.getUrl() );
		}
    }

    
    this.setRatingsByMovieName = function( movieName, imdbInfo ) {
        // <summary>
        // Set the rating info on all elements that match the movieName (may be multiple).
        //
        // @parameter imdbInfo The movie info from IMDb
        // @parameter movieName The movie name as on the original page
        // </summary>
        
        var ratingElements = movieNameToElementList[movieName];
        for ( var i = 0; i < ratingElements.length; ++i  )
        {
            var ratingElement = movieNameToElementList[movieName][i];
            this.setRatingOnElement( ratingElement, imdbInfo );
        }

    };
    
	
	this.createRatingElement = function( document, movieName ) {
		// <summary>
		// Create and return a DOM <span> element for the given DOM document that is a container for the ratings info
		// The default href links to the IMDB search for the moviename and
		// the default innerText (of the class=imdbRating) is three dots "..."
		// These will later be replaced if/when the movie is identified
		// </summary>
		
		loggingOn?GM_log( "ImdbMarkup.createRatingElement( " + document + "," + movieName + " )" ):void(0);
		
		var ratingElement = document.createElement( "span" );
		var searchUrl = movieLookupHandler.imdbSearchUrl( movieName )
		ratingElement.setAttribute( "name", movieName );
		ratingElement.innerHTML =
			'<a href="' + searchUrl + '">' +
				'IMDb:&nbsp;<span class="imdbRating">...</span>'+
			'</a>';
		return ratingElement;
	};
	

    // An associate array that maps the original movie name to an Array (1 or more) of DOM Elements 
    var movieNameToElementList = {};
        
    this.doMarkup = function( baseElement ) {
        // <summary>
        // Search the gives DOM structure and markup any movies found with IMDb ratings elements
		// The constructor parameter
		//
        // @parameter baseElement The DOM Element (document.body) to markup movies in
        // </summary>
        
		loggingOn?GM_log( "ImdbMarkup.doMarkup()" ):void(0);
		
        // scan page, add IMDb elements
        var movieElements = pageHandler.getMovieElements( baseElement );
		loggingOn?GM_log( "ImdbMarkup.doMarkup() - found " + movieElements.length + " matches" ):void(0);
        for ( var i = 0; i < movieElements.length; ++i ) {
            var movieElement = movieElements[i];
            var movieName = pageHandler.getMovieNameForMovieElement( movieElement );

            // add IMDb ratings element
            var ratingElement =  this.createRatingElement( baseElement.ownerDocument, movieName );
            pageHandler.addRatingElement( ratingElement, movieElement);

            // store ratings element to movieNameToElementList
            if ( movieNameToElementList[movieName] == undefined ) { 
                movieNameToElementList[movieName] = []; // create empty Array
            }
            movieNameToElementList[movieName].push( ratingElement );
        }
        
		var that = this;
        // load and set ratings for each movie name found
        for ( var movieName in movieNameToElementList ) {
			var imdbInfo = this.getImdbInfoFromCache( movieName );

			if ( null != imdbInfo ) { // if it's in the cache, populate directly
				loggingOn?GM_log( "ImdbMarkup.doMarkup() - cache hit on " + movieName ):void(0);
				this.setRatingsByMovieName( movieName, imdbInfo );
				
			} else { // otherwise, do a callback
				loggingOn?GM_log( "ImdbMarkup.doMarkup() - cache miss on " + movieName ):void(0);
				this.movieLookupHandler.loadImdbInfoForMovieName( movieName,
					function(movieName, imdbInfo) { that.imdbInfoLoaded(movieName, imdbInfo) } // callback imdbInfoLoaded
				);
			}
		}
	}
};    

function ArrayWrapperMap( array ) {
	// <summary>
	// Wrap an associative array in class with convenience methods.
	// </summary>
	this.array = array;
	
	this.get = function( key ) {
		return array[key];
	}
	
	this.put = function( key, value ) {
		array[key] = value;
	}
	
	this.containsKey = function( key ) {
		return ( key in array );
	}
	
	this.length = function( key ) {
		return Object.keys(array).length;
	}
	
};

function BackgroundPageLocalStorageMap() {
	// <summary>
	// Wrap an associative array in class with convenience methods.
	// </summary>
	this.array;
	chrome.extension.sendRequest({method: "getLocalStorage", key: "status"}, function(response) {
		array = response.data;
	});;
	
	this.get = function( key ) {
		return array[key];
	}
	
	this.put = function( key, value ) {
		array[key] = value;
	}
	
	this.containsKey = function( key ) {
		return ( key in array );
	}
	
	this.length = function( key ) {
		return Object.keys(array).length;
	}
	
};

function getObjectClass(obj) {
    // <summary>
    // Returns the class name of the argument or undefined if
	// it's not a valid JavaScript object.
    // <summary>
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(
            /function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}

function ImdbForSwissCinema ( movieLookupHandler ) {
    // <summary>
    // A class to markup Swiss cinema pages with IMDb ratings.
    //
    // The public exec() method will markup the specified page.
    //
    // @parameter movieLookupHandler An object that implements the methods that will lookup movie details from an external website.
    // <summary>
    this.movieLookupHandler = movieLookupHandler;

    var loggingOn = false;

	this.supportsLocalStorage = function() {
		// <summary>
		// Return whether the browser supports HTML 5 local storage
		// </summary>
		
		try {
			return 'localStorage' in window && window['localStorage'] !== null;
		} catch (e) {
			return false;
		}
	}
	
	
	// all the page handlers we know
	var pageHandlers = [
		new CinemanMovieHandler(),
		new CinemanListHandler(),
		new FilmPodiumHandler(),
		new KitagFilmHandler(),
		new KitagIndexHandler(),
		new OrangeCinemaProgramHandler(),
		new OrangeCinemaSpecialsListHandler(),
		new StarticketHandler(),
		new ZffHandler(),
	];


	this.getPageHandler = function( href ) {
		// <summary>
		// From our list of pageHandler classes, return the first one that will handle the page
		//
		// @param href The URL of the page
		// @return The pageHandler object, or null if none found
		// </summary> 
		loggingOn?GM_log( "ImdbForSwissCinema.getPageHandler() trying " + pageHandlers.length + " handlers on " + href ):void(0); 
		for ( var i=0; i < pageHandlers.length; ++i ) {
			var pageHandler = pageHandlers[i];
			loggingOn?GM_log( "ImdbForSwissCinema.getPageHandler() trying " + getObjectClass(pageHandler) ):void(0); 
			if ( pageHandler.match( href ) ) {
				loggingOn?GM_log( "ImdbForSwissCinema.getPageHandler() matched! Using: " + getObjectClass(pageHandler) ):void(0); 
				return pageHandler;
			}
		}
		return null;
	}


	this.exec = function( href, baseElement ) {
		// <summary>
		// Find a pagehandler for the given href and use it to mark up the document (baseElement)
		// 
		// @param href The URL of the page
		// @param baseElement The DOM to markup
		// </summary>
		var pageHandler = this.getPageHandler( href );
		if ( null != pageHandler ) {
			var cache = ( this.supportsLocalStorage() ? new ArrayWrapperMap(localStorage) : null );
			//var cache = new BackgroundPageLocalStorageMap();
			
			var pageMarkup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );
			pageMarkup.doMarkup( baseElement ); 
		}
	}
};


(function () { 
    return { 
        exec: function () { 
			//var movieLookupHandler = new ImdbComMovieLookup(); // use imdb.com to lookup movie info
			var movieLookupHandler = new ImdbapiComMovieLookup(); // use imdbapi.com to lookup movie info

			var imdbForSwissCinema = new ImdbForSwissCinema( movieLookupHandler );
			imdbForSwissCinema.exec( window.location.href, document.body );
		}
    }; 
}()).exec();

