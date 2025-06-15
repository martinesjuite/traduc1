
import React, { useState } from 'react';
import { Send, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import AudioPlayer from './AudioPlayer';
import ApiConfigForm from './ApiConfigForm';
import { sendApiRequest } from '../services/apiService';
import { generateAudioFilename } from '../utils/filenameGenerator';

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

interface ApiPanelProps {
  textBlocks: TextElement[];
  selectedLanguage?: string;
}

const ApiPanel: React.FC<ApiPanelProps> = ({ textBlocks, selectedLanguage = 'spanish' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customHeaders, setCustomHeaders] = useState('{"Content-Type": "application/json"}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestMethod, setRequestMethod] = useState('POST');

  // Get applied paragraphs AND titles
  const appliedBlocks = textBlocks.filter(block => block.applied);
  const appliedParagraphs = appliedBlocks.filter(block => !block.isTitle);
  const appliedTitles = appliedBlocks.filter(block => block.isTitle);
  
  // Create content with titles and paragraphs in order, removing first 2 characters from titles
  const appliedContent = appliedBlocks
    .sort((a, b) => {
      // Sort by the original order in textBlocks
      const indexA = textBlocks.findIndex(block => block.id === a.id);
      const indexB = textBlocks.findIndex(block => block.id === b.id);
      return indexA - indexB;
    })
    .map(block => {
      // Remove first 2 characters from titles (the numbering)
      if (block.isTitle) {
        return block.text.substring(2);
      }
      return block.text;
    })
    .join('\n\n');

  const handleSendRequest = async () => {
    if (!apiUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de API",
        variant: "destructive"
      });
      return;
    }

    if (appliedBlocks.length === 0) {
      toast({
        title: "Error",
        description: "No hay elementos aplicados para enviar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResponse('');
    setAudioUrl(null);

    try {
      const result = await sendApiRequest({
        apiUrl,
        apiKey,
        customHeaders,
        requestMethod,
        appliedBlocks,
        appliedContent,
        appliedTitles,
        appliedParagraphs
      });

      if (result.isAudio) {
        setAudioUrl(result.audioUrl);
        toast({
          title: "Audio recibido",
          description: "La API devolvió un archivo de audio MP3"
        });
      }

      setResponse(result.response);

      if (result.status >= 200 && result.status < 300) {
        toast({
          title: "Éxito",
          description: `Petición enviada correctamente. ${appliedBlocks.length} elementos procesados (${appliedTitles.length} títulos, ${appliedParagraphs.length} párrafos).`
        });
      } else {
        toast({
          title: "Advertencia",
          description: `La API respondió con código ${result.status}: ${result.statusText}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      let errorMessage = 'Error desconocido';
      let errorDetails = '';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: La petición tardó más de 5 minutos';
          errorDetails = 'La API no respondió a tiempo. Verifica que la URL sea correcta y que el servidor esté funcionando.';
        } else if (error.message === 'Failed to fetch') {
          errorMessage = 'Error de conexión (CORS/Red)';
          errorDetails = `Posibles causas:
• La API no permite peticiones desde este dominio (Error CORS)
• La URL no es válida o no existe
• El servidor está caído
• Problemas de conectividad

Soluciones sugeridas:
• Verifica que la URL sea correcta
• Asegúrate de que la API permita peticiones CORS desde tu dominio
• Prueba con una API de prueba como httpbin.org/post
• Contacta al administrador de la API para configurar CORS`;
        } else {
          errorMessage = error.message;
          errorDetails = 'Error inesperado durante la petición';
        }
      }

      const errorResponse = `ERROR: ${errorMessage}\n\nDetalles:\n${errorDetails}\n\nURL intentada: ${apiUrl}\nMétodo: ${requestMethod}`;
      setResponse(errorResponse);
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copiado",
          description: "Respuesta copiada al portapapeles"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="shadow-lg border bg-card text-card-foreground backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold">API Request Panel</h2>
              {appliedBlocks.length > 0 && (
                <div className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  {appliedBlocks.length} elementos listos
                  {appliedTitles.length > 0 && ` (${appliedTitles.length} títulos)`}
                </div>
              )}
            </div>
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
            <ApiConfigForm
              apiUrl={apiUrl}
              setApiUrl={setApiUrl}
              apiKey={apiKey}
              setApiKey={setApiKey}
              customHeaders={customHeaders}
              setCustomHeaders={setCustomHeaders}
              requestMethod={requestMethod}
              setRequestMethod={setRequestMethod}
            />

            {/* Content Preview */}
            {appliedBlocks.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Contenido a enviar:</Label>
                <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-2">
                    {appliedBlocks.length} elementos • {appliedTitles.length} títulos • {appliedParagraphs.length} párrafos • {appliedContent.length} caracteres
                  </p>
                  <p className="text-sm line-clamp-3">{appliedContent.substring(0, 200)}...</p>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button 
              onClick={handleSendRequest} 
              disabled={isLoading || appliedBlocks.length === 0}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar a API ({requestMethod})
                </>
              )}
            </Button>

            {/* Audio Player */}
            {audioUrl && (
              <AudioPlayer
                audioUrl={audioUrl}
                filename={generateAudioFilename(appliedBlocks, textBlocks, selectedLanguage)}
              />
            )}

            {/* Response */}
            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Respuesta:</Label>
                  <Button
                    onClick={copyResponse}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
                <Textarea
                  value={response}
                  readOnly
                  className="h-40 font-mono text-sm bg-muted"
                />
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
              <p className="mb-1"><strong>Cómo usar:</strong></p>
              <p>1. Selecciona títulos y párrafos, luego presiona "Aplicar" para marcarlos</p>
              <p>2. Configura la URL de tu API y headers si es necesario</p>
              <p>3. Los elementos aplicados (títulos y párrafos) se enviarán automáticamente en formato JSON</p>
              <p>4. Si la API devuelve un archivo MP3, aparecerá un reproductor de audio</p>
              <p className="mt-2 text-amber-600 dark:text-amber-400"><strong>💡 Tip:</strong> Si hay errores CORS, contacta al administrador de la API</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ApiPanel;
