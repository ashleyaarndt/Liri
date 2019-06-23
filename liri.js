require("dotenv").config();
var fs = require("fs");
var keys = require("./keys.js");
var request = require('request');
var spotifyInstance = require('node-spotify-api');
var parseSpotify = new spotifyInstance(keys.spotify);
var action = process.argv[2];
var parameter = process.argv[3];

function switchCase() {

    switch (action) {

        case 'concert-this':
        bandsInTown(parameter);                   
        break;                          

        case 'spotify-this-song':
        spotify(parameter);
        break;

        case 'movie-this':
        omdb(parameter);
        break;

        case 'do-what-it-says':
        randomText();
        break;

        default:                            
        dataLog("Sorry Try Again!");
        break;
    }
};

const bandsInTown = (parameter) => {

    if (action === 'concert-this')  {
        var conertName="";
        for (var i = 3; i < process.argv.length; i++)   {
            conertName+=process.argv[i];
        }
        console.log(conertName);
        } else {
            conertName = parameter;
    }

    var queryUrl = "https://rest.bandsintown.com/artists/"+conertName+"/events?app_id=codingbootcamp";

    request(queryUrl, function(error, response, body) {

        if (!error && response.statusCode === 200) {

            var parsedJSON = JSON.parse(body);
        
            for (i = 0; i < parsedJSON.length; i++) {
                var concertTime = parsedJSON[i].datetime;
                var month = concertTime.substring(5,7);
                var year = concertTime.substring(0,4);
                var day = concertTime.substring(8,10);
                var dateForm = month + "/" + day + "/" + year

                dataLog("\n-----------------------------------------\n");
                dataLog("Date: " + dateForm);
                dataLog("Name: " + parsedJSON[i].venue.name);
                dataLog("City: " + parsedJSON[i].venue.city);

                if (parsedJSON[i].venue.region !== "")  {
                    dataLog("Country: " + parsedJSON[i].venue.region);
                }
                dataLog("Country: " + parsedJSON[i].venue.country);
                dataLog("\n-----------------------------------------\n");
            }   
        }
    });
}

const spotify = (parameter) => {

    var songToSearch;
    if (parameter === undefined) {
        songToSearch = "The Sign ace of base";
    } else {
        songToSearch = parameter;
    }

    parseSpotify.search({
        type: 'track',
        query: songToSearch
    }, 
    
    function(error, data) {
        if (error) {
            dataLog('Error occurred: ' + error);
            return;
        } else {
            dataLog("\n-----------------------------------------\n");
            dataLog("Artist: " + data.tracks.items[0].artists[0].name);
            dataLog("Song: " + data.tracks.items[0].name);
            dataLog("Preview: " + data.tracks.items[3].preview_url);
            dataLog("Album: " + data.tracks.items[0].album.name);
            dataLog("\n-----------------------------------------\n");
        }
    });
};

const omdb = (parameter) => {

	var queryUrl = "http://www.omdbapi.com/?t=" + parameter + "&y=&plot=short&apikey=40e9cece";

	request(queryUrl, function(error, response, body) {
		if (!parameter){
            parameter = 'Mr Nobody';
        }
		if (!error && response.statusCode === 200) {

            dataLog("Title Of The Movie: " + JSON.parse(body).Title);
            dataLog("Year The Movie Came Out: " + JSON.parse(body).Year);
            dataLog("IMDB Rating Of The Movie: " + JSON.parse(body).imdbRating);
            dataLog("Rotten Tomatoes Rating Of The Movie: " + JSON.parse(body).Ratings[1].Value);
            dataLog("Country Where The Movie Was Produced: " + JSON.parse(body).Country);
            dataLog("Language Of The Movie: " + JSON.parse(body).Language);
            dataLog("Plot Of The Movie: " + JSON.parse(body).Plot);
            dataLog("Actors In The Movie: " + JSON.parse(body).Actors);
		}
	});
};


const randomText = () => {
    fs.readFile('random.txt', "utf8", function(error, data){

        if (error) {
            return dataLog(error);
        }

        var dataArray = data.split(",");
    
        if (dataArray[0] === "spotify-this-song") {
            var songcheck = dataArray[1].trim().slice(1, -1);
            spotify(songcheck);
        } else if (dataArray[0] === "concert-this") { 
            if (dataArray[1].charAt(1) === "'")   {
                var dataLength = dataArray[1].length - 1;
                var data = dataArray[1].substring(2,dataLength);
                console.log(data);
                bandsInTown(data);
            } else {
                var bandName = dataArray[1].trim();
                console.log(bandName);
                bandsInTown(bandName);
            }
        } else if(dataArray[0] === "movie-this") {
            var movie_name = dataArray[1].trim().slice(1, -1);
            omdb(movie_name);
        } 
    });
};

const dataLog = (parameter) => {

	console.log(parameter);
	fs.appendFile('log.txt', parameter + '\n', function(err) {
		if (err) return dataLog('Error logging data to file: ' + err);	
	});
}

switchCase();