/**
 * Created by aislingdempsey on 5/16/16.
 */

var callStack = [];

function displayBusiness(result){
    $("#results-map").empty().attr('style', 'visibility: hidden');
    var name = result.yelp_bus_data.name;

    var categories = result.categories;
    var formattedAddress="";
    var busAddressArray = result.yelp_bus_data.location.display_address || undefined;
    var displayAddress=[];
    for (i=0; i < busAddressArray.length; i++){
        displayAddress[i]={'line': busAddressArray[i]}

    }
    for(var i=0; i < busAddressArray.length; i++){
        formattedAddress += busAddressArray[i] + '<br>'
        }

    var coords ={};
    coords.lat = result.yelp_bus_data.location.coordinate.latitide;
    coords.lng = result.yelp_bus_data.location.coordinate.longitude;

    var phone = result.yelp_bus_data.display_phone || undefined;

    //replaces with larger version of image
    var image = result.yelp_bus_data.image_url.replace('/ms.jpg', '/l.jpg');

    var recentReview = result.recent_review || undefined;

    var recentScore = result.recent_score +3 || undefined;

    var score = result.score + 3 || undefined;
    console.log('result.score:', result.score);
    console.log('score:', score);
    var totalRatings = result.total_ratings || undefined;

    var yelpUrl = result.yelp_bus_data.url;

    var userRating = result.user_rating || undefined;
    console.log ('userRating:', userRating);
    if (userRating != undefined) {
        var userScore = userRating.score || undefined;

        var createdAt = userRating.created_at || undefined;

        var userReview = userRating.review || undefined;

        var userRatingId = userRating.rating_id || undefined;
    }
    var yelpScore = result.yelp_bus_data.rating || undefined;

    var yelpReviewImg = result.yelp_bus_data.snippet_image_url.replace('/ms.jpg', '/l.jpg') || undefined;

    var yelpReviewTxt = result.yelp_bus_data.snippet_text || undefined;

    var yelpId = result.yelp_bus_data.id;
    console.log('busAddressArray:', busAddressArray);

    //empties div
    $('#search-results').empty();

    var hashResults = {
        'name': name,
        'phone': phone,
        'busAddress': displayAddress,
        'recentReview': recentReview,
        'category': categories,
        'photo': image,
        'recentScore': recentScore,
        'score': score,
        'yelpUrl': yelpUrl,
        'yelpScore': yelpScore,
        'yelpReviewImg': yelpReviewImg,
        'yelpReviewTxt': yelpReviewTxt
    };

    var template = $('#business-template').html();

    var displayedResults = Mustache.to_html(template, hashResults);
    $('#search-results').html(displayedResults);

    // var havenModalReviewBtn = $('<button>');
    //     havenModalReviewBtn.attr({
    //        class: 'col-lg-8 col-lg-offset-2',
    $('#haven-review-modal-btn').attr({
            'data-name': name,
            'data-userScore': userScore,
            'data-userReview': userReview,
            'data-created-at': createdAt,
            'data-yelpID': yelpId,
            'data-userRatingId': userRatingId
        });
    $('#return-to-query-btn').attr({
            'data-term': callStack.slice(-1)[0]['term'],
            'data-offset': callStack.slice(-1)[0]['offset'],
            'data-sort': callStack.slice(-1)[0]['sort'],
            'data-cutoff': callStack.slice(-1)[0]['cutoff']
        });
    // $('#bus-block').append(backBtn);

//    todo build event listener to handle click

    $('#haven-review-modal-btn').click(reviewBox);
    $('#return-to-query-btn').click(moreResults)

}
//
function reviewBox(evt){
    $('#myModal').modal({
        keyboard: false
    });
    var yelpId = $(this).data('yelpid');
    var name = $(this).data('name');
    var createdAt = $(this).data('created-at') || undefined;
    var userScore = $(this).data('userscore') || undefined;
    var userReview = $(this).data('userreview') || undefined;
    var ratingId = $(this).data('userratingid') || undefined;
    if (userScore == undefined){
        var buttonText = "Submit Rating";
        var headingText = "Rate " + name
    }
    else{
        var buttonText = "Update your Rating";
        var headingText = "Your review from " + createdAt
    }


    $('#modal-title').html(headingText);
    $('.modal-body').html("" +
        "<form> " +
        "<label>Score" +
            "<select name='score' id='user-score-selection' required> " +
            "<!--keeps dropdown blank to prevent accidental scoring--> " +
                "<option selected disabled hidden style='display: none' value=''>" +
                "</option> <option value='-2'>1</option> " +
                "<option value='-1'>2</option> " +
                "<option value='0'>3</option> " +
                "<option value='1'>4</option> " +
                "<option value='2'>5</option> " +
            "</select> " +
        "</label> " +
        "<label>" +
            "<p>Review (500 chars max):</p>" +
        "</label> " +
            "<div id='review-box'>" +
                "<textarea id='user-review-box' name='review' placeholder='Enter your review here' maxlength='500'>" +
                "</textarea>" +
            "</div>" +
        "</label>" +
        "</form>");

    if (userReview != undefined){
        console.log('review should be entered');
        console.log(userReview);
        $('#user-review-box').append(userReview)
    }
    if (userScore !== undefined){
        console.log('score should be entered');
        $('#user-score-selection').val(userScore)
    }

    $('.modal-footer').html('<button type="button" class="btn btn-primary" data-dismiss="modal" data-yelpID="' +yelpId +
        '" data-rating-id="' + ratingId + '" id="review-submit-btn">'+ buttonText + '</button>');

    $('#myModal').modal('show');

    function updateReview(evt){
        var yelpId = $(this).data('yelpid');
        var score = $('#user-score-selection').val();
        var review = $('#user-review-box').val();
        var ratingId =$(this).data('rating-id');
        console.log(yelpId)

        var input = {'yelp_id': yelpId,
                    'score': score};

        console.log('event handler triggered');
        if (review !== ''){
            input['review'] = review;
            console.log('has a review')
        }

        if (typeof(score) === 'string'){
            //updates prior rating if it exists
            if (ratingId !== 'undefined'){
                input['rating_id'] = ratingId;
                console.log('updated rating');}
            $.post('/info/'+yelpId+'/rate', input, function(){console.log('review updated successfully')});

            console.log('should post')
        }

        else{
            console.log("no score, shouldn't post")
        }

    }


    $('#review-submit-btn').click(updateReview)



    ;
}

//this script relies on jquery
function displayResults(result) {
    // console.log('calling display results');
    var offset = result['offset'];
    // var total = result['total_results'];
    console.log('result:', result);
    var businesses = result['businesses'];
    // console.log(businesses);
    var term = result['term'];
    var sort = result['sort'];
    var cutoff = result['cutoff'];
    $('#search-results').empty();

    var map = $("#query-map");
    map.attr("id", "results-map");

    // initMap(result['businesses']);

    var hashResults = {'results': []};

    for (var yelp_id in businesses) {
        // console.log(yelp_id);
        var name = businesses[yelp_id]['name'];
        var category = businesses[yelp_id]['category'];

        var address1 = businesses[yelp_id]['address_line_1'] || false;
        var address2 = businesses[yelp_id]['address_line_2'] || false;

        var phone = businesses[yelp_id]['phone'];

        var url = businesses[yelp_id]['url'] || false;
        var categories = businesses[yelp_id]['cat_list'] || false;

        var yelpRating = businesses[yelp_id]['yelp_score'];
        var havenRating = businesses[yelp_id]['score']|| false;
        var havenCount = businesses[yelp_id]['total_ratings'];
        // console.log(havenCount);
        var photo = businesses[yelp_id]['photo'].replace('/ms.jpg', '/l.jpg');

        // console.log('photo', photo);
        hashResults['results'].push({
            'name': name,
            'category': category,
            'url': url,
            'yelp-score': yelpRating,
            'phone': phone,
            'address1': address1,
            'address2': address2,
            'haven-score': havenRating,
            'bus-id': yelp_id,
            'photo': photo
        });

    console.log('hashResults:', hashResults);
    var template = $('#business-results-template').html();
    // console.log(template);
    var displayedResults = Mustache.to_html(template, hashResults);
    $('#search-results').html(displayedResults);


    }
    var row = $('<div>');
    row.attr('class', 'row');
    row.html('<div class="col-lg-6 col-lg-offset-3 query-btns">');
    $('#search-results').append(row);
   if (callStack.length > 1){
       var mostRecent = callStack.slice(-2,-1)[0];

       var btn = $('<button>');
       btn.attr({
            'id': 'results-back-btn',
            'class': 'nav-btn',
            'data-term': mostRecent.term,
            'data-offset': mostRecent.offset,
            'data-sort': mostRecent.sort,
            'data-cutoff': mostRecent.cutoff
       }).append("<< Go back");
       // $('#search-results').append(btn);
       $('.query-btns').append(btn);
       //
       // $('#results-back-btn').click(function(evt){
       //     callStack.pop();
       //  //  todo fix always returning to first result
       //
       //     moreResults(evt)})
   }
    if ($(".query-result").length ===10){
        // var nextValues = callStack.slice(-1)[0];
        // console.log('make button called');
        var btn = $('<button>');
            btn.attr({
                'id': 'search-more-btn',
                'class': 'nav-btn',
                'data-term': term,
                'data-offset': offset,
                'data-sort': sort,
                'data-cutoff': cutoff
            }).append("More results >>");
            // $('#search-results').append(btn);
            $('.query-btns').append(btn);}


    $('.res-bus-link').click(renderBusiness)
}

function renderBusiness(evt){
    evt.preventDefault();
    console.log('render business called');
    var link = $(this).attr('href');
    console.log(link);
    $.get(link, displayBusiness)
}


function moreResults(evt) {
    // console.log('yooooooo');
    //todo add scroll to return you to top
    evt.preventDefault();

    // if (back !== false){console.log('moreResults called correctly')}
    console.log("'this' is equal to:", $(this));
    var input = {'term': $(this).data("term")||$('#search-field').val(),
                //todo convert this.data to a list
                'offset': $(this).data("offset")||0,
                'sort': $(this).data("sort")||$('.sort-type:checked').val(),
                'cutoff': $(this).data("cutoff")||$('#haven-cutoff').val()
                };
    //if the button being clicked is the more results button, adds to the call stack
    if ($(this).attr('id') === "results-back-btn"){
        callStack.pop()}
    // else if ($(this).attr('id') === "search-btn"){callStack.push(input)}
    else if ($(this).attr('id') === "return-to-query-btn"){}
    else {callStack.push(input)}
    //if the button being clicked is the back button, the topmost value is removed from the callstack
    // else if ($(this).attr('id') === "results-back-btn"){
    //     callStack.pop()}

    console.log('offset', input.offset);
    $.get("/results.json", input, displayResults);

}


//event listener for rendering more results on searches
$(document).on('click', '#search-more-btn', moreResults);
$(document).on('click', '#results-back-btn', moreResults);
$('#search-btn').click(function(evt){
    callStack.length = 0;
    moreResults(evt)
});


//*******************************
//MAPS FUNCTIONS

var subcategories={};

//global array of map markers


window.markers=[];

function clearOverlays(){
    //loops through global array of markers and sets the map to null, then resets markers to an empty list
    //todo add comparison to filter-by list for what to clear

    for (var i=0; i < markers.length; i++){
        markers[i].setMap(null)
    }
    markers.length = 0;
}
//event handler to load map
function initMap(data) {
    console.log('data', data);
    // businessList = businessList || undefined;
    //sets default location to Hackbright in case html5 geolocation is not supported
    var defaultLatLong = {lat: 37.788904, lng: -122.414244487882};
    console.log('generating map');
    var myOptions = {
        zoom: 18,
        mapTypeID: google.maps.MapTypeId.ROADMAP
    };
    console.log('initial location', initialLocation);
    //makes the map equal to the results map if it exists, if not, then the splash map
    window.map = new google.maps.Map(document.getElementById('results-map')||document.getElementById('splash-map'), myOptions);
    //todo get smaller pin
    // var image = '/static/home-pin.png';
    var locGuess = new google.maps.Marker({
                    map: map,
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    position: initialLocation
                    // icon: image
                });

    console.log(locGuess);
    var infoWindow = new google.maps.InfoWindow({
        content: currentAddress
    });

    locGuess.addListener('click', function () {
        infoWindow.close();
        infoWindow.open(map, this);
    });

    // if (businessList !== undefined){
    //
    // }

    if($.isEmptyObject(data)) {
            // todo replace with modal
            console.log('There are no businesses in your area')
        }
    else{addPins(data)}
    //
    // getLocalBest(currentAddress, $('#haven-cutoff').val());
    // // alert("It looks like you're located at ".concat(current_address));

    //EVENT LISTeNER TO GET NEW BUSINESS LIST USING NEW CUTOFF VALUE
    $('#haven-cutoff').change(function (evt) {
        updateCutoff(evt);
        cutoff = $('#haven-cutoff').val();
        getLocalBest(currentAddress, cutoff, function(data){
            if($.isEmptyObject(data)){console.log('There are no businesses in your area')}
            else{
                addPins(data)
            }
        })
    });



    //loops through json of business info and plots points on map.
    function addPins(businesses) {

        clearOverlays();

        //todo add info-window using location

        // category

        for (var business in businesses) {
            // console.log(business);
            // console.log(businesses[business]);
            // console.log(businesses[business]['longitude']);
            // console.log(businesses[business]['latitude']);
            //
            console.log('business in add_Pins:', businesses[business]);
            var businessInfo = '<div id="marker">' +
                '<div id="Header">' +
                '<h3 id="info-name">' +
                businesses[business]['name'] +
                '</h3>' +
                '<p id="info-address">' +
                businesses[business]['address_line_1'] +
                '</p>'+
                '<p>'+businesses[business]['categories']+'</p>' +
                '</div>';

            // var image = '/static/bus-pin.png';

            var marker = new google.maps.Marker({
                map: map,
                draggable: false,
                animation: google.maps.Animation.DROP,
                position: {
                    lat: businesses[business]['latitude'],
                    lng: businesses[business]['longitude']
                },
                html: businessInfo,
                cats: businesses[business]['cat_list'],
                pcats: []
                // icon: image

            });
            //
            for (var i=0; i < marker.cats.length; i++)
                if (parentCats[marker.cats[i]] !== undefined){
                    // console.log($.inArray(parentCats[marker.cats[i]], marker.pcats));
                    if ($.inArray(parentCats[marker.cats[i]], marker.pcats) === parseInt(-1)){
                        marker.pcats.push(parentCats[marker.cats[i]])}
                }



            // for (var i = 0; i < businesses[business]['cat_list'].length; i++){
            //     var parent = parentCats[businesses[business]['cat_list'][i]];
            //     categories.push(parent)
            // }

            // marker.categories = for(subcategory of businesses[business]['cat_list']);

            // marker.pcats = categories;
            markers.push(marker);


            var infoWindow = new google.maps.InfoWindow({
                content: "Loading..."
            });

            // console.log(businessInfo);
            //opens closes any open info windows and opens a new one for the marker being clicked
            marker.addListener('click', function () {
                console.log(this.html);
                infoWindow.setContent(this.html);
                infoWindow.close();
                infoWindow.open(map, this);
                // var image = '/static/pins/mm_20_yellow.png';
                // this.icon = image
            });

        }
        //instantiates the LatLngBounds class
        var newBounds = new google.maps.LatLngBounds();
        //for every marker in the markers list, extends the bounds

        $.each(markers, function (index, marker) {
            newBounds.extend(marker.position)
        });

        //updates the bounds of the map to fit the points
        map.fitBounds(newBounds);
        console.log(markers);
        //
        donut()
    }


    // // CHART
    function donut(){
        console.log('donuts called');
        var parents = {};
        var parentsArray = [];

        



        //**************************************************************************************************************
        //parents format=== {parent cat:{'value': number of markers, 'markers': array of markers, 'label': displayname}}
        //**************************************************************************************************************

        for (var m = 0; m < markers.length; m++) {
            //loops through markers and adds all parent categories to an array
            var marker = markers[m];

            for (var p = 0; p < marker.pcats.length; p++) {
                var parentCat = marker.pcats[p];


                // console.log(markers[i].pcats.length);
                console.log('marker:', marker);
                console.log('marker pcat:', parentCat);
                //pushes parent cat in marker pcat list to parents Array
                // parentsArray.push(markers[marker].pcats[parentCat]);
                // console.log("parentsArray:", parentsArray);




                //if parents[parentCat] doesn't exist, adds marker:

                if (parents[parentCat] === undefined) {
                    parents[parentCat] = {
                        'markers': [marker],
                        'count': 1,
                        'subCats': {}
                    };
                    console.log('Parent Category:', parentCat, "created");
                    console.log(parents[parentCat])
                }

                else{
                    parents[parentCat]['markers'].push(marker);
                    parents[parentCat]['count'] += 1;
                    console.log('Parent Category:', marker[parentCat], 'Updated') ;
                    console.log(parents[marker[parentCat]])
                }

                console.log('Parent heading into subcats:', marker[parentCat]);
                console.log('Parents OL heading into subcats:', parents);


                for (var s = 0; s < marker.cats.length; s++)
                    var subCat = marker.cats[s]

                    if (parents[parentCat]['subCats'][subCat] === undefined) {
                        parents[parentCat]['subCats'][subCat] = {
                            'markers': [marker],
                            'count': 1
                        };
                    }

                    else {
                        parents[parentCat]['subCats'][subCat]['markers'].push(marker);
                        parents[parentCat]['subCats'][subCat]['count'] += 1
                    }
            }
        }
        console.log('parents', parents);

        var parentSeries = [{
            name: 'Business Types',
            colorByPoint: true,
            data:[]
        }];

        var parentDrilldown = {
            series: []
        };

        for(var parentCat in parents) {
            parentSeries[0]['data'].push({
                'name': parentCat,
                'y': parents[parentCat]['count'],
                'drilldown': parentCat,
                'markers': parentCat['markers']
            });

            var subData = [];
            var cat = subCat
            for(var sc in parents[parentCat]['subCats']) {
                var subCat = parents[parentCat]['subCats'][sc];
                subData.push([sc, subCat['count']]);


                parentDrilldown['series'].push({
                    'name': parentCat,
                    'id': parentCat,
                    'data': subData,
                    'markers': subCat['markers']
                })
            }
            console.log('parentSeries:', parentSeries);
            console.log('parentDrilldown:', parentDrilldown);
        }


        $('#results-chart').highcharts({
                chart: {
                    type: 'pie'
                },
                title: {
                    text: 'Best Businesses Near You'
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            format: '{point.name}: {point.y}'
                        }
                    }
                },

                tooltip: {
                    headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                    pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y}</b><br/>'
                },

                series: parentSeries,
                drilldown: parentDrilldown

            });

    }

}




    //gets best local businesses above cutoff
function getLocalBest(location, cutoff, callback) {
    // console.log('getLocalBest called');
    var payload = {'location': location,
        'cutoff': cutoff
    };
    $.get('/local-best.json', payload, function (data) {
        // console.log(typeof(data));
        // console.log(data);

        //todo, check if the map breaks at hackbright, this is why
        callback(data);
        // console.log('generating map');

        // addPins(data)
        // initMap(data)
    })
}


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
                        'Error: The Geolocation service failed.' :
                        'Error: Your browser doesn\'t support geolocation.');
}

// function updateChart(businesses){
//    loop through markers on click, generate dict of count

// }



//*******************************
//CUTOFF ADJUSTMENT FUNCTIONS

//event handler to update displayed cutoff above fader
function updateCutoff(evt){
    console.log('update cutoff run');
    $('#cutoff-val').html("Don't show ratings below: " + (parseFloat($('#haven-cutoff').val()) + 3));

}

//event listener to update the cutoff when the fader is changed
$('#haven-cutoff').change(updateCutoff);


function getLocation(evt) {
    //comment out for dynamic location
//     window.initialLocation = new google.maps.LatLng(37.7579717, -122.388535);
//
//     var geocoder = new google.maps.Geocoder;
//
//     geocoder.geocode({location: initialLocation}, function (results) {
//                     // console.log(results[0].formatted_address);
//                     // console.log(results[0].formatted_address);
//         window.currentAddress = results[0].formatted_address;
//                     // console.log(currentAddress);
//
//         var cutoff = $('#haven-cutoff').val();
//         getLocalBest(currentAddress, cutoff,
//             function(data){initMap(data)})
//     });
//
//     // }
//
//     $('#save-address-btn').click(setNewAddress)
//
// }

  // Uncomment for working splash. Commented out for demo
    if (navigator.geolocation) {
        var browserSupportFlag = true;

        // todo build if statement to check whether location has been defined.
        navigator.geolocation.getCurrentPosition(function (position) {
            window.initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            //gets best local businesses near starting point
            var geocoder = new google.maps.Geocoder;
             // if (currentAddress === undefined) {
            geocoder.geocode({location: initialLocation}, function (results) {
                window.currentAddress = results[0].formatted_address;

                // address popup modal
                $('#myModal').modal({
                    keyboard: false
                });
                $('#modal-title').html('Verify your Address');
                $('.modal-body').html("<form><textarea id='user-address' name='initialLocation'></textarea></form>");
                $('#user-address').val(currentAddress);

                $('#myModal').modal('show')
                ;
            })
            // }
                ;

            $('#save-address-btn').click(setNewAddress);

        }, function () {
            handleNoGeolocation(browserSupportFlag)
        });
    }
    else {
        var browserSupportFlag = false;
        handleNoGeolocation(browserSupportFlag);
    }

    function handleNoGeolocation(errorFlag) {
        if (errorFlag == true) {
            // todo enter address for modal
            alert("Geolocation service failed.");
            window.initialLocation = defaultLatLong;
        } else {
            // todo enter address for modal
            alert("Your browser doesn't support geolocation, please enter an address");
            window.initialLocation = defaultLatLong
        }
    }
}

function setNewAddress (evt){
    window.currentAddress = $('#user-address').val();
    var address = {'address': currentAddress};
    // console.log(address);
    var geocoder = new google.maps.Geocoder();
    var cutoff = $('#haven-cutoff').val();
    geocoder.geocode(address, function(results){
       window.initialLocation= results[0].geometry.location;
        // console.log('initial location within set address', initialLocation);
        $.post('/set-address', address, function(){getLocalBest(currentAddress, cutoff,
            function(data){initMap(data)})})
    });
}

function getSession(evt){
    $.get('/get-session.json', function(results){
        userAddress = results.user_address || undefined;
        console.log(userAddress);
        if (userAddress != undefined){
            window.currentAddress = userAddress
        }
        getLocation(evt)
    })
}

$('#address-btn').click(function(evt){
    preventDefault(evt);
    getLocation});
// $(document).on('click', '#random-fucking-btn', function(){console.log('button')});


//todo add middle function to check for session var
$(document).ready(getLocation);


    // $.get"maps.googleapis.com/maps/api/geocode/json?latlng="+myLatLng['lat']+","+myLatLng['lng']+"&key="+YOUR_API_KEY
    //
    // $.get"/local.json", address, addLocalBest



