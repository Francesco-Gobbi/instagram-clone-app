import { PROFANITY_WORDS } from '../constants/profanity';

const useProfanityFilter = () => {
  const filterText = (text) => {
    if (!text) {
      return '';
    }

    let filteredText = text;
    PROFANITY_WORDS.forEach((word) => {
      const regex = new RegExp(word, 'gi');
      filteredText = filteredText.replace(regex, '*'.repeat(word.length));
    });

    return filteredText;
  };

  return { filterText };
};

export default useProfanityFilter;
