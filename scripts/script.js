const topArtists = [];
const totalGenres = [];
const topArtistsID = [];
const artistPopularity = [];
const relatedArtists = [];

const getSpotify = () => {
    const clientId = 'd419a183bf4c4b0a9460e58ae401303b';
    const redirectUri = 'http://127.0.0.1:5500/stats.html';

    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=user-top-read`;

    window.location = url;
}

const getAccessToken = () => {
    var accessToken = "";
    const accessTokenTemp = window.location.hash.substring(1).split('=');
    console.log(accessTokenTemp);   // testing purposes
    for (let i = 0; i < accessTokenTemp[1].length; i++) {
        if (accessTokenTemp[1][i] == '&') {
            break;
        } else {
            accessToken += accessTokenTemp[1][i];
        }
    }
    console.log(accessToken);   // testing purposes
    localStorage.setItem('access_token', JSON.stringify(accessToken));                                      // local storage
    return accessToken;
}

// Function used for taking the artist data
const usersTopGenre = async () => {
    const calculateGenreFrequency = (totalGenres) => {
        const frequencyMap = {};


        for (const genre of totalGenres.flat()) {
            if (frequencyMap.hasOwnProperty(genre)) {
                frequencyMap[genre]++;
            } else {
                frequencyMap[genre] = 1;
            }
        }

        return frequencyMap;
    }

    function findMostFrequentGenres(frequencyMap, count) {
        const sortedGenres = Object.keys(frequencyMap).sort((a, b) => frequencyMap[b] - frequencyMap[a]);
        return sortedGenres.slice(0, count);
    }

    const genreFrequency = calculateGenreFrequency(totalGenres);

    const mostFrequentGenres = findMostFrequentGenres(genreFrequency, 10);

    //console.log(mostFrequentGenres);
    return mostFrequentGenres;
}

const getTopArtists = async (mode, term) => {
    const accessToken = getAccessToken();
    if (accessToken) {
        await fetch(`https://api.spotify.com/v1/me/top/artists?time_range=${term}&limit=30`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            },
        })
            .then(response => response.json())
            .then(data => {
                switch (mode) {
                    case 1: // case for pushing total genres associated with artists and then calling 'usersTopGenre' to calculate their top genres
                        for (let i = 0; i < data.items.length; i++) {
                            const artistGenres = data.items[i].genres;
                            totalGenres.push(artistGenres);
                        }
                        usersTopGenre();
                        break;
                    case 2: // case for getting artists name and their associated ID
                        for (let i = 0; i < data.items.length; i++) {
                            topArtists.push(data.items[i].name);
                            topArtistsID.push(data.items[i].id);
                            artistPopularity.push(data.items[i].popularity)
                        }
                        console.log(topArtists);
                        localStorage.setItem('topArtists', JSON.stringify(topArtists));                 // local storage for top artists
                        localStorage.setItem('topArtistsID', JSON.stringify(topArtistsID));             // local storage for top artist's IDs
                        localStorage.setItem('artistPopularity', JSON.stringify(artistPopularity));     // local storage for top artists's popularity
                        displayArtistsInList(topArtists, 'genreList'); // Call displayArtistsInList to update the HTML
                        break;
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

// This function is used at stats.html. This function adds the array elements (top 30 artists) into a list to display to the user
/*const displayArtistsInList = () => {
    const genre_list = document.getElementById('genreList');

    topArtists.forEach(artist => {
        const listItem = document.createElement('li');
        listItem.innerText = artist;
        genre_list.appendChild(listItem);
    })
}*/

const displayArtistsInList = (arrayName, elementName) => {
    const genre_list = document.getElementById(elementName);

    arrayName.forEach(element => {
        const listItem = document.createElement('li');
        listItem.innerText = element;
        genre_list.appendChild(listItem);
    })
}

// displays chart on stats.html
const displayChart = async () => {
    if (myChart !== null) {
        myChart.destroy();
    }

    try {
        //console.log("Displaying chart");
        const genre_frequency = await usersTopGenre(); // Calculate genre frequency from totalGenres array
        console.log(genre_frequency);

        const ctx = document.getElementById('myChart');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.values(genre_frequency), // Use the genre names as labels
                datasets: [{
                    label: 'Your top 10 most genres listened to',
                    data: [10, 9, 8, 7, 6, 5, 4, 3, 2, 1], // Use the genre frequency values as data
                    backgroundColor: ['red', 'orange', 'yellow', 'green', 'blue', 'black', 'brown', 'indigo', 'violet', 'cyan'],
                    borderWidth: 1
                }],
            },
            options: {
                responsive: true,
                legend: {
                    position: 'bottom'
                }
            }
        });
        //console.log('Canvas Width:', ctx.canvas.width); // Log canvas width for inspection
        //console.log('Canvas Height:', ctx.canvas.height); // Log canvas height for inspection
        //console.log('Chart Object:', myChart); // Log the chart object for inspection
    } catch (error) {
        console.log("Error displaying chart data", error);
    }
};

// Popularity page scripting

const getPopularity = () => {
    const access_token = JSON.parse(localStorage.getItem('access_token'));
    const artists = JSON.parse(localStorage.getItem('topArtists'));
    const artists_IDs = JSON.parse(localStorage.getItem('topArtistsID'));
    const artist_popularity = JSON.parse(localStorage.getItem('artistPopularity'));
    var popularitySum = 0;

    console.log(artists);
    console.log(artist_popularity);

    for (let i = 0; i < artist_popularity.length; i++) {
        popularitySum += artist_popularity[i];
    }
    popularitySum = popularitySum / 30;

    console.log(popularitySum);

    var displayUsersArtistPopularity;
    if (popularitySum >= 80) {
        displayUsersArtistPopularity = document.getElementById("display-rank")
        displayUsersArtistPopularity.innerText = "Your music taste is basic as hell";
    } else if (popularitySum >= 60 && popularitySum < 80) {
        displayUsersArtistPopularity = document.getElementById("display-rank")
        displayUsersArtistPopularity.innerText = "Your music taste is somewhat mainstream";
    } else if (popularitySum >= 40 && popularitySum < 60) {
        displayUsersArtistPopularity = document.getElementById("display-rank")
        displayUsersArtistPopularity.innerText = "Your music taste is niche";
    } else if (popularitySum >= 20 && popularitySum < 40) {
        displayUsersArtistPopularity = document.getElementById("display-rank")
        displayUsersArtistPopularity.innerText = "You live in the underground";
    } else {
        displayUsersArtistPopularity = document.getElementById("display-rank")
        displayUsersArtistPopularity.innerText = "You live in THE DEPTHS of the underground";
    }

    return popularitySum;
}

const fadeInScore = () => {
    const paragraph = document.getElementById('score');

    setTimeout(() => {
        paragraph.style.transition = "opacity 1s ease-in-out";
        paragraph.style.opacity = 1;
    }, 7000);
    console.log("fade in score");
}

const fadeInParagraph = () => {
    const paragraph = document.getElementById('popularity-info-box');

    setTimeout(() => {
        paragraph.style.transition = "opacity 1s ease-in-out";
        paragraph.style.opacity = 1;
        paragraph.innerHTML = `This score is determined by looking at your top 30 artists and based off of the number of listeners they have on Spotify, a rank from 0 (being the least popular) and 100 (being the most popular) is assigned to each artist. We then take that number and divide it by 30 to get your score.\n If your score is between...\n
        <ul>
            <li>80 and 100, your taste is considered basic</li>
            <li>60 and 79, your taste is considered mainstream</li>
            <li>40 and 59, your taste is considered niche</li>
            <li>20 and 39, your taste is considered underground</li>
            <li>0 and 19, you live in the depths of the underground</li>
        </ul> `
    }, 8000);
    console.log("fade in paragraph");
}

/*const visitedArtists = [];
const retrievedArtists = [];
var currentArtist = [];
var currentArtistID = [];

const getRelatedArtists = async (mode, clickedArtist) => {  //mode 1 for initialization, mode 2 for future calls. Pass empty string for clickedArtist for mode 1
    var tempArtists;
    var tempArtistsID;
    const access_token = JSON.parse(localStorage.getItem('access_token'));
    const artists = JSON.parse(localStorage.getItem('topArtists'));
    const artists_IDs = JSON.parse(localStorage.getItem('topArtistsID'));
    switch (mode) {
        case 1:
            //const artists = JSON.parse(localStorage.getItem('topArtists'));
            //const artists_IDs = JSON.parse(localStorage.getItem('topArtistsID'));

            tempArtists = artists;
            tempArtistsID = artists_IDs;

            //testing purposes
            console.log(access_token);
            console.log(artists);
            console.log(artists_IDs);
            console.log('temp vars below');
            console.log(artists);
            console.log(artists_IDs);
            //

            break;

        case 2:
            //currentArtist = clickedArtist;
            tempArtists.push(currentArtist);
            tempArtistsID.push(currentArtistID);
            break;
    }
    try {
        // Create an array of promises for each artist ID
        //const promises = artists_IDs.map(async (id) => {
        const promises = currentArtistID.map(async (id) => {
            const response = await fetch(`https://api.spotify.com/v1/artists/${id}/related-artists`, {
                headers: {
                    'Authorization': 'Bearer ' + access_token,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            for (let i = 0; i < tempArtists.length; i++) {
                var ulElement = document.createElement("ul");
                document.getElementById("artist-tree").appendChild(ulElement);
                for (let j = 0; j < data.artists.length; j++) {
                    console.log(data.artists[j].name);
                    var liElement = document.createElement("li");
                    ulElement.appendChild(liElement);
                    liElement.innerText = data.artistArr[j].name;*/
/*console.log(data.artists[i].name);
retrievedArtists.push(data.artists[i].name);
visitedArtists.push(data.artists[i].name);*/
//console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG");       // for testing purposes
/*}
console.log("GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG");       // for testing purposes
}
});


// Wait for all promises to resolve
await Promise.all(promises);

console.log('All related artists fetched');
} catch (error) {
console.error('Error fetching related artists:', error);
}
};* /


/*const displayArtistTree = (artistArr) => {
for (let i = 0; i < artistArr.length; i++) {
var ulElement = document.createElement("ul");
document.getElementById("artist-tree").appendChild(ulElement);
for (let j = 0; j < 20; j++) {
var liElement = document.createElement("li");
ulElement.appendChild(liElement);
liElement.innerText = artistArr[j];
}
}
}*/

/* Discovery page script */

var relatedArtistName = [];
var relatedArtistID = [];

const getRelatedArtists = async (artistID) => {
    const access_token = JSON.parse(localStorage.getItem('access_token'));

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistID}/related-artists`, {
        headers: {
            'Authorization': 'Bearer ' + access_token,
        },
    });

    const data = await response();
    for (let i = 0; i < data.length; i++) {
        relatedArtistName.push(data.artists[i].name);
        relatedArtistID.push(data.artists[i].id);
    }
}

const showRelatedArtists = (artistArray, artistArrayID) => {
    const artistList = document.getElementById('discovery-artist-list');
    for (let i = 0; i < artistArray.length; i++) {
        const newElement = document.createElement('li');
        const button = document.createElement('button');
        button.innerText = artistArray[i];

        //button.addEventListener('click', getRelatedArtists(artistArrayID[i]));
        button.addEventListener('click', () => {
            console.log('test');
        });
        newElement.appendChild(button);
        artistList.appendChild(newElement);
    }
    console.log('show related artists success');
}
