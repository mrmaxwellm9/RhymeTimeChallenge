# Function to parse combined dictionary from a text file
def parse_combined_dictionary(file_path):
    combined_dict = {}
    with open(file_path, 'r') as file:
        for line in file:
            key, value = line.strip().split(": ")
            combined_dict[key] = eval(value)  # Convert string representation of list to actual list
    return combined_dict

# Read the combined dictionary from the text file
combined_dict = parse_combined_dictionary('updated_combined_dictionary.txt')

# Function to ensure every value for each key is a key that has the original key as a value
def ensure_values_as_keys(combined_dict):
    invalid_values = []
    for key, value in combined_dict.items():
        for v in value:
            # Check if the value exists as a key in the dictionary and if the original key is present in its values
            if v not in combined_dict or key not in combined_dict[v]:
                invalid_values.append((key, v))
    return invalid_values

# Ensure every value for each key is a key that has the original key as a value
invalid_values = ensure_values_as_keys(combined_dict)

# Output the invalid values to a file
with open('invalid_values.txt', 'w') as file:
    for key, value in invalid_values:
        file.write(f"{key}: {value}\n")
