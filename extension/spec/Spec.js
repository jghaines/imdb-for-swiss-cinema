//var loggingOn = true;

function log(msg) {
	//
	// http://stackoverflow.com/a/3060267/358224
	//
    setTimeout(function() {
        throw new Error(msg);
    }, 0);
}


/* Returns the class name of the argument or undefined if
   it's not a valid JavaScript object.
*/
function getObjectClass(obj) {
 	//
 	// http://blog.magnetiq.com/post/514962277/finding-out-class-names-of-javascript-objects
 	//
    if (obj && obj.constructor && obj.constructor.toString) {
        var arr = obj.constructor.toString().match(
            /function\s*(\w+)/);

        if (arr && arr.length == 2) {
            return arr[1];
        }
    }

    return undefined;
}

function hereDoc(f) {
	// multi-line hack from http://stackoverflow.com/questions/805107/how-to-create-multiline-strings
	return f.toString().
			replace(/^[^\/]+\/\*!?/, '').
			replace(/\*\/[^\/]+$/, '');
}

describe("ArrayWrapperMap", function() {

	it("should be able to put and get", function() {
		var array = [];
		var map = new ArrayWrapperMap( array );
		
		expect(map.length()).toBe(0);
		map.put( "keyA", "value" );		
		expect(map.length()).toBe(1);
		expect(map.get("keyA")).toBe( "value" );		
	});

});



// Imdb class tests
describe("ImdbComMovieLookup", function() {
	var lookup;

	beforeEach(function() {
		lookup = new ImdbComMovieLookup();
		
		GM_xmlhttpRequest = jasmine.createSpy('GM_xmlhttpRequest');
		
	});

	it("should be able to lookup Matrix (1999)", function() {
		var movieName = "Matrix (1999)"
		lookup.loadImdbInfoForMovieName( movieName, function(){} );
		expect(GM_xmlhttpRequest).toHaveBeenCalledWith({
								'method': 'GET',
								'url': "http://www.imdb.com/find?s=tt&q="+ movieName,
								'onload': jasmine.any(Function)
						});

		expect(GM_xmlhttpRequest.calls.length).toEqual(1);
	});


	it("should be able to lookup Frankenstein", function() {
		var movieName = "Frankenstein"
		lookup.loadImdbInfoForMovieName( movieName, function(){} );
		expect(GM_xmlhttpRequest).toHaveBeenCalledWith({
								'method': 'GET',
								'url': "http://www.imdb.com/find?s=tt&q="+ movieName,
								'onload': jasmine.any(Function)
						});

		expect(GM_xmlhttpRequest.calls.length).toEqual(1);
	});
});


var ImdbApiComMovieLookupReturnValues = {
	"s=Matrix&y=1999" : $('<tbody>').html( hereDoc(function() {/*!
'{"Search":[{"Title":"The Matrix","Year":"1999","imdbID":"tt0133093","Type":"movie"},{"Title":"Making 'The Matrix'","Year":"1999","imdbID":"tt0365467","Type":"movie"},{"Title":"V-World Matrix","Year":"1999","imdbID":"tt0211096","Type":"movie"},{"Title":"The Matrix: The Movie Special","Year":"1999","imdbID":"tt0438231","Type":"movie"},{"Title":"The Making of 'The Matrix'","Year":"1999","imdbID":"tt0594933","Type":"episode"},{"Title":"Om filmen 'The Matrix'","Year":"1999","imdbID":"tt1280363","Type":"episode"}]}'
		*/})),
		
};

// ImdbApiCom class tests
describe("ImdbApiComMovieLookup", function() {
	var lookup;

	beforeEach(function() {
		lookup = new ImdbapiComMovieLookup();
		
		GM_xmlhttpRequest = jasmine.createSpy('GM_xmlhttpRequest');
		
	});

	describe("imdbapiSearchUrl", function() {
		it("should be able to search for Frankenstein", function() {
			var movieSearchString =  "Frankenstein";
			var expectedUrl	= "http://www.omdbapi.com/?s=Frankenstein";

			expect( lookup.imdbapiSearchUrl(movieSearchString) ).toBe( expectedUrl );
		});
	});

	describe("imdbapiSearchUrl", function() {
		it("should be able to search for Matrix (1999)", function() {
			var movieSearchString =  "Matrix (1999)";
			var expectedUrl = "http://www.omdbapi.com/?s=Matrix&y=1999";

			expect( lookup.imdbapiSearchUrl(movieSearchString) ).toBe( expectedUrl );
		});
	});

	describe("imdbapiSearchUrl", function() {
		it("should be able to search for Hansel and Gretel: Witch Hunters (2013) - and strip the 'and'", function() {

			var movieSearchString 	=  "Hansel and Gretel: Witch Hunters (2013)";
			var expectedUrl	= "http://www.omdbapi.com/?s=Hansel Gretel: Witch Hunters&y=2013";

			expect( lookup.imdbapiSearchUrl(movieSearchString) ).toBe( expectedUrl );
		});
	});

	describe("imdbapiSearchUrl", function() {
		it("should be able to search for '\xE4\xF6\xFC\' - strip umlauts", function() {

			var movieSearchString 	=  "\xE4\xF6\xFC";
			var expectedUrl	= "http://www.omdbapi.com/?s=aou";

			expect( lookup.imdbapiSearchUrl(movieSearchString) ).toBe( expectedUrl );
		});
	});

	describe("imdbapiSearchUrl", function() {
		it("should be able to search for Les Mis\xE9rables (2012) - and strip the acute-e", function() {

			var movieSearchString 	=  "Les Mis\xE9rables (2012)";
			var expectedUrl	= "http://www.omdbapi.com/?s=Les Miserables&y=2012";

			expect( lookup.imdbapiSearchUrl(movieSearchString) ).toBe( expectedUrl );
		});
	});

	// test is currently not working - after a refactor, the method no longer calls GM_xmlhttpRequest
	xit("should be able to lookup Matrix (1999)", function() {
		var movieName = "Matrix";
		var movieYear = 1999;
		var movieSearchString =  movieName + " (" + movieYear + ")";

		spyOn( GM_xmlhttpRequest ).andReturn( ImdbApiComMovieLookupReturnValues["s=Matrix&y=1999"] );

		lookup.loadImdbInfoForMovieName( movieSearchString, function(){} );
		expect(GM_xmlhttpRequest).toHaveBeenCalledWith({
								'method': 'GET',
								'url': "http://www.omdbapi.com/?s="+ movieName + "&y=" + movieYear,
								'onload': jasmine.any(Function)
						});

		expect(GM_xmlhttpRequest.calls.length).toEqual(1);
	});

	// as above....
	xit("should be able to lookup Frankenstein", function() {
		var movieName = "Frankenstein"
		lookup.loadImdbInfoForMovieName( movieName, function(){} );
		expect(GM_xmlhttpRequest).toHaveBeenCalledWith({
								'method': 'GET',
								'url': "http://www.omdbapi.com/?s="+ movieName,
								'onload': jasmine.any(Function)
						});

		expect(GM_xmlhttpRequest.calls.length).toEqual(1);
	});
});





describe("ImdbMarkup", function() {
	var imdbObjectString = '{"Title":"My Movie","Year":"1600","imdbRating":"7.0","imdbID":"tt101"}';
	var imdbInfoId = "tt101";
	var movieName = "My Movie";
	var movieYear = "1600"


	var pageHandler;
	var movieLookupHandler;
	var cache;

	function DummyMovieLookupHandler() {
		this.loadImdbInfoForMovieName = function(movieName, onloadImdbInfo) {
			var imdbInfo = JSON.parse(imdbObjectString);
			imdbInfo.Title = movieName;
			imdbInfo.Year = movieYear;
			imdbInfo.imdbID = imdbInfoId;
			imdbInfo.getUrl = getImdbUrl;
			onloadImdbInfo( movieName, imdbInfo );
		}
		
		this.imdbSearchUrl = function(movieName) {
			return "http://example.com";
		}
	}
	
	describe("doMarkup", function() {
		beforeEach(function() {
			pageHandler = new CinemanListHandler(); // we aren't testing this class, just using it as an example instance
			movieLookupHandler = new DummyMovieLookupHandler();
			spyOn(movieLookupHandler, 'loadImdbInfoForMovieName').andCallThrough();
			
			cache = new ArrayWrapperMap([]);
		});

		it("should be able to run on a document with no matching elements", function() {
			spyOn(pageHandler, 'match').andReturn(true);
			spyOn(pageHandler, 'addRatingElement');
			spyOn(pageHandler, 'getMovieNameForMovieElement').andReturn("movieName");
			spyOn(pageHandler, 'getMovieElements').andReturn( [] );

			// do the markup
			var markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache);
			var baseElement = jasmine.createSpyObj('baseElement', ['dunno']);
			markup.doMarkup( baseElement );
			
			expect(pageHandler.getMovieElements).toHaveBeenCalledWith(baseElement);
			expect(pageHandler.getMovieNameForMovieElement).not.toHaveBeenCalled();
		});
		
		it("should be able to run on a document with a single matching element", function() {
			var elements = [ document.createElement("element") ];
			var movieName = "myMovie";

			spyOn(pageHandler, 'match').andReturn(true);
			spyOn(pageHandler, 'addRatingElement');
			spyOn(pageHandler, 'getMovieNameForMovieElement').andReturn( movieName );
			spyOn(pageHandler, 'getMovieElements').andReturn( elements );

			// do the markup
			var markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );
			markup.doMarkup( elements[0] );
			
			// pageHandler should get invoked to parse and markup the page
			expect(pageHandler.getMovieElements).toHaveBeenCalled();
			expect(pageHandler.getMovieNameForMovieElement).toHaveBeenCalledWith( elements[0] );
			expect(pageHandler.addRatingElement).toHaveBeenCalledWith( jasmine.any(Object), elements[0] );

			// movieLookupHandler should get invoked to find the movie info
			expect(movieLookupHandler.loadImdbInfoForMovieName).toHaveBeenCalledWith( movieName, jasmine.any(Function) );

			// check the cache
			expect(cache.length()).toBe(3);
			expect(cache.get('moviename.' + movieName)).toBe( imdbInfoId ); // original movie name
			expect(cache.get('moviename.' + movieName + ' (1600)')).toBe( imdbInfoId ); // movie name with year
			expect(cache.get('imdbId.' + imdbInfoId)).toMatch( movieName ); // the movie object has the movieName
			expect(cache.get('imdbId.' + imdbInfoId)).toMatch( imdbInfoId ); // and the id (fuzzy checking)
			
		});
		
		it("should be able to match a single cached element", function() {
			var elements = [ document.createElement("element") ];

			spyOn(pageHandler, 'match').andReturn(true);
			spyOn(pageHandler, 'addRatingElement');
			spyOn(pageHandler, 'getMovieNameForMovieElement').andReturn( movieName );
			spyOn(pageHandler, 'getMovieElements').andReturn( elements );

			var markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );

			markup.putImdbInfoToCache( movieName, JSON.parse( imdbObjectString ) )
			// check the cache
			expect(cache.length()).toBe(3);
			
			// do the markup
			markup.doMarkup( elements[0] );
			
			// pageHandler should get invoked to parse and markup the page
			expect(pageHandler.getMovieElements).toHaveBeenCalled();
			expect(pageHandler.getMovieNameForMovieElement).toHaveBeenCalledWith( elements[0] );
			expect(pageHandler.addRatingElement).toHaveBeenCalledWith( jasmine.any(Object), elements[0] );

			// shouldn't need to invoke the movieLookup handler - it should be cached
			expect(movieLookupHandler.loadImdbInfoForMovieName).not.toHaveBeenCalled();

			// cache should be same size
			expect(cache.length()).toBe(3);
		});
		
		it("should be able to match a single cached element with a year", function() {
			var elements = [ document.createElement("element") ];

			// pageHandler will 'find' the moviename with the year
			spyOn(pageHandler, 'match').andReturn(true);
			spyOn(pageHandler, 'addRatingElement');
			spyOn(pageHandler, 'getMovieNameForMovieElement').andReturn( movieName + ' (' + movieYear + ')' );
			spyOn(pageHandler, 'getMovieElements').andReturn( elements );

			var markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );

			markup.putImdbInfoToCache( movieName, JSON.parse( imdbObjectString ) )
			// check the cache
			expect(cache.length()).toBe(3);

			markup.doMarkup( elements[0] );
			
			// pageHandler should get invoked to parse and markup the page
			expect(pageHandler.getMovieElements).toHaveBeenCalled();
			expect(pageHandler.getMovieNameForMovieElement).toHaveBeenCalledWith( elements[0] );
			expect(pageHandler.addRatingElement).toHaveBeenCalledWith( jasmine.any(Object), elements[0] );

			// shouldn't need to invoke the movieLookup handler - it should be cached
			expect(movieLookupHandler.loadImdbInfoForMovieName).not.toHaveBeenCalled();

			// cache should be same size
			expect(cache.length()).toBe(3);
		});
	});

	describe("putImdbInfoToCache", function() {
		var markup;

		var movieName = "Warm Bodies (2013)"
		var imdbInfo = JSON.parse( '{"Title":"Warm Bodies","Year":"2013","imdbRating":"7.4","imdbVotes":"14,428","imdbID":"tt1588173","Type":"movie","Response":"True"}' );

		beforeEach(function() {
			pageHandler = new CinemanListHandler(); // we aren't testing this class, just using it as an example instance
			movieLookupHandler = new DummyMovieLookupHandler();
			cache = new ArrayWrapperMap([]);

			markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );

		});

		it("should populate the cache", function() {
			markup.putImdbInfoToCache( movieName, imdbInfo );

			// check cache content directly
			expect(cache.length()).toBe(3);
			expect(cache.get( "moviename.Warm Bodies") ).toBe( "tt1588173" );
			expect(cache.get( "moviename.Warm Bodies (2013)") ).toBe( "tt1588173" );
			expect(cache.get( "imdbId.tt1588173") ).not.toBe( null );

			// check cache retrieve result
			var cachedMovieInfo = markup.getImdbInfoFromCache( movieName );
			expect( cachedMovieInfo ).not.toBe( null );
			// check (de-)serialisation of .cachedOnDate
			expect( cachedMovieInfo.cachedOnDate ).not.toBe( null );
			expect( getObjectClass( cachedMovieInfo.cachedOnDate ) ).toBe( "Date" );
		});

		it("should not return expired cache items", function() {
			// fake the cache so it looks older
			imdbInfo.cachedOnDate = new Date( (new Date()) - ( 1000/*->sec*/ * 60/*->minute*/ * 60/*->hours*/ * 24/*->days*/ * 10 ) ); // set cached date to 10 days ago
			markup.putImdbInfoToCache( movieName, imdbInfo );

			// check cache retrieve result
			var cachedMovieInfo = markup.getImdbInfoFromCache( movieName );
			expect( cachedMovieInfo ).toBe( null );
		});

		it("should not return old, old cache items", function() {
			// fake the cache so it looks older
			imdbInfo.cachedOnDate = new Date( 2010, 01, 01 );
			markup.putImdbInfoToCache( movieName, imdbInfo );

			// check cache retrieve result
			var cachedMovieInfo = markup.getImdbInfoFromCache( movieName );
			expect( cachedMovieInfo ).toBe( null );
		});
	});
});


// misc function - extractOrangeCinemaMovieName
describe("extractOrangeCinemaMovieName", function() {
	var orangeMovieNameMap = {
		"Vorpremiere: To Rome with Love" 		: "To Rome with Love",
		"Eröffnungsfilm/Vorpremiere: Starbuck"	: "Starbuck",
	};

	describe("it to extract a bunch of movieNames", function() {
		for ( var origMovieName in orangeMovieNameMap ) {
			var mappedMovieNameMap = orangeMovieNameMap[origMovieName];

			it("should be map " + origMovieName, function() {
				expect(extractOrangeCinemaMovieName(origMovieName)).toBe(mappedMovieNameMap);
			});
		}
	});

});


var cinemaTestDocuments = {
	"jetzt_im_kino.php" : $('<tbody>').html( hereDoc(function() {/*!
<tr>
				    <td width="20" class="">
					    						    a					    				    </td>
				    <td width="300" class="">
    					    <a class="listingtitle" href="/en/movie/2012/TheImpossible/" title="The Impossible">The Impossible</a>
					    
    					    14:30, 17:30, 20:30					    					    <a href="#" class="greylink inline lang" rel="#lang_text_container" title="Languages">Egf</a>
					     | <a class="greylink age inline" href="#" rel="#age_text_container" title="Minimum age">12y.</a>					    					    					    				    </td>
    				    <td width="70" class="">
					    					    <a class="ceebox" href="/en/layer/rating/rating.php?movie_id=19121" rel="iframe modal:true width:500 height:330"><img class="rating" height="12" width="65" title="Rate a film" alt="Rate a film" src="/img/rating/rating_ch/red40.gif" style="visibility: visible;"></a>
				    </td>
				    <td width="24" class="">
    					    <a href="/en/movie/2012/TheImpossible/trailer.html"><img height="24" width="24" title="Trailer" alt="Trailer" src="/img/global/icons/play_24px.gif"></a>
    				    </td>
				    <td width="24" class="last_td ">
    												    <a class="ceebox" rel="iframe modal:true width:500 height:330" href="/en/layer/watchlist/add_to_watchlist.php?channel=cinema&amp;id=19121">
							    <img src="/img/global/icons/watchlist_empty_24px.gif" width="24" height="24" alt="Set on Watchlist" title="Set on Watchlist" style="visibility: visible;">
						    </a>
    				    </td>
    			    </tr>
		*/})),
		
};



// MoviePageHandler tests
describe("CinemanListHandler", function() {
	var handler;

	beforeEach(function() {
		handler = new CinemanListHandler();
	});

	describe("match", function() {
		it("should be match on process.php pages", function() {
			expect(handler.match("http://www.cineman.ch/en/showtimes/process.php?order=movie&lang=en&date=2012-07-08")).toBe(true);
		});
	});

	// this is failing:
	// Object [object Object] has no method 'getElementsByClassName'
	// odd...
	xit("should find elements on the jetzt_im_kino.php page", function() {
		var movieElements = handler.getMovieElements( cinemaTestDocuments["jetzt_im_kino.php"] );

		expect(movieElements).not.toBe(null);
		expect(movieElements.length).toBe(1);

	});

});

var filmpodiumTestDocuments = {
	"ReiheInfo.aspx" : $('<tbody>').html( hereDoc(function() {/*!
		<tr>
			<td>
                <input type="hidden" name="ctl00$cphContentMain$dlFilmezuReihe$ctl03$hdnMovieId" id="ctl00_cphContentMain_dlFilmezuReihe_ctl03_hdnMovieId" value="14873">
                <div id="ctl00_cphContentMain_dlFilmezuReihe_ctl03_pnlLine2" class="linie inhalt">
				
                    &nbsp;
			</div>
                <div class="clear">
                </div>
                <table border="0">
				<tbody><tr>
					<td valign="top" style="width:200px;"><a id="ctl00_cphContentMain_dlFilmezuReihe_ctl03_lnkFilmtitel" class="inhalt_bold" href="FilmDetails.aspx?t=1&amp;f=14873">The Running Jumping &amp; Standing Still Film</a>
                            <br>
                            GB 1960<br><span name="The Running Jumping &amp; Standing Still Film"><a href="http://www.imdb.com/title/tt0053231/">IMDb:&nbsp;<span class="imdbRating">6.6</span></a></span></td><td valign="top" style="width:150px;"><span id="ctl00_cphContentMain_dlFilmezuReihe_ctl03_lblRegie">Regie: Richard Lester</span></td><td valign="top" style="width:100px;">ohne Dialog<br></td><td id="ctl00_cphContentMain_dlFilmezuReihe_ctl03_NoDataTableRow" valign="top" style="width:140px;">Vorfilm: «Help!»&nbsp;
                        </td>
				</tr>
			</tbody></table>
                
            </td>
		</tr>
		
		<tr>
					<td valign="top" style="width:200px;"><a id="ctl00_cphContentMain_dlFilmezuReihe_ctl04_lnkFilmtitel" class="inhalt_bold" href="FilmDetails.aspx?t=1&amp;f=12005">A Hard Day's Night</a>
                            <br>
                            GB 1964<br><span name="A Hard Day's Night"><a href="http://www.imdb.com/title/tt0058182/">IMDb:&nbsp;<span class="imdbRating">7.6</span></a></span></td><td valign="top" style="width:150px;"><span id="ctl00_cphContentMain_dlFilmezuReihe_ctl04_lblRegie">Regie: Richard Lester</span></td><td valign="top" style="width:100px;">E/d/f<br>12 J</td><td id="ctl00_cphContentMain_dlFilmezuReihe_ctl04_ContentTableRow" valign="top" style="width:140px;"><table id="ctl00_cphContentMain_dlFilmezuReihe_ctl04_dlSpieldatenZuFilm" cellspacing="0" border="0" style="border-collapse:collapse;">
						<tbody><tr>
							<td>
                                    <table border="0" cellpadding="0" cellspacing="0">
                                
						<tbody><tr>
							<td>
                                    </td></tr><tr>
                                        <td width="20">
                                            So,&nbsp;
                                        </td>
                                        <td width="90">
                                            01.07.2012&nbsp;
                                        </td>
                                        <td width="30">
                                            15:00
                                        </td>
                                        
                                    </tr>
                                
						<tr>
							<td>
                                    </td></tr><tr>
                                        <td width="20">
                                            Di,&nbsp;
                                        </td>
                                        <td width="90">
                                            03.07.2012&nbsp;
                                        </td>
                                        <td width="30">
                                            20:45
                                        </td>
                                        
                                    </tr>
                                
						<tr>
							<td>
                                    </td></tr><tr>
                                        <td width="20">
                                            So,&nbsp;
                                        </td>
                                        <td width="90">
                                            08.07.2012&nbsp;
                                        </td>
                                        <td width="30">
                                            18:15
                                        </td>
                                        
                                    </tr>
                                
						<tr>
							<td>
                                    </td></tr></tbody></table>
                                </td>
						</tr>
					</tbody></table></td>
				</tr>
		
	*/})),
		
	"specials.php#list" : $('<tbody>').html( hereDoc(function() {/*!
			<tr>
					<td height="20" style="padding-left:5px;">28. Juli </td>
					<td><a href="specials_02_unicef.php?tab_sel=2&amp;menu_sel=specials">UNICEF Night: Der Verdingbub</a></td>
				</tr>
			<tr style="background-color:#EAEAEA;">
				<td height="20" style="padding-left:5px;">31. Juli </td>
				<td><a href="specials_03_zff.php?tab_sel=3&amp;menu_sel=specials">Z&uuml;rich Film Festival: Circumstance</a></td>
			</tr>
		*/})),
		
	"specials.php#tabs" : $('<tbody>').html( hereDoc(function() {/*!
			<td>
				<a onmousedown="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_o_02.jpg');return true" onmouseup="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_o_02.jpg');return true" onmouseover="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_o_02.jpg');return true" onmouseout="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_02.jpg');return true" href="specials_02_unicef.php?tab_sel=2&amp;menu_sel=specials"><img id="navigation_d_02" src="images/img_reiter_specials/navigation_d_02.jpg" name="navigation_d_02" width="87" height="27" alt="" border="0"></a>
			</td>
		*/})),
		
};


describe("extractOrangeCinemaMovieName", function() {
	var orangeMovieNameMap = {
		"Vorpremiere: To Rome with Love" 		: "To Rome with Love",
		"Eröffnungsfilm/Vorpremiere: Starbuck"	: "Starbuck",
	};

	describe("it to extract a bunch of movieNames", function() {
		for ( var origMovieName in orangeMovieNameMap ) {
			var mappedMovieNameMap = orangeMovieNameMap[origMovieName];

			it("should be map " + origMovieName, function() {
				expect(extractOrangeCinemaMovieName(origMovieName)).toBe(mappedMovieNameMap);
			});
		}
	});

});

var orangecinemaTestDocuments = {
	"overview.php" : $('<tbody>').html( hereDoc(function() {/*!
			<tr valign="middle" style="background-color: #efefef;">
				<td width="110" class="contenttext" style="border-bottom: 1px solid #D8D8D8;"><span class="text Stil2">Di, 24.07.2012</span></td>
				<td width="360" class="contenttext" style="border-bottom: 1px solid #D8D8D8;"><span class="Stil2">
					<span class="menu" style="font-size: 12px;"><ul class="mylist">
					<li><a href="event.php?id=9"><b>Poupoupidou</b></a></li></ul></span></span>
				</td>
				<td width="4" class="contenttext Stil1" style="border-bottom: 1px solid #D8D8D8;">&nbsp;</td>
				<td width="35" class="contenttext" style="border-bottom: 1px solid #D8D8D8;"><span class="text Stil2">21:30</span></td>
				<td width="4" class="contenttext" style="border-bottom: 1px solid #D8D8D8;">&nbsp;</td>
				<td width="140" class="contenttext" style="border-bottom: 1px solid #D8D8D8;">&nbsp;</td>
				<td class="contenttext" style="border-bottom: 1px solid #D8D8D8;"></td>
			</tr>
			<tr valign="middle">
				<td colspan="9" class="contenttext">Comedy, France, 2011, Fd, 14J, 1:44<br>Regie: Geld Hustache-Mathieu<br>Besetzung: Jean-Paul Rouve, Sophie Quinton, Guillaume Gouix</td>
			</tr>
		*/})),
		
	"specials.php#list" : $('<tbody>').html( hereDoc(function() {/*!
			<tr>
					<td height="20" style="padding-left:5px;">28. Juli </td>
					<td><a href="specials_02_unicef.php?tab_sel=2&amp;menu_sel=specials">UNICEF Night: Der Verdingbub</a></td>
				</tr>
			<tr style="background-color:#EAEAEA;">
				<td height="20" style="padding-left:5px;">31. Juli </td>
				<td><a href="specials_03_zff.php?tab_sel=3&amp;menu_sel=specials">Z&uuml;rich Film Festival: Circumstance</a></td>
			</tr>
		*/})),
		
	"specials.php#tabs" : $('<tbody>').html( hereDoc(function() {/*!
			<td>
				<a onmousedown="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_o_02.jpg');return true" onmouseup="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_o_02.jpg');return true" onmouseover="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_o_02.jpg');return true" onmouseout="changeImages('navigation_d_02','images/img_reiter_specials/navigation_d_02.jpg');return true" href="specials_02_unicef.php?tab_sel=2&amp;menu_sel=specials"><img id="navigation_d_02" src="images/img_reiter_specials/navigation_d_02.jpg" name="navigation_d_02" width="87" height="27" alt="" border="0"></a>
			</td>
		*/})),
		
};

describe("OrangeCinemaProgramHandler", function() {
	var handler;

	beforeEach(function() {
		handler = new OrangeCinemaProgramHandler();
	});

	describe("match", function() {
		it("should be match on overview.php pages", function() {
			expect(handler.match("http://www.orangecinema.ch/zuerich/overview.php?menu_sel=2010")).toBe(true);
		});

		it("should NOT be match on specials.php pages", function() {
			expect(handler.match("http://www.orangecinema.ch/zuerich/specials_01.php?menu_sel=specials&tab_sel=1")).not.toBe(true);
		});
	});
	
	it("should find elements on the overview.php page", function() {
		var movieElements = handler.getMovieElements( orangecinemaTestDocuments["overview.php"] );

		expect(movieElements).not.toBe(null);
		expect(movieElements.length).toBe(1);

	});
});

describe("OrangeCinemaSpecialsListHandler", function() {
	var handler;

	beforeEach(function() {
		handler = new OrangeCinemaSpecialsListHandler();
	});

	describe("match", function() {
		it("should NOT be match on overview.php pages", function() {
			expect(handler.match("http://www.orangecinema.ch/zuerich/overview.php?menu_sel=2010")).not.toBe(true);
		});

		it("should be match on specials.php pages", function() {
			expect(handler.match("http://www.orangecinema.ch/zuerich/specials_01.php?menu_sel=specials&tab_sel=1")).toBe(true);
		});
	});

	describe("getMovieElements", function() {
		it("should NOT find elements in the specials tab row", function() {
			var movieElements = handler.getMovieElements( orangecinemaTestDocuments["specials.php#tabs"] );

			expect(movieElements).not.toBe(null);
			expect(movieElements.length).toBe(0);
		});

		it("should find elements in the specials list", function() {
			var movieElements = handler.getMovieElements( orangecinemaTestDocuments[ "specials.php#list" ] );

			expect(movieElements).not.toBe(null);
			expect(movieElements.length).toBe(2);
		});
	});

	describe("getMovieNameForMovieElement", function() {
		it("should identify movie names in the specials list", function() {
			var testDocument = orangecinemaTestDocuments[ "specials.php#list" ];

			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );
			expect(movieElements.length).toBe(2);

			// get the handler to give us the movie names for each element
			expect(handler.getMovieNameForMovieElement(movieElements[0])).toBe("Der Verdingbub");
			expect(handler.getMovieNameForMovieElement(movieElements[1])).toBe("Circumstance");
		});
	});

	describe("addRatingElements", function() {
		it("should add elements in the specials list", function() {
			var testDocument = orangecinemaTestDocuments[ "specials.php#list" ];
			expect(testDocument.html).toMatch( "tr" );

			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );

			// get the handler to add a test element to the 1st movieElement
			var ratingElement = document.createElement("testelement");
			handler.addRatingElement( ratingElement, movieElements[0] );
			expect(testDocument.html()).toMatch( "testelement" );
		});

		it("should NOT add elements in the specials tab", function() {
			var testDocument = orangecinemaTestDocuments[ "specials.php#tabs" ];
			expect(testDocument.html).toMatch( "tr" );

			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );

			// get the handler to add a test element to the 1st movieElement
			var ratingElement = document.createElement("testelement");
			handler.addRatingElement( ratingElement, movieElements[0] );
			expect(testDocument.html()).not.toMatch( "testelement" );
		});
	});
});

var starticketTestDocuments = {
	"0ShowList.asp page" : $('<tbody>').html( hereDoc(function() {/*!
		<tr class="bglightgray" onmouseover="this.className='bgverylightgray';" onmouseout="this.className='bglightgray';">
			<td valign="top" nowrap="">Do 19.07.12/21:30</td><td>&nbsp;</td>
			<td valign="top"><b>
				<a href="#" onclick="ShowAltText(53767, 220, 300, 1)"><b>Eröffnungsfilm/Vorpremiere: Starbuck</b></a></b></td>
			<td>&nbsp;</td>
			<td valign="top" align="center"><a href="#" onclick="ShowAltText(53767, 220, 300, 1)"><img src="img/OrangecinemaZuerich/ico_search_tick_av_besch.gif" width="20" height="14" alt="" border="0"></a></td>
			<td valign="top" align="center">&nbsp;</td>
		</tr>
		<tr>
			<td colspan="9"><img src="img/leer.gif" width="1" height="1" alt="" border="0"></td>
		</tr>
		<tr class="bglightgray" onmouseover="this.className='bgverylightgray';" onmouseout="this.className='bglightgray';">
			<td valign="top" nowrap="">Fr 20.07.12/21:35</td><td>&nbsp;</td><td valign="top"><b><a href="0ChooseShow.asp?ShowID=53592&amp;ShowDetails=1">The Artist</a></b></td><td>&nbsp;<span name=""><a href="http://www.imdb.com/find?s=tt&amp;q=">IMDb:&nbsp;<span class="imdbRating">...</span></a></span></td><td valign="top" align="center"><img src="img/OrangecinemaZuerich/ico_search_tick_av.gif" width="20" height="14" alt="" border="0"></td><td valign="top" align="center"><a href="0ChooseShow.asp?ShowID=53592&amp;ShowDetails=1"><img src="img/OrangecinemaZuerich/ico_search_tick_buy.gif" alt="GO" border="0"></a></td>

		</tr>	*/})),
		
};

// Kitag tests
var kitagTestDocuments = {

	"de/programm/jetzt-im-kino/" : $('<li>').html( hereDoc(function() {/*!
	<div class="movie-detail">
                        <h3 class="movie-name nospace"><a href="/de/filme/before-i-go-to-sleep/?date=20141130" class="ng-binding">BEFORE I GO TO SLEEP</a></h3>
                        <!-- ngIf: movie_infos.movie.age_rating --><p ng-if="movie_infos.movie.age_rating" class="ng-scope">
                            <span class="age ng-binding" data-tooltip="" data-selector="tooltipacd5hw4gqfr" title="">
                                Altersfreigabe: 16
                            </span>
                        </p><!-- end ngIf: movie_infos.movie.age_rating -->
                        <ul class="btn-group-inline">
                            <li><a class="btn-small btn-label color-gray-180 bg-gray-70" href="/de/filme/before-i-go-to-sleep/?date=20141130">Info</a></li>
                            <!-- ngIf: movie_infos.movie.trailer_url --><li ng-if="movie_infos.movie.trailer_url" class="ng-scope">
                                <a class="btn-small btn-label color-gray-180 bg-gray-70" lightbox-trigger="dynamic" lightbox-script="movie_player" lightbox-template-href="/api/movies/trailer/template/" lightbox-data-href="/api/movies/332/trailers/">Trailer</a>
                            </li><!-- end ngIf: movie_infos.movie.trailer_url -->
                        </ul>
                    </div>
	*/})),


	"Index.aspx" : $('<tbody>').html( hereDoc(function() {/*!
	<tr>               
	    <td class="tdMatrixMovie">
		<table style="width:170px;border:none;margin:0px;padding:0px;" border="0" cellpadding="0" cellspacing="0">
		    <tbody><tr>
			<td style="width:62px;" rowspan="2">
			    <a href="Film.aspx?EventID=649307890"><img src="/tmp/images/642384781.jpg" alt="A FEW BEST MEN - Digital" style="border-width:0px;"></a>
			</td>
			<td style="width:108px; vertical-align:top;">
			    <a href="Film.aspx?EventID=649307890">A FEW BEST MEN - DIGITAL</a>
			</td>
		    </tr>
		    <tr>
			<td style="vertical-align:bottom;">
			    <a id="ctl00_ContentPlaceHolder_matrixController_repMatrix_ctl00_eventRowCtrl_lnkTrailer" href="Film.aspx?EventID=649307890">TRAILER</a><br>
			    Alterskat. <a id="ctl00_ContentPlaceHolder_matrixController_repMatrix_ctl00_eventRowCtrl_lnkRating" href="/Informationen/Altersfreigabe/Zuerich.aspx">J14</a><br>
			    Filmlänge 97 Min.
			</td>
		    </tr>
		</tbody></table>
	    </td>
	</tr>
	*/})),
			       
	"Film.aspx" : $('<tbody>').html( hereDoc(function() {/*!
	<tr>		   
	    <td class="tdMatrixMovie">
		<table style="width:170px;border:none;margin:0px;padding:0px;" border="0" cellpadding="0" cellspacing="0">
		    <tbody><tr>
			<td style="width:62px;" rowspan="2">
			    <img src="/tmp/images/647550252.jpg" alt="SNOW WHITE AND THE HUNTSMAN" style="border-width:0px;">
			</td>
			<td style="width:108px; vertical-align:top;">
			    <span>SNOW WHITE AND THE HUNTSMAN</span>
			</td>
		    </tr>
		    <tr>
			<td style="vertical-align:bottom;">
			    <a id="ctl00_ContentPlaceHolder_matrixSingleViewCtrl_repMatrix_ctl00_eventRow_lnkTrailer" href="Film.aspx?EventID=646077480">TRAILER</a><br>
			    Alterskat. <a id="ctl00_ContentPlaceHolder_matrixSingleViewCtrl_repMatrix_ctl00_eventRow_lnkRating" href="/Informationen/Altersfreigabe/Zuerich.aspx">J14</a><br>
			    Filmlänge 127 Min.
			</td>
		    </tr>
		</tbody></table>
	    </td>
	    <td class="tdMatrixImage">
	       
	    </td>
	</tr>
	*/})),
};
 
 
describe("KitagIndexHandler", function() {
	var handler;
	var testDocument;
 
	beforeEach(function() {
		handler = new KitagIndexHandler();
		//testDocument = kitagTestDocuments["Index.aspx"];
		testDocument = kitagTestDocuments["de/programm/jetzt-im-kino/"];
	});
 
	describe("match", function() {
		it("should be match on jetzt-im-kino pages", function() {
			expect(handler.match("https://www.kitag.com/de/programm/jetzt-im-kino/")).toBe(true);
		});
 
		it("should NOT be match on Film.aspx pages", function() {
			expect(handler.match("http://www.kitag.com/Programm/Film.aspx?MovieID=660379112")).not.toBe(true);
		});

	});
	       
	it("should find elements on the jetzt-im-kino page", function() {
			var movieElements = handler.getMovieElements( testDocument);
 
			expect(movieElements).not.toBe(null);
			expect(movieElements.length).toBe(1);
 
	});
	       
	describe("getMovieNameForMovieElement", function() {
		it("should identify movie names in the page", function() {
			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );
			expect(movieElements.length).toBe(1);
 
			// get the handler to give us the movie names for each element
			expect(handler.getMovieNameForMovieElement(movieElements[0])).toBe("BEFORE I GO TO SLEEP");
			});
	});
 
});
 
describe("KitagFilmHandler", function() {
	var handler;
	var testDocument;
 
	beforeEach(function() {
		handler = new KitagFilmHandler();
		testDocument = kitagTestDocuments["Film.aspx"];
	});
 
	describe("match", function() {
		it("should NOT be match on Index.aspx pages", function() {
			expect(handler.match("http://www.kitag.com/Programm/Index.aspx?rollout=true")).not.toBe(true);
		});
 
		it("should be match on Film.aspx pages", function() {
			expect(handler.match("http://www.kitag.com/Programm/Film.aspx?MovieID=660379112")).toBe(true);
		});
	});
 
	describe("getMovieElements", function() {
		it("should find elements on the page", function() {
			var movieElements = handler.getMovieElements( testDocument  );
 
			expect(movieElements).not.toBe(null);
			expect(movieElements.length).toBe(1);
			});
	});
 
	describe("getMovieNameForMovieElement", function() {
		it("should identify movie names in the page", function() {
			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );
			expect(movieElements.length).toBe(1);
 
			// get the handler to give us the movie names for each element
			expect(handler.getMovieNameForMovieElement(movieElements[0])).toBe("SNOW WHITE AND THE HUNTSMAN");
		});
	});
 
	describe("addRatingElements", function() {
		it("should add elements to the document", function() {
			expect(testDocument.html).toMatch( "tr" );
 
			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );
 
			// get the handler to add a test element to the 1st movieElement
			var ratingElement = document.createElement("testelement");
			handler.addRatingElement( ratingElement, movieElements[0] );
			expect(testDocument.html()).toMatch( "testelement" );
		});
	});
});
 


describe("StarticketHandler", function() {
	var handler;

	beforeEach(function() {
		handler = new StarticketHandler();
	});

	describe("getMovieELements", function() {
		it("should find elements on the 0ShowList.asp page", function() {
			var movieElements = handler.getMovieElements( starticketTestDocuments["0ShowList.asp page"] );

			expect(movieElements).not.toBe(null);
			expect(movieElements.length).toBe(2);
		});
	});
	
	describe("getMovieNameForMovieElement", function() {
		it("should identify movie names in the list", function() {
			var testDocument = starticketTestDocuments[ "0ShowList.asp page" ];

			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );
			expect(movieElements.length).toBe(2);

			// get the handler to give us the movie names for each element
			expect(handler.getMovieNameForMovieElement(movieElements[0])).toBe("Starbuck");
			expect(handler.getMovieNameForMovieElement(movieElements[1])).toBe("The Artist");
		});
	});
	
	describe("addRatingElements", function() {
		it("should add elements in the specials list", function() {
			var testDocument = starticketTestDocuments["0ShowList.asp page"];

			// get the handler to find the movie elements
			var movieElements = handler.getMovieElements( testDocument );

			// get the handler to add a test element to the 1st movieElement
			expect(testDocument.html()).not.toMatch( "testelement" );
			var ratingElement = document.createElement("testelement");
			handler.addRatingElement( ratingElement, movieElements[0] );
			expect(testDocument.html()).toMatch( "testelement" );
		});
	});

});

// ImdbForSwiss Cinema - URL matching tests
describe("ImdbForSwissCinema", function() {
	var handler;

	beforeEach(function() {
		var movieLookup = jasmine.createSpy('movieLookup');
		handler = new ImdbForSwissCinema(movieLookup);
	});

	describe("CinemanListHandler", function() {
		it("should match handler for the URL " + "http://www.cineman.ch/en/showtimes/jetzt_im_kino.php?order=cinema", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/showtimes/jetzt_im_kino.php?order=cinema" ) instanceof CinemanListHandler).toBe(true);
		});

		it("should match handler for the URL " + "http://www.cineman.ch/en/showtimes/jetzt_im_kino.php?order=movie", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/showtimes/jetzt_im_kino.php?order=movie" ) instanceof CinemanListHandler).toBe(true);
		});

		it("should match handler for the URL " + "http://www.cineman.ch/en/showtimes/process.php?order=movie&lang=en", function() {
			expect(handler.getPageHandler("http://www.cineman.ch/en/showtimes/process.php?order=movie&lang=en") instanceof CinemanListHandler).toBe(true);
		});
	
		it("should match handler for the URL " + "http://www.cineman.ch/en/showtimes/process.php?order=time&lang=en", function() {
			expect(handler.getPageHandler("http://www.cineman.ch/en/showtimes/process.php?order=time&lang=en") instanceof CinemanListHandler).toBe(true);
		});
	
		it("should match handler for the URL " + "http://www.cineman.ch/en/showtimes/Z%FCrich/", function() {
			expect(handler.getPageHandler("http://www.cineman.ch/en/showtimes/Z%FCrich/") instanceof CinemanListHandler).toBe(true);
		});
	
		it("should match handler for the URL " + "http://www.cineman.ch/en/comingsoon/", function() {
			expect(handler.getPageHandler("http://www.cineman.ch/en/comingsoon/") instanceof CinemanListHandler).toBe(true);
		});
		
		it("should match handler for the URL " + "http://www.cineman.ch/en/kinoprogramm/openair/movies.php", function() {
			expect(handler.getPageHandler("http://www.cineman.ch/en/kinoprogramm/openair/movies.php") instanceof CinemanListHandler).toBe(true);
		});
		
	});
	
	describe("FilmPodiumHandler", function() {
		it("should match handler for the URL " + "http://www.filmpodium.ch/Programm/ReiheInfo.aspx?t=1&r=3", function() {
			expect(handler.getPageHandler( "http://www.filmpodium.ch/Programm/ReiheInfo.aspx?t=1&r=3" ) instanceof FilmPodiumHandler).toBe(true);
		});
	});
		
	describe("OrangeCinemaProgramHandler", function() {
		it("should match handler for the URL " + "http://www.orangecinema.ch/zuerich/overview.php?menu_sel=2010", function() {
			expect(handler.getPageHandler( "http://www.orangecinema.ch/zuerich/overview.php?menu_sel=2010" ) instanceof OrangeCinemaProgramHandler).toBe(true);
		});

		it("should match handler for the URL " + "http://www.orangecinema.ch/bern/overview.php?menu_sel=2011", function() {
			expect(handler.getPageHandler( "http://www.orangecinema.ch/bern/overview.php?menu_sel=2011" ) instanceof OrangeCinemaProgramHandler).toBe(true);
		});
	});

	describe("OrangeCinemaSpecialsListHandler", function() {
		it("should match handler for the URL" + "http://www.orangecinema.ch/zuerich/specials_01.php?menu_sel=specials&tab_sel=1", function() {
			expect(handler.getPageHandler( "http://www.orangecinema.ch/zuerich/specials_01.php?menu_sel=specials&tab_sel=1" ) instanceof OrangeCinemaSpecialsListHandler ).toBe(true);
		});
	});

	describe("StarticketHandler", function() {
		it("should match handler for the URL " + "https://www.starticket.ch/orangecinemazuerich/0Showlist.asp", function() {
			expect(handler.getPageHandler( "https://www.starticket.ch/orangecinemazuerich/0Showlist.asp" ) instanceof StarticketHandler ).toBe(true);
		});
	});
	
	describe("Non handlers", function() {
		it("should NOT match a handler for the URL " + "http://www.google.com/", function() {
			expect(handler.getPageHandler( "http://www.google.com/" )).toBe(null);
		});

		it("should NOT match a handler for the URL " + "http://www.cineman.ch/en/", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/" )).toBe(null);
		});
		
		it("should NOT match a handler for the URL " + "http://www.orangecinema.ch/staedte.php", function() {
			expect(handler.getPageHandler( "http://www.orangecinema.ch/staedte.php" )).toBe(null);
		});

		it("should NOT match a handler for the URL " + "https://www.starticket.ch/orangecinemazuerich/info.asp", function() {
			expect(handler.getPageHandler( "https://www.starticket.ch/orangecinemazuerich/info.asp" )).toBe(null);
		});
	});


	describe("Not yet handled", function() {
		it("shouldn't match for the URL " + "http://www.orangecinema.ch/zuerich/event.php?id=1", function() {
			expect(handler.getPageHandler( "http://www.orangecinema.ch/zuerich/event.php?id=1" )).toBe(null);
		});
		
		it("shouldn't match for the URL " + "http://www.orangecinema.ch/zuerich/specials_02_unicef.php?tab_sel=2&menu_sel=specials", function() {
			expect(handler.getPageHandler( "http://www.orangecinema.ch/zuerich/specials_02_unicef.php?tab_sel=2&menu_sel=specials" )).toBe(null);
		});

		it("shouldn't match for the URL " + "http://www.filmpodium.ch/", function() {
			expect(handler.getPageHandler( "http://www.filmpodium.ch/" )).toBe(null);
		});
		
		it("shouldn't match for the URL " + "http://www.filmpodium.ch/Programm/HeuteDetails.aspx?d=2012-07-08", function() {
			expect(handler.getPageHandler( "http://www.filmpodium.ch/Programm/HeuteDetails.aspx?d=2012-07-08" )).toBe(null);
		});		
		
		it("shouldn't match for the URL " + "http://www.cineman.ch/en/rating/", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/" )).toBe(null);
		});
		
		it("shouldn't match for the URL " + "http://www.cineman.ch/en/watchlist/charts.php", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/" )).toBe(null);
		});
		
		it("shouldn't match for the URL " + "http://www.cineman.ch/en/trailer/", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/" )).toBe(null);
		});
		
		it("shouldn't match for the URL " + "http://www.cineman.ch/en/dvd/", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/" )).toBe(null);
		});
		
		it("shouldn't match for the URL " + "http://www.cineman.ch/en/movie/list/", function() {
			expect(handler.getPageHandler( "http://www.cineman.ch/en/" )).toBe(null);
		});
	});
});

