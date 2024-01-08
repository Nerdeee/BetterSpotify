const topArtists = [];
const totalGenres = [];

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
                    case 1:
                        for (let i = 0; i < data.items.length; i++) {
                            const artistGenres = data.items[i].genres;
                            totalGenres.push(artistGenres);
                        }
                        usersTopGenre();
                        //displayChart();
                        break;
                    case 2:
                        for (let i = 0; i < data.items.length; i++) {
                            topArtists.push(data.items[i].name);
                        }
                        console.log(topArtists);
                        displayArtistsInList(); // Call displayArtistsInList to update the HTML
                        break;
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

// This function is used at stats.html. This function adds the array elements (top 30 artists) into a list to display to the user
const displayArtistsInList = () => {
    const genre_list = document.getElementById('genreList');

    topArtists.forEach(artist => {
        const listItem = document.createElement('li');
        listItem.innerText = artist;
        genre_list.appendChild(listItem);
    })
}

const displayChart = async () => {
    if (myChart !== null) {
        myChart.destroy();
    }

    try {
        console.log("Displaying chart");
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
        console.log('Canvas Width:', ctx.canvas.width); // Log canvas width for inspection
        console.log('Canvas Height:', ctx.canvas.height); // Log canvas height for inspection
        console.log('Chart Object:', myChart); // Log the chart object for inspection
    } catch (error) {
        console.log("Error displaying chart data", error);
    }
};