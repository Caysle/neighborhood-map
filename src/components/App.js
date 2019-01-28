import React, {Component} from 'react';
import Locations from './Locations';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {
                    'name': "Meat and Justice",
                    'type': "Restaurant",
                    'latitude': 49.840408,
                    'longitude': 24.035820,
                },
                {
                    'name': "The Arsenal",
                    'type': "Restaurant",
                    'latitude': 49.841190,
                    'longitude': 24.035320,
                },
                {
                    'name': "Lviv Handmade Chocolate",
                    'type': "Coffee Shop",
                    'latitude': 49.841228,
                    'longitude': 24.033550,
                },
                {
                    'name': "Lviv Coffee Manufacture",
                    'type': "Coffee Shop",
                    'latitude': 49.841801,
                    'longitude': 24.033180,
                },
                {
                    'name': "Baczewski Restaurant",
                    'type': "Restaurant",
                    'latitude': 49.842200,
                    'longitude': 24.029940,
                }
            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
      //initMap function to call Google Maps API
        window.initMap = this.initMap;
        //Google Maps API
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyCNtBOjCJG1MJ-R4skr9reKv0ia1qNZKfQ&callback=initMap')
    }

    //initialise map
    initMap() {
        var self = this;
        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 49.8397, lng: 24.0297},
            zoom: 14,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /**
     * Open the infowindow for the marker
     * @param {object} location marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * call Foursquare API data
     * @param {object} location marker
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "EYKWUVXTMWPCX3VKRIQH3R1DUWSICX0PQZ0XJNYGEKMIHNJG";
        var clientSecret = "PCCD0PG35AP1PAZTSHKGMMIRGCS1HYEVSKLPZUWJE0YFCQ2O";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20180806&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Can't get information from Foursquare");
                        return;
                    }

                    //print information about venue
                    response.json().then(function (data) {
                        var locationData = data.response.venues[0];
                        var readMore = '<a href="https://foursquare.com/v/'+ locationData.id +'" target="_blank">Foursquare Page</a>';
                        var address = '<b>Address: </b>' + locationData.location.address + '<br>';
                        self.state.infowindow.setContent(address + readMore);
                    });
                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Can't get information from Foursquare");
            });
    }

    /**
     *close the infowindow for the marker
     * @param {object} location marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    //render function
    render() {
        return (
            <div>
                <Locations key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/**
 *load Google Maps
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Can't get information from Google Maps");
    };
    ref.parentNode.insertBefore(script, ref);
}
