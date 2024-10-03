import csv
import json

# Function to filter and convert CSV data to JavaScript object format
def process_csv_to_js_object(input_csv, output_file, filter_criteria=None):
    asteroids = []
    
    with open(input_csv, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        
        for row in reader:
            # Apply any filtering logic (e.g., only include if diameter is not empty)
            if filter_criteria:
                if not filter_criteria(row):
                    continue
            
            # Convert each row into a JavaScript object structure
            asteroid = {
                "name": row.get("full_name", "").strip(),
                "epoch_mjd": float(row.get("epoch_mjd", 0)),
                "a": float(row.get("a", 0)),
                "e": float(row.get("e", 0)),
                "i": float(row.get("i", 0)),
                "om": float(row.get("om", 0)),
                "w": float(row.get("w", 0)),
                "ma": float(row.get("ma", 0)),
                "diameter": row.get("diameter") if row.get("diameter") else 'unknown',  # Handle unknown diameters
                "pha": row.get("pha", "").strip(),
                "class": row.get("class", "").strip(),
                "per": row.get("per", "").strip()
            }
            asteroids.append(asteroid)
    
    # Convert the list of dictionaries into a JavaScript object string
    js_object = f"const asteroids = {json.dumps(asteroids, indent=2)};"
    
    # Write the output to a JavaScript file
    with open(output_file, 'w', encoding='utf-8') as jsfile:
        jsfile.write(js_object)

    print(f"Processed {len(asteroids)} asteroids and saved to {output_file}.")

# Filtering criteria example (optional)
def filter_criteria(row):
    # Example: Filter asteroids with valid data and eccentricity <= 0.9
    return float(row.get("e", 0)) <= 0.9

# Usage for asteroids CSV
process_csv_to_js_object(r"C:\Users\tahas\Desktop\Nasa Hackathon 2024\CosmoArchitects\cosmoarchitects-frontend\src\assets\csv to js\sbdb_query_results(asteroid).csv", "asteroids.js", filter_criteria)

# Usage for comets CSV
process_csv_to_js_object(r"C:\Users\tahas\Desktop\Nasa Hackathon 2024\CosmoArchitects\cosmoarchitects-frontend\src\assets\csv to js\sbdb_query_results(comets).csv", "comets.js")
