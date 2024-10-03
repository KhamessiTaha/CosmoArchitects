import requests
import csv

# Initial API URL with your API key
api_key = 'lf9ca3nAatRf8yfpG7V0Vn8fH8OYjMGYqGMV63fF'
base_url = f'https://api.nasa.gov/neo/rest/v1/neo/browse?api_key={api_key}'

# File path for saving the CSV in the same directory as the script
csv_file = 'neo_data2.csv'

# Define the CSV headers
headers = [
    'id', 'name', 'absolute_magnitude_h', 'is_potentially_hazardous_asteroid',
    'estimated_diameter_min_km', 'estimated_diameter_max_km'
]

# Open the CSV file for writing
with open(csv_file, mode='w', newline='') as file:
    writer = csv.writer(file)
    # Write the headers
    writer.writerow(headers)

    # Loop through all pages of the API
    current_url = base_url
    while current_url:
        response = requests.get(current_url)
        data = response.json()

        # Extract Near Earth Objects data
        neo_objects = data.get('near_earth_objects', [])

        # Write data from the current page to the CSV
        for neo in neo_objects:
            neo_id = neo.get('id')
            neo_name = neo.get('name')
            absolute_magnitude_h = neo.get('absolute_magnitude_h')
            is_potentially_hazardous = neo.get('is_potentially_hazardous_asteroid')
            estimated_diameter_min = neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_min')
            estimated_diameter_max = neo.get('estimated_diameter', {}).get('kilometers', {}).get('estimated_diameter_max')

            # Write the row to the CSV file
            writer.writerow([neo_id, neo_name, absolute_magnitude_h, is_potentially_hazardous, estimated_diameter_min, estimated_diameter_max])

        # Get the next page link (if available) and update current_url
        current_url = data['links'].get('next')

print(f"Data saved to {csv_file}")
