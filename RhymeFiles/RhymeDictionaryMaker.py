import requests

# Function to fetch words from a text file
def fetch_words_from_file(file_path):
    with open(file_path, 'r') as file:
        words = file.read().splitlines()
    return words

# Function to fetch rhymes for a given word using the API
def fetch_rhymes(word):
    api_url = f'https://api.api-ninjas.com/v1/rhyme?word={word}'
    response = requests.get(api_url, headers={'X-Api-Key': ''})
    if response.status_code == requests.codes.ok:
        return response.json()
    else:
        print(f"Error fetching rhymes for '{word}':", response.status_code, response.text)
        return []

# Function to export dictionary to a text file
def export_to_text_file(word_rhyme_dict, file_path):
    with open(file_path, 'w') as file:
        for word, rhymes in word_rhyme_dict.items():
            file.write(f"{word}: {rhymes}\n")

# Fetch words from the text file
words = fetch_words_from_file('word_list.txt')

# Dictionary to store words and their corresponding rhymes
word_rhyme_dict = {}

# Iterate through each word and fetch its rhymes
for i, word in enumerate(words, 1):
    rhymes = fetch_rhymes(word)
    word_rhyme_dict[word] = rhymes

# Export the dictionary to a text file
file_path = 'word_rhyme_dict'
export_to_text_file(word_rhyme_dict, file_path)
print(f"Dictionary '{file_path}' exported.")



