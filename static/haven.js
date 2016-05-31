/**
 * Created by aislingdempsey on 5/16/16.
 */

//this script relies on jquery
function displayResults(result) {
    console.log('calling display results');
    var offset = result['offset'];
    // var total = result['total_results'];
    console.log(result);
    var businesses = result['businesses'];
    console.log(businesses);
    var term = result['term'];
    var sort = result['sort'];
    var cutoff = result['cutoff'];
    $('#search-results').empty();

    var map = $("<div>");
    map.attr("id", "results-map");
    $('#search-results').append(map);
    
    initMap();


    var resultNum = 1;
    for (var yelp_id in businesses) {
        console.log(yelp_id);
        var name = businesses[yelp_id]['name'];
        var category = businesses[yelp_id]['category'];

        var address1 = businesses[yelp_id]['address_line_1'] || undefined;
        var address2 = businesses[yelp_id]['address_line_2'] || undefined;

        var yelpRating = businesses[yelp_id]['yelp_score'];
        var havenRating = businesses[yelp_id]['score']|| undefined;
        var havenCount = businesses[yelp_id]['total_ratings'];
        console.log(havenCount);
        var photo = businesses[yelp_id]['photo'];


        var container = $("<div>");
        container.attr({
            id: "result" + resultNum,
            class: "query-result"});
        $('#search-results').append(container);

        var image = $("<img>");
        image.attr({
            src: photo,
            class: "result-photos"
        });
        $('#result'+resultNum).append(image);

        var link =$('<a>');
            link.attr({
            href: "/info/"+yelp_id,
            id: "bus-link"+resultNum
        });
        $('#result'+resultNum).append(link);

        var result_name = $('<p>');
        result_name.attr(
            'class', "result-name")
            .html(name);
        $('#bus-link'+resultNum).html(name);

        if (address1 !== undefined) {
            var streetAddress1 = $('<p>');
            streetAddress1.attr(
                'class', "street-1")
                .html(address1);
            $('#result'+resultNum).append(streetAddress1);
        }

        if (address2 !== undefined) {
            var streetAddress2 = $('<p>');
            streetAddress2.attr(
                'class', "street-2")
                .html(address2);

            $('#result'+resultNum).append(streetAddress2);
        }


        var yelpScore = $('<p>');
        yelpScore.attr(
            "class", 'yelp-score')
            .html(yelpRating);
        $('#result'+resultNum).append(yelpScore);


        if (havenRating !== undefined) {
            var haven = $('<p>');

            haven.attr(
                'class', 'haven-rating')
                .html(havenRating + " out of " + havenCount + " ratings");

            $('#result' + resultNum).append(haven);
        }

        if (havenRating == undefined) {
            var haven = $('<p>');

            haven.attr(
                'class', 'haven-rating')
                .html("Nobody has rated this business yet. Be the first!");

            $('#result' + resultNum).append(haven);
        }

        resultNum ++

    }

    console.log("length of results div", $(".query-result").length);
    if ($(".query-result").length ===10){
        console.log('make button called');
        var btn = $('<button>');
            btn.attr({
                'class': 'search-more-btn',
                'data-term': term,
                'data-offset': offset,
                'data-sort': sort,
                'data-cutoff': cutoff}).append("More results...");
            $('#search-results').append(btn);}


}

function moreResults(evt) {
    // console.log('yooooooo');
    evt.preventDefault();
    var input = {'term': $(this).data("term")||$('#search-field').val(),
                //todo convert this.data to a list
                'offset': $(this).data("offset")||0,
                'sort': $(this).data("sort")||$('.sort-type:checked').val(),
                'cutoff': $(this).data("cutoff")||$('#haven-cutoff').val()
                };
    console.log('cutoff', input.cutoff);
    $.get("/results.json", input, displayResults);

}


//event listener for rendering more results on searches
$(document).on('click', '.search-more-btn', moreResults);

$('#search-btn').click(moreResults);


//*******************************
//MAPS FUNCTIONS

var subcategories={};

//global array of map markers


var markers=[];

function clearOverlays(){
    //loops through global array of markers and sets the map to null, then resets markers to an empty list
    //todo add comparison to filter-by list for what to clear

    for (var i=0; i < markers.length; i++){
        markers[i].setMap(null)
    }
    markers.length = 0;
}
//event handler to load map
function initMap(evt) {
    //sets default location to Hackbright in case html5 geolocation is not supported
    var defaultLatLong = {lat: 37.788904, lng: -122.414244487882};

    var myOptions = {
        zoom: 18,
        mapTypeID: google.maps.MapTypeId.ROADMAP
    };
    console.log('initial location', initialLocation);
    //makes the map equal to the results map if it exists, if not, then the splash map
    var map = new google.maps.Map(document.getElementById('results-map')||document.getElementById('splash-map'), myOptions);
    //todo get smaller pin
    var image = '/static/pins/home-pin.png';
    var locGuess = new google.maps.Marker({
                    map: map,
                    draggable: true,
                    animation: google.maps.Animation.DROP,
                    position: initialLocation,
                    icon: image
                });

    console.log(locGuess);
    var infoWindow = new google.maps.InfoWindow({
        content: currentAddress
    });

    locGuess.addListener('click', function () {
        infoWindow.close();
        infoWindow.open(map, this);
    });




    getLocalBest(currentAddress, $('#haven-cutoff').val());
    // alert("It looks like you're located at ".concat(current_address));

    //EVENT LISTeNER TO GET NEW BUSINESS LIST USING NEW CUTOFF VALUE
    $('#haven-cutoff').change(function () {
        updateCutoff(evt);
        getLocalBest(currentAddress, $('#haven-cutoff').val())
    });


    //checks if geolocation is supported by the browser and
    // if (navigator.geolocation) {
    //     var browserSupportFlag = true;
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         var initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    //         console.log(initialLocation);
    //         map.setCenter(initialLocation);
    //
    //
    //
    //         //gets best local businesses near starting point
    //         var geocoder = new google.maps.Geocoder;
    //         geocoder.geocode({location: initialLocation}, function (results) {
    //             // console.log(results[0].formatted_address);
    //             // var currentAddress = results[0].formatted_address;
    //             var locGuess = new google.maps.Marker({
    //                 map: map,
    //                 draggable: true,
    //                 animation: google.maps.Animation.DROP,
    //                 position: initialLocation
    //             });
    //
    //             console.log(locGuess);
    //             var infoWindow = new google.maps.InfoWindow({
    //                 content: current_address
    //             });
    //
    //             locGuess.addListener('click', function () {
    //                 infoWindow.close();
    //                 infoWindow.open(map, this);
    //             });
    //
    //
    //
    //
    //             getLocalBest(current_address, $('#haven-cutoff').val());
    //             // alert("It looks like you're located at ".concat(current_address));
    //
    //             //EVENT LISTeNER TO GET NEW BUSINESS LIST USING NEW CUTOFF VALUE
    //             $('#haven-cutoff').change(function () {
    //                 updateCutoff(evt);
    //                 getLocalBest(current_address, $('#haven-cutoff').val())
    //             })
    //         });
    //
    //         // //creates info window of geolocated address
    //         // geocoder.geocode({location: initialLocation}, function(results){
    //         //     var current_address = results[0].formatted_address;
    //         //     // var infoWindow = new google.maps.InfoWindow({
    //         //     //     content: "It looks like you're located at " + current_address
    //         //     // });
    //         //     // infoWindow.open(map, locGuess)
    //         //     //convert to modal
    //
    //
    //         // });
    //         //
    //         // var currentAddress = geocoder.geocode({location: initialLocation})[0].formatted_address;
    //         // console.log(currentAddress)
    //
    //     //    todo add (nested? ex: call one function to remove from list, then new one to update markers) event listener for chart click to draw new pins
    //
    //
    //     }, function () {
    //         handleNoGeolocation(browserSupportFlag)
    //     });
    // }
    // else {
    //     var browserSupportFlag = false;
    //     handleNoGeolocation(browserSupportFlag);


    function handleNoGeolocation(errorFlag) {
        if (errorFlag == true) {
            alert("Geolocation service failed.");
            var initialLocation = defaultLatLong;
        } else {
            alert("Your browser doesn't support geolocation, please enter an address");
            var initialLocation = defaultLatLong
        }
        map.setCenter(initialLocation);
    }

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

            var businessInfo = '<div id="marker">' +
                '<div id="Header">' +
                '<h3>' +
                businesses[business]['name'] +
                '</h3>' +
                '</div>';


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

            });
            //
            for (var i=0; i < marker.cats.length; i++)
                if (parentCats[marker.cats[i]] !== undefined){
                    console.log($.inArray(parentCats[marker.cats[i]], marker.pcats));
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
        // donut()
    }


    // // CHART
    // function donut(){
    //     console.log('donuts called');
    //     var parents = {};
    //     var parentsArray = [];
    //     for (var i = 0; i < markers.length; i++) {
    //         for (var p = 0; p < markers[i].pcats.length; p++) {
    //             console.log(markers[i].pcats.length);
    //             console.log(markers[i]);
    //             console.log(markers[i].pcats[p]);
    //             parentsArray.push(markers[i].pcats[p]);
    //             console.log("parentsArray:", parentsArray);
    //             if (parents[markers[i].pcats[p]] !== undefined) {
    //                 //intended behaviour: either append the marker to the parent, or mae it equal to an array of it.
    //                 console.log('past the if');
    //                 console.log(parents[markers[i].pcats[p]]);
    //                 parents[markers[i].pcats[p]].push(markers[i])
    //             } else {
    //                 console.log('in the else');
    //                 parents[markers[i].pcats[p]] = [markers[i]]}
    //         }
    //     }
    //     console.log(parents);
    //     for (var cat in parents){
    //         parents[cat]['value'] = parents[cat].length;
    //         console.log(parents[cat]['value']);
    //         parents[cat]['label'] = cat
    //     }
    //
    //     var options = {responsive: true};
    //
    //     var ctx_donut = $("#resultChart");
    //
    //
    //
    //     var myDonutChart = new Chart(ctx_donut, {type: 'doughnut', data: 'parents', options:'options'});
    //     $('#donutLegend').html(myDonutChart.generateLegend());
    //
    // }



    //gets best local businesses above cutoff
    function getLocalBest(location, cutoff) {
        console.log('getLocalBest called');
        var payload = {'location': location,
            'cutoff': cutoff
        };
        $.get('/local-best.json', payload, function (data) {
            console.log(typeof(data));
            console.log(data);

            //todo, check if the map breaks at hackbright, this is why
            if($.isEmptyObject(data)) {
                //replace with modal
                console.log('There are no businesses in your area')

            }
            else{
                console.log('adding pins');
                addPins(data)
            }
        })
    }
}

//event listener to load map on page load
// google.maps.event.addDomListener(window, 'load', initMap);

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
    $('#cutoff-val').html("Don't show ratings below " + (parseFloat($('#haven-cutoff').val()) + 3));

}

//event listener to update the cutoff when the fader is changed
$('#haven-cutoff').change(updateCutoff);


function getLocation(evt) {
    console.log('getLocation called');
    if (navigator.geolocation) {
        var browserSupportFlag = true;
        // todo build if statement to check whether location has been defined.
        navigator.geolocation.getCurrentPosition(function (position) {
            window.initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            // console.log(initialLocation);

            //gets best local businesses near starting point
            var geocoder = new google.maps.Geocoder;
            geocoder.geocode({location: initialLocation}, function (results) {
                // console.log(results[0].formatted_address);
                // console.log(results[0].formatted_address);
                window.currentAddress = results[0].formatted_address;
                // console.log(currentAddress);
               $('#myModal').modal({
                    keyboard: false
                });

            $('#address').html("<form><textarea id='user-address' name='initialLocation'></textarea></form>");
            $('#user-address').val(currentAddress);

            $('#myModal').modal('show')
                ;
            });

            $('#save-address-btn').click(setNewAddress);

            //
            // $('#myModal').modal({
            //     keyboard: false
            // });
            //
            // $('#address').html("<form action='/set-address'><input type='text' name= 'initialLocation' placeholder= "+
            //     current_address + "><input type='submit'>");
            //
            // $('#myModal').modal('show')
            //


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
    geocoder.geocode(address, function(results){
       window.initialLocation= results[0].geometry.location;
        console.log('initial location within set address', initialLocation);
        $.post('/set-address', address, initMap)
    });

}
$('#address-btn').click(getLocation);
// $(document).on('click', '#random-fucking-btn', function(){console.log('button')});


//todo add middle funtion to check for session var
$(document).ready(getLocation);


    // $.get"maps.googleapis.com/maps/api/geocode/json?latlng="+myLatLng['lat']+","+myLatLng['lng']+"&key="+YOUR_API_KEY
    //
    // $.get"/local.json", address, addLocalBest



