import React, { useEffect, useState } from 'react';

function NasaData() {
  const [neoData, setNeoData] = useState([]);

  useEffect(() => {
    // Fetch data from NASA's API
    const fetchNeoData = async () => {
      try {
        const response = await fetch(
          'https://api.nasa.gov/neo/rest/v1/feed?start_date=2024-01-01&end_date=2024-01-08&api_key=DEMO_KEY'
        );
        const data = await response.json();
        setNeoData(data.near_earth_objects);
      } catch (error) {
        console.error('Error fetching NASA data:', error);
      }
    };

    fetchNeoData();
  }, []);

  return (
    <div>
      <h2>NASA Near-Earth Objects Data</h2>
      <ul>
        {Object.keys(neoData).map((date) => (
          <li key={date}>
            <strong>{date}</strong>
            {neoData[date].map((object) => (
              <p key={object.id}>
                {object.name} - Diameter: {object.estimated_diameter.kilometers.estimated_diameter_max.toFixed(2)} km
              </p>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NasaData;
