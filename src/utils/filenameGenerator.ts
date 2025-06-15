
interface TextElement {
  id: string;
  text: string;
  isTitle: boolean;
  number?: number;
  titleNumber?: number;
  visible: boolean;
  applied?: boolean;
  appliedColor?: string;
}

export const generateAudioFilename = (
  appliedBlocks: TextElement[],
  textBlocks: TextElement[],
  selectedLanguage: string
): string => {
  // Language mapping to remove accents and ñ
  const languageMap: { [key: string]: string } = {
    'spanish': 'espanol',
    'english': 'english',
    'french': 'frances', 
    'german': 'aleman',
    'italian': 'italiano',
    'polish': 'polaco',
    'portuguese': 'portugues',
    'arabic': 'arabe',
    'hindi': 'hindi',
    'japanese': 'japones',
    'korean': 'coreano',
    'chinese': 'chino',
    'turkish': 'turco',
    'romanian': 'rumano',
    'dutch': 'holandes',
    'greek': 'griego',
    'vietnamese': 'vietnamita',
    'bulgarian': 'bulgaro',
    'finnish': 'finlandes',
    'croatian': 'croata',
    'swedish': 'sueco',
    'norwegian': 'noruego',
    'danish': 'danes'
  };

  const languageName = languageMap[selectedLanguage] || 'audio';
  
  // Check if applied blocks are before first title (intro paragraphs)
  const firstTitleIndex = textBlocks.findIndex(block => block.isTitle);
  const hasIntroContent = appliedBlocks.some(block => {
    const blockIndex = textBlocks.findIndex(tb => tb.id === block.id);
    return !block.isTitle && (firstTitleIndex === -1 || blockIndex < firstTitleIndex);
  });
  
  // Check if we have only titles
  const hasOnlyTitles = appliedBlocks.every(block => block.isTitle);
  
  // Check if we have mixed content
  const hasTitles = appliedBlocks.some(block => block.isTitle);
  const hasParagraphs = appliedBlocks.some(block => !block.isTitle);
  
  if (hasIntroContent && !hasTitles) {
    return `${languageName}_intro.mp3`;
  } else if (hasOnlyTitles) {
    return `${languageName}_titulos.mp3`;
  } else if (hasTitles && hasParagraphs) {
    return `${languageName}_contenido.mp3`;
  } else {
    return `${languageName}_parrafos.mp3`;
  }
};
