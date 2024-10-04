import csv
import json

# Function to filter and convert CSV data to JavaScript object format
def process_csv_to_js_object(input_csv, output_file):
    asteroids = {}

    with open(input_csv, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            # Only include rows where the diameter is not empty or unknown
            diameter = row.get("diameter")
            if not diameter or diameter.strip() == '':
                continue  # Skip this row if diameter is not valid

            # Create a nested object structure for each asteroid
            asteroid_name = row.get("full_name", "").strip()
            asteroids[asteroid_name] = {
                "name": asteroid_name,
                "epoch_mjd": float(row.get("epoch_mjd", 0)),
                "a": float(row.get("a", 0)),
                "e": float(row.get("e", 0)),
                "i": float(row.get("i", 0)),
                "om": float(row.get("om", 0)),
                "w": float(row.get("w", 0)),
                "ma": float(row.get("ma", 0)),
                "diameter": float(diameter),  # Use float for valid diameters
                "pha": row.get("pha", "").strip(),
                "class": row.get("class", "").strip(),
                "per": row.get("per", "").strip()
            }

    # Convert the dictionary into a JavaScript object string
    js_object = f"const asteroids = {json.dumps(asteroids, indent=2)};"

    # Write the output to a JavaScript file
    with open(output_file, 'w', encoding='utf-8') as jsfile:
        jsfile.write(js_object)

    print(f"Processed {len(asteroids)} asteroids and saved to {output_file}.")

# Usage for asteroids CSV
process_csv_to_js_object(
    r"C:\Users\tahas\Desktop\Nasa Hackathon 2024\CosmoArchitects\cosmoarchitects-frontend\src\assets\csv to js\sbdb_query_results(asteroid).csv", 
    "asteroids.js"
)

# Usage for comets CSV
process_csv_to_js_object(
    r"C:\Users\tahas\Desktop\Nasa Hackathon 2024\CosmoArchitects\cosmoarchitects-frontend\src\assets\csv to js\sbdb_query_results(comets).csv", 
    "comets.js"
)
