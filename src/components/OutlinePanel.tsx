
import React from 'react';
import { Hash, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface TextElement {
  id: string;
  text: string;
  isTitle: boolean;
  number?: number;
  titleNumber?: number;
  visible: boolean;
  applied?: boolean;
  appliedColor?: string; // Nueva propiedad para el color asignado
}

interface OutlinePanelProps {
  textBlocks: TextElement[];
  onScrollToBlock: (blockId: string) => void;
  collapsedTitles: Set<string>;
  selectedParagraphs: Set<string>;
  onToggleParagraphSelection: (paragraphId: string) => void;
}

// Array de colores para las aplicaciones
const APPLIED_COLORS = [
  { bg: 'bg-green-50', ring: 'ring-green-300', text: 'text-green-700', icon: 'text-green-600' },
  { bg: 'bg-blue-50', ring: 'ring-blue-300', text: 'text-blue-700', icon: 'text-blue-600' },
  { bg: 'bg-purple-50', ring: 'ring-purple-300', text: 'text-purple-700', icon: 'text-purple-600' },
  { bg: 'bg-orange-50', ring: 'ring-orange-300', text: 'text-orange-700', icon: 'text-orange-600' },
  { bg: 'bg-pink-50', ring: 'ring-pink-300', text: 'text-pink-700', icon: 'text-pink-600' },
  { bg: 'bg-indigo-50', ring: 'ring-indigo-300', text: 'text-indigo-700', icon: 'text-indigo-600' },
  { bg: 'bg-red-50', ring: 'ring-red-300', text: 'text-red-700', icon: 'text-red-600' },
  { bg: 'bg-yellow-50', ring: 'ring-yellow-300', text: 'text-yellow-700', icon: 'text-yellow-600' },
  { bg: 'bg-teal-50', ring: 'ring-teal-300', text: 'text-teal-700', icon: 'text-teal-600' },
  { bg: 'bg-cyan-50', ring: 'ring-cyan-300', text: 'text-cyan-700', icon: 'text-cyan-600' }
];

const OutlinePanel: React.FC<OutlinePanelProps> = ({ 
  textBlocks, 
  onScrollToBlock, 
  collapsedTitles,
  selectedParagraphs,
  onToggleParagraphSelection
}) => {
  // Función para obtener el color de un párrafo aplicado
  const getAppliedColor = (paragraph: TextElement) => {
    if (!paragraph.applied || !paragraph.appliedColor) {
      return APPLIED_COLORS[0]; // Color por defecto
    }
    
    const colorIndex = parseInt(paragraph.appliedColor);
    return APPLIED_COLORS[colorIndex] || APPLIED_COLORS[0];
  };

  const getAssociatedParagraphs = (titleIndex: number) => {
    const paragraphs = [];
    for (let i = titleIndex + 1; i < textBlocks.length; i++) {
      if (textBlocks[i].isTitle) break;
      paragraphs.push(textBlocks[i]);
    }
    return paragraphs;
  };

  const renderOutlineItems = () => {
    const items = [];
    let currentTitleIndex = -1;

    textBlocks.forEach((block, index) => {
      if (block.isTitle) {
        currentTitleIndex = index;
        const isCollapsed = collapsedTitles.has(block.id);
        const associatedParagraphs = getAssociatedParagraphs(index);
        
        items.push(
          <div key={block.id} className="mb-2">
            {/* Title Item */}
            <div
              className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-100 cursor-pointer transition-colors"
              onClick={() => onScrollToBlock(block.id)}
            >
              <div className="flex items-center gap-1 flex-shrink-0">
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-amber-600" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-amber-600" />
                )}
                <Hash className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-semibold text-sm text-amber-800 truncate">
                  Título {block.titleNumber}
                </div>
                <div className="text-xs text-amber-600 truncate">
                  {block.text.slice(0, 40)}{block.text.length > 40 ? '...' : ''}
                </div>
              </div>
            </div>

            {/* Associated Paragraphs (only show if not collapsed) */}
            {!isCollapsed && associatedParagraphs.map((paragraph) => {
              const appliedColor = getAppliedColor(paragraph);
              return (
                <div
                  key={paragraph.id}
                  className={`ml-6 flex items-center gap-2 p-1 rounded-md hover:bg-blue-50 cursor-pointer transition-colors ${
                    selectedParagraphs.has(paragraph.id) ? 'bg-blue-100 ring-1 ring-blue-300' : ''
                  } ${
                    paragraph.applied ? `${appliedColor.bg} ring-1 ${appliedColor.ring}` : ''
                  }`}
                  onClick={() => onScrollToBlock(paragraph.id)}
                >
                  <Checkbox 
                    className="flex-shrink-0" 
                    checked={selectedParagraphs.has(paragraph.id)}
                    onCheckedChange={(checked) => {
                      onToggleParagraphSelection(paragraph.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <FileText className={`w-3 h-3 flex-shrink-0 ${paragraph.applied ? appliedColor.icon : 'text-blue-600'}`} />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className={`text-xs truncate ${paragraph.applied ? appliedColor.text : 'text-blue-700'}`}>
                      Párrafo {paragraph.number} ({paragraph.text.length} caracteres)
                      {paragraph.applied && <span className="ml-1">✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      } else if (currentTitleIndex === -1) {
        // Standalone paragraph (not under any title)
        const appliedColor = getAppliedColor(block);
        items.push(
          <div
            key={block.id}
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors mb-1 ${
              selectedParagraphs.has(block.id) ? 'bg-blue-100 ring-1 ring-blue-300' : ''
            } ${
              block.applied ? `${appliedColor.bg} ring-1 ${appliedColor.ring}` : ''
            }`}
            onClick={() => onScrollToBlock(block.id)}
          >
            <Checkbox 
              className="flex-shrink-0" 
              checked={selectedParagraphs.has(block.id)}
              onCheckedChange={(checked) => {
                onToggleParagraphSelection(block.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <FileText className={`w-4 h-4 flex-shrink-0 ${block.applied ? appliedColor.icon : 'text-blue-600'}`} />
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className={`text-sm truncate ${block.applied ? appliedColor.text : 'text-blue-700'}`}>
                Párrafo {block.number}
                {block.applied && <span className="ml-1">✓</span>}
              </div>
              <div className="text-xs text-blue-500 truncate">
                {block.text.length} caracteres
              </div>
            </div>
          </div>
        );
      }
    });

    return items;
  };

  return (
    <Card className="h-full flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 pb-2 flex-shrink-0">
        <Hash className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-800">Vista General</h2>
        {selectedParagraphs.size > 0 && (
          <div className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {selectedParagraphs.size} seleccionados
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {textBlocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin contenido</p>
              </div>
            ) : (
              renderOutlineItems()
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OutlinePanel;
