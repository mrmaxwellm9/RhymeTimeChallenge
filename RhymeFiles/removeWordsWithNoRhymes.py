# Function to parse combined dictionary from a text file
def parse_combined_dictionary(file_path):
    combined_dict = {}
    with open(file_path, 'r') as file:
        for line in file:
            key, value = line.strip().split(": ")
            combined_dict[key] = eval(value)  # Convert string representation of list to actual list
    return combined_dict

# Function to remove words with no rhymes from the dictionary
def remove_words_with_no_rhymes(combined_dict):
    words_with_no_rhymes = [word for word, rhymes in combined_dict.items() if not rhymes]
    for word in words_with_no_rhymes:
        del combined_dict[word]

# Read the combined dictionary from the file
combined_dict = parse_combined_dictionary('combined_dictionary.txt')

# Remove words with no rhymes from the dictionary
remove_words_with_no_rhymes(combined_dict)

# Output the updated combined dictionary back to the same file
with open('combined_dictionary.txt', 'w') as file:
    for key, value in combined_dict.items():
        file.write(f"{key}: {value}\n")
