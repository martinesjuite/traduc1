
import { toast } from '@/hooks/use-toast';

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

interface ApiRequestParams {
  apiUrl: string;
  apiKey: string;
  customHeaders: string;
  requestMethod: string;
  appliedBlocks: TextElement[];
  appliedContent: string;
  appliedTitles: TextElement[];
  appliedParagraphs: TextElement[];
}

export const sendApiRequest = async (params: ApiRequestParams) => {
  const {
    apiUrl,
    apiKey,
    customHeaders,
    requestMethod,
    appliedBlocks,
    appliedContent,
    appliedTitles,
    appliedParagraphs
  } = params;

  // Parse custom headers
  let headers = {};
  try {
    headers = JSON.parse(customHeaders);
  } catch (e) {
    headers = { "Content-Type": "application/json" };
    toast({
      title: "Advertencia",
      description: "Headers inválidos, usando Content-Type por defecto",
      variant: "destructive"
    });
  }

  // Add API key to headers if provided
  if (apiKey) {
    headers = { ...headers, "Authorization": `Bearer ${apiKey}` };
  }

  const requestBody = {
    content: appliedContent,
    elements: appliedBlocks.map(block => ({
      id: block.id,
      text: block.isTitle ? block.text.substring(2) : block.text, // Remove first 2 chars from titles
      isTitle: block.isTitle,
      number: block.number,
      titleNumber: block.titleNumber
    })),
    titles: appliedTitles.map(title => ({
      id: title.id,
      text: title.text.substring(2), // Remove first 2 characters from title text
      titleNumber: title.titleNumber
    })),
    paragraphs: appliedParagraphs.map(p => ({
      id: p.id,
      text: p.text,
      number: p.number
    })),
    totalElements: appliedBlocks.length,
    totalTitles: appliedTitles.length,
    totalParagraphs: appliedParagraphs.length,
    totalCharacters: appliedContent.length,
    timestamp: new Date().toISOString()
  };

  console.log('Enviando petición a:', apiUrl);
  console.log('Headers:', headers);
  console.log('Body:', requestBody);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000); // 300 seconds timeout

  const response = await fetch(apiUrl, {
    method: requestMethod,
    headers,
    body: requestMethod !== 'GET' ? JSON.stringify(requestBody) : undefined,
    signal: controller.signal,
    mode: 'cors',
  });

  clearTimeout(timeoutId);

  // Check if response is audio
  const contentType = response.headers.get('content-type');
  const isAudio = contentType && (contentType.includes('audio/') || contentType.includes('audio/mpeg'));

  if (isAudio) {
    // Handle audio response
    const audioBlob = await response.blob();
    const audioObjectUrl = URL.createObjectURL(audioBlob);
    
    const responseDetails = `Status: ${response.status} ${response.statusText}\n` +
      `Content-Type: ${contentType}\n` +
      `Audio file received successfully!\n` +
      `File size: ${(audioBlob.size / 1024).toFixed(2)} KB`;
    
    return {
      isAudio: true,
      audioUrl: audioObjectUrl,
      response: responseDetails,
      status: response.status,
      statusText: response.statusText
    };
  } else {
    // Handle text response
    const responseText = await response.text();
    let formattedResponse = '';

    try {
      const jsonResponse = JSON.parse(responseText);
      formattedResponse = JSON.stringify(jsonResponse, null, 2);
    } catch (e) {
      formattedResponse = responseText;
    }

    const responseDetails = `Status: ${response.status} ${response.statusText}\n` +
      `Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n\n` +
      `Body:\n${formattedResponse}`;

    return {
      isAudio: false,
      response: responseDetails,
      status: response.status,
      statusText: response.statusText
    };
  }
};
