function hereDoc(f) {
	// multi-line hack from http://stackoverflow.com/questions/805107/how-to-create-multiline-strings
	return f.toString().
			replace(/^[^\/]+\/\*!?/, '').
			replace(/\*\/[^\/]+$/, '');
}

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
			imdbInfo.ID = imdbInfoId;
			imdbInfo.getUrl = getImdbUrl;
			onloadImdbInfo( movieName, imdbInfo );
		}
		
		this.imdbSearchUrl = function(movieName) {
			return "http://example.com";
		}
	}
	
	beforeEach(function() {
		pageHandler = new CinemanListHandler();
		movieLookupHandler = new DummyMovieLookupHandler();
		spyOn(movieLookupHandler, 'loadImdbInfoForMovieName').andCallThrough();
		
		cache = [];
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
		expect(Object.keys(cache).length).toBe(3);
		expect(cache['moviename.' + movieName]).toBe( imdbInfoId ); // original movie name
		expect(cache['moviename.' + movieName + ' (1600)' ]).toBe( imdbInfoId ); // movie name with year
		expect(cache['imdbId.' + imdbInfoId]).toMatch( movieName ); // the movie object has the movieName
		expect(cache['imdbId.' + imdbInfoId]).toMatch( imdbInfoId ); // and the id (fuzzy checking)
		
	});
	
	it("should be able to match a single cached element", function() {
		var elements = [ document.createElement("element") ];

		spyOn(pageHandler, 'match').andReturn(true);
		spyOn(pageHandler, 'addRatingElement');
		spyOn(pageHandler, 'getMovieNameForMovieElement').andReturn( movieName );
		spyOn(pageHandler, 'getMovieElements').andReturn( elements );

		// pre-populate the cache
		cache['moviename.' + movieName ] =  imdbInfoId;
		cache['moviename.' + movieName + ' (' + movieYear + ')'] =  imdbInfoId;
		cache['imdbId.tt101'] = imdbObjectString;
		// check the cache
		expect(Object.keys(cache).length).toBe(3);
		
		// do the markup
		var markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );
		markup.doMarkup( elements[0] );
		
		// pageHandler should get invoked to parse and markup the page
		expect(pageHandler.getMovieElements).toHaveBeenCalled();
		expect(pageHandler.getMovieNameForMovieElement).toHaveBeenCalledWith( elements[0] );
		expect(pageHandler.addRatingElement).toHaveBeenCalledWith( jasmine.any(Object), elements[0] );

		// shouldn't need to invoke the movieLookup handler - it should be cached
		expect(movieLookupHandler.loadImdbInfoForMovieName).not.toHaveBeenCalled();

		// cache should be same size
		expect(Object.keys(cache).length).toBe(3);

	});
	
	it("should be able to match a single cached element with a year", function() {
		var elements = [ document.createElement("element") ];

		// pageHandler will 'find' the moviename with the year
		spyOn(pageHandler, 'match').andReturn(true);
		spyOn(pageHandler, 'addRatingElement');
		spyOn(pageHandler, 'getMovieNameForMovieElement').andReturn( movieName + ' (' + movieYear + ')' );
		spyOn(pageHandler, 'getMovieElements').andReturn( elements );

		// pre-populate the cache
		cache['moviename.' + movieName ] =  imdbInfoId;
		cache['moviename.' + movieName + ' (' + movieYear + ')'] =  imdbInfoId;
		cache['imdbId.tt101'] = imdbObjectString;
		// check the cache
		expect(Object.keys(cache).length).toBe(3);
		
		// do the markup
		var markup = new ImdbMarkup( pageHandler, movieLookupHandler, cache );
		markup.doMarkup( elements[0] );
		
		// pageHandler should get invoked to parse and markup the page
		expect(pageHandler.getMovieElements).toHaveBeenCalled();
		expect(pageHandler.getMovieNameForMovieElement).toHaveBeenCalledWith( elements[0] );
		expect(pageHandler.addRatingElement).toHaveBeenCalledWith( jasmine.any(Object), elements[0] );

		// shouldn't need to invoke the movieLookup handler - it should be cached
		expect(movieLookupHandler.loadImdbInfoForMovieName).not.toHaveBeenCalled();

		// cache should be same size
		expect(Object.keys(cache).length).toBe(3);

	});
});

// ImdbMovieLookup tests - TODO
describe("ImdbComMovieLookup", function() {
	it("TODO", function() {
	});
});
	
describe("ImdbApiComMovieLookup", function() {
	it("TODO", function() {
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

