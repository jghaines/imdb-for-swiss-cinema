function hereDoc(f) {
	// multi-line hack from http://stackoverflow.com/questions/805107/how-to-create-multiline-strings
	return f.toString().
			replace(/^[^\/]+\/\*!?/, '').
			replace(/\*\/[^\/]+$/, '');
}


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


describe("ImdbForSwissCinema", function() {
	var handler;

	beforeEach(function() {
		var movieLookup = jasmine.createSpy('movieLookup');
		handler = new ImdbForSwissCinema(movieLookup);
	});

	it("should find a handler for the URL http://www.cineman.ch/en/showtimes/jetzt_im_kino.php?order=cinema", function() {
		expect(handler.getPageHandler( "http://www.cineman.ch/en/showtimes/jetzt_im_kino.php?order=cinema" ) instanceof CinemanListHandler).toBe(true);
	});

	it("should find a handler for the URL http://www.orangecinema.ch/zuerich/overview.php?menu_sel=2010", function() {
		expect(handler.getPageHandler( "http://www.orangecinema.ch/zuerich/overview.php?menu_sel=2010" ) instanceof OrangeCinemaProgramHandler).toBe(true);
	});

	it("should find a handler for the URL http://www.orangecinema.ch/zuerich/specials_01.php?menu_sel=specials&tab_sel=1", function() {
		expect(handler.getPageHandler( "http://www.orangecinema.ch/zuerich/specials_01.php?menu_sel=specials&tab_sel=1" ) instanceof OrangeCinemaSpecialsListHandler ).toBe(true);
	});

	it("should NOT find a handler for the URL http://www.google.com/", function() {
		expect(handler.getPageHandler( "http://www.google.com/" )).toBe(null);
	});

});