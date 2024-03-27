import os

# Function to combine all dictionary files into one
def combine_dictionary_files(directory):
    combined_dict = {}
    for filename in os.listdir(directory):
        if filename.startswith("word_rhyme_dict_") and filename.endswith(".txt"):
            with open(os.path.join(directory, filename), 'r') as file:
                for line in file:
                    key, value = line.strip().split(": ")
                    combined_dict[key] = eval(value)  # Convert string representation of list to actual list
    return combined_dict


# Directory containing dictionary files
directory = 'DictFiles'
combined_dict = combine_dictionary_files(directory)


# Output the combined dictionary to a file
with open('combined_dictionary.txt', 'w') as file:
    for key, value in combined_dict.items():
        file.write(f"{key}: {value}\n")

