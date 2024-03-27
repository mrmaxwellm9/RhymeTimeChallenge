def load_dictionary(file_path):
    dictionary = {}
    with open(file_path, 'r') as file:
        for line in file:
            key, value = line.strip().split(': ')
            value = value.strip("[]").replace("'", "").split(', ')
            dictionary[key] = value
    return dictionary

def load_common_words(file_path):
    with open(file_path, 'r') as file:
        return [word.strip() for word in file]

def find_words_with_10_or_more_rhymes(dictionary, common_words):
    words_with_10_or_more_rhymes = []
    for word in common_words:
        if word in dictionary and len(dictionary[word]) >= 10:
            words_with_10_or_more_rhymes.append(word)
    return words_with_10_or_more_rhymes

def write_to_file(words, file_path):
    with open(file_path, 'w') as file:
        for word in words:
            file.write(word + '\n')

def main():
    # Load dictionary and common words
    dictionary = load_dictionary('combined_dictionary.txt')
    common_words = load_common_words('commonWords.txt')

    # Find words with 10 or more rhymes
    words_with_10_or_more_rhymes = find_words_with_10_or_more_rhymes(dictionary, common_words)

    # Write the found words to a file
    write_to_file(words_with_10_or_more_rhymes, 'words_with_10_or_more_rhymes.txt')

if __name__ == "__main__":
    main()

