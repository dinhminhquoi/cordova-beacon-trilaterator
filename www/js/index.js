/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var beaconArray = {
    "1752": 
        {
            "11111": 
                {
                    x:0,
                    y:0,
                    distance:null,
                    colour:"#0000FF"
                }
            ,
            "22222": 
                {
                    x:3.5,
                    y:5,
                    distance:null,
                    colour:"#00CED1"
                }
            ,
            "33333": 
                {
                    x:0,
                    y:5,
                    distance:null,
                    colour:"#663399"
                }
            
        }
    
};

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        app.drawBeacons();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        var beaconManager = new BeaconManager();
        var beaconsList = document.getElementById('beacons');
        beaconManager.startPulling(500);
        beaconManager.on('updated', function(beacon){
            var item = document.getElementById('beacon_' + beacon.major + '_' + beacon.minor);

            if(item) {
                item.innerText = beacon.major + '/' + beacon.minor + ' - ' + formatDistance(beacon.distance);
            }
            beaconArray[String(beacon.major)][String(beacon.minor)].distance = beacon.distance;
            jQuery("#beacon-"+String(beacon.minor).charAt(0)+" .radius").css("width",beacon.distance*200).css("height",beacon.distance*200).css("margin-left",-beacon.distance*100).css("margin-top",-beacon.distance*100);
            
            var p = getPosition();
            if (p !== null) {
                var user = document.getElementById("user");
                user.style.left = (p.x*100)+"px";
                user.style.top = (p.y*100)+"px";
                console.log("x: " + p.x,"y: " + p.y);
            }
        });
        beaconManager.on('added', function(beacon) {
            var item = document.createElement('li');
            item.innerText = beacon.major + '/' + beacon.minor + ' - ' + formatDistance(beacon.distance);
            item.id = 'beacon_' + beacon.major + '_' + beacon.minor;

            beaconsList.appendChild(item);
            beaconArray[String(beacon.major)][String(beacon.minor)]["distance"] = beacon.distance;
        });
        beaconManager.on('removed', function(beacon) {
            var item = document.getElementById('beacon_' + beacon.major + '_' + beacon.minor);

            if(item) {
                beaconsList.removeChild(item);
            }
            beaconArray[String(beacon.major)][String(beacon.minor)].distance = null;
        });
        console.log('Received Event: ' + id);
    },
    drawBeacons: function() {
        var beacon1 = document.getElementById("beacon-1");
        beacon1.style.left = beaconArray["1752"]["11111"]["x"] * 100+"px";
        beacon1.style.top = beaconArray["1752"]["11111"]["y"] * 100+"px";
        
        var beacon2 = document.getElementById("beacon-2");
        beacon2.style.left = beaconArray["1752"]["22222"]["x"] * 100+"px";
        beacon2.style.top = beaconArray["1752"]["22222"]["y"] * 100+"px";
        
        var beacon3 = document.getElementById("beacon-3");
        beacon3.style.left = beaconArray["1752"]["33333"]["x"]*100+"px";
        beacon3.style.top = beaconArray["1752"]["33333"]["y"]*100+"px";
        
    }
};

function formatDistance(meters) {
    if(meters > 1) {
        return meters.toFixed(3) + ' m';
    } else {
        return (meters * 100).toFixed(3) + ' cm';
    }
}

function getPosition() {
    // Match up beacons to position and distance
    // Choose 3 closest beacons
    // perform trilateration on beacons
    return getTrilateration(beaconArray["1752"]["11111"],beaconArray["1752"]["22222"],beaconArray["1752"]["33333"]);
}

function getTrilateration(position1, position2, position3) {
    if (position1.distance !== null && position2.distance !== null && position3.distance !== null) {
        var xa = position1.x;
        var ya = position1.y;
        var xb = position2.x;
        var yb = position2.y;
        var xc = position3.x;
        var yc = position3.y;
        var ra = position1.distance;
        var rb = position2.distance;
        var rc = position3.distance;

        var S = (Math.pow(xc, 2.) - Math.pow(xb, 2.) + Math.pow(yc, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(rc, 2.)) / 2.0;
        var T = (Math.pow(xa, 2.) - Math.pow(xb, 2.) + Math.pow(ya, 2.) - Math.pow(yb, 2.) + Math.pow(rb, 2.) - Math.pow(ra, 2.)) / 2.0;
        var y = ((T * (xb - xc)) - (S * (xb - xa))) / (((ya - yb) * (xb - xc)) - ((yc - yb) * (xb - xa)));
        var x = ((y * (ya - yb)) - T) / (xb - xa);

        return {
            x: x,
            y: y
        };
    } else {
        return null;   
    }
}