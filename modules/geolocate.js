import axios from 'axios';

document.addEventListener('DOMContentLoaded', function () {
    const locationInput = document.getElementById('locationInput');
    const resultContainer = document.getElementById('resultContainer');

    // Event listener for input changes
    locationInput.addEventListener('input', function () {
        const location = locationInput.value.trim();
        if (location) {
            getSuggestions(location);
        } else {
            // Clear the result container if the input is empty
            resultContainer.innerHTML = '';
        }
    });

    // Function to get suggestions from Nominatim API
    async function getSuggestions(location) {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
            const suggestions = response.data;
            displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error fetching suggestions:', error.message);
        }
    }

    // Function to display suggestions in the result container
    function displaySuggestions(suggestions) {
        if (suggestions && suggestions.length > 0) {
            const suggestionHTML = suggestions.map(suggestion => {
                return `<li class="suggestion-item" data-lat="${suggestion.lat}" data-lon="${suggestion.lon}" data-name="${suggestion.display_name}">${suggestion.display_name}</li>`;
            }).join('');
            resultContainer.innerHTML = `<ul>${suggestionHTML}</ul>`;
            // Add click event listener to each suggestion item
            const suggestionItems = document.querySelectorAll('.suggestion-item');
            suggestionItems.forEach(item => {
                item.addEventListener('click', function () {
                    const name = item.getAttribute('data-name');
                    locationInput.value = name; // Automatically add the selected suggestion to the input field
                    const lat = item.getAttribute('data-lat');
                    const lon = item.getAttribute('data-lon');
                    locateLocation(lat, lon);
                    clearSuggestions(); // Clear suggestions after selecting one
                });
            });
        } else {
            resultContainer.innerHTML = '<p>No suggestions found.</p>';
        }
    }

    // Function to clear suggestions
    function clearSuggestions() {
        resultContainer.innerHTML = '';
    }

    // Function to locate a specific location on the map
    function locateLocation(latitude, longitude) {
        // Here, you can write your code to locate the location on the map
        // For demonstration purposes, I'm logging the latitude and longitude
        console.log('Locating:', latitude, longitude);
        // You can use these coordinates to display the location on the map using OpenLayers or any other mapping library
    }
});