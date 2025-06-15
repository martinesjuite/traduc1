import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { ChevronDown, ChevronRight, Trash2, Hash, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

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

interface TextBlockProps {
  id: string;
  text: string;
  isTitle: boolean;
  number?: number;
  titleNumber?: number;
  visible: boolean;
  applied?: boolean;
  appliedColor?: string;
  onApply: (id: string, colorIndex: number) => void;
  onRemove: (id: string) => void;
}

// Array de colores para las aplicaciones con soporte para modo oscuro
const APPLIED_COLORS = [
  { bg: 'bg-green-50 dark:bg-green-900/20', ring: 'ring-green-300 dark:ring-green-700', text: 'text-green-700 dark:text-green-300', icon: 'text-green-600 dark:text-green-400' },
  { bg: 'bg-blue-50 dark:bg-blue-900/20', ring: 'ring-blue-300 dark:ring-blue-700', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-600 dark:text-blue-400' },
  { bg: 'bg-purple-50 dark:bg-purple-900/20', ring: 'ring-purple-300 dark:ring-purple-700', text: 'text-purple-700 dark:text-purple-300', icon: 'text-purple-600 dark:text-purple-400' },
  { bg: 'bg-orange-50 dark:bg-orange-900/20', ring: 'ring-orange-300 dark:ring-orange-700', text: 'text-orange-700 dark:text-orange-300', icon: 'text-orange-600 dark:text-orange-400' },
  { bg: 'bg-pink-50 dark:bg-pink-900/20', ring: 'ring-pink-300 dark:ring-pink-700', text: 'text-pink-700 dark:text-pink-300', icon: 'text-pink-600 dark:text-pink-400' },
];

const TextBlock = forwardRef<HTMLDivElement, TextBlockProps>(({
  id,
  text,
  isTitle,
  number,
  titleNumber,
  visible,
  applied,
  appliedColor,
  onApply,
  onRemove
}, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localText, setLocalText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalText(text);
  }, [text]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [localText]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.max(60, Math.min(textarea.scrollHeight + 4, 200));
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalText(newText);
  };

  const handleToggleCollapse = () => {
    if (isTitle) {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleApply = () => {
    const colorIndex = Math.floor(Math.random() * APPLIED_COLORS.length);
    onApply(id, colorIndex);
  };

  const handleRemove = () => {
    onRemove(id);
  };

  const getWordCount = () => {
    return localText.trim() ? localText.trim().split(/\s+/).length : 0;
  };

  const getCharCount = () => {
    return localText.length;
  };

  const getAppliedColor = () => {
    if (!applied || !appliedColor) {
      return APPLIED_COLORS[0];
    }
    
    const colorIndex = parseInt(appliedColor);
    return APPLIED_COLORS[colorIndex] || APPLIED_COLORS[0];
  };

  const appliedColorScheme = getAppliedColor();

  return (
    <Card 
      ref={ref}
      className={`transition-all duration-200 hover:shadow-md bg-card text-card-foreground ${
        isTitle 
          ? 'border-l-4 border-l-amber-400 dark:border-l-amber-500' 
          : 'border-l-4 border-l-blue-400 dark:border-l-blue-500'
      } ${
        applied ? `${appliedColorScheme.bg} ring-2 ${appliedColorScheme.ring}` : ''
      }`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between p-3 rounded-t-lg border-b ${
        isTitle 
          ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' 
          : 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      } ${
        applied ? appliedColorScheme.bg : ''
      }`}>
        <div className="flex items-center gap-2">
          {isTitle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleCollapse}
              className="p-1 h-auto hover:bg-background/50"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Hash className={`w-4 h-4 ${
              applied ? appliedColorScheme.icon : 
              isTitle ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'
            }`} />
            <span className={`font-medium ${
              applied ? appliedColorScheme.text :
              isTitle ? 'text-amber-800 dark:text-amber-300' : 'text-blue-800 dark:text-blue-300'
            }`}>
              {isTitle ? `Título ${titleNumber}` : `Párrafo ${number}`}
              {applied && <Check className="w-4 h-4 inline ml-1" />}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {applied ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 p-1 h-auto"
            >
              Quitar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApply}
              className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 p-1 h-auto"
            >
              Aplicar
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={localText}
            onChange={handleTextChange}
            placeholder={isTitle ? "Ingresa el texto del título..." : "Ingresa el texto del párrafo..."}
            className={`min-h-[60px] resize-none ${
              isTitle 
                ? 'font-semibold text-lg bg-amber-50/50 dark:bg-amber-900/10' 
                : 'bg-blue-50/50 dark:bg-blue-900/10'
            } ${
              applied ? appliedColorScheme.bg : ''
            }`}
            style={{ height: 'auto' }}
          />

          {/* Statistics */}
          <div className={`mt-3 text-sm ${
            applied ? appliedColorScheme.text :
            isTitle 
              ? 'text-amber-700 dark:text-amber-400' 
              : 'text-blue-700 dark:text-blue-400'
          }`}>
            <span>Palabras: {getWordCount()} | Caracteres: {getCharCount()}</span>
          </div>
        </div>
      )}
    </Card>
  );
});

TextBlock.displayName = 'TextBlock';

export default TextBlock;