
# Text Block Editor - Python Version

Una versión completa en Python del Text Block Editor usando tkinter.

## Instalación

1. Asegúrate de tener Python 3.6+ instalado
2. Instala las dependencias:
```bash
pip install -r requirements.txt
```

## Uso

Ejecuta la aplicación:
```bash
python text_block_editor.py
```

## Funcionalidades

### Funcionalidades Principales
- ✅ Análisis automático de títulos y párrafos
- ✅ Editor de texto con detección de títulos mejorada
- ✅ Panel de vista general con selección múltiple
- ✅ Colapso/expansión de secciones
- ✅ Marcado visual de párrafos aplicados
- ✅ Estadísticas en tiempo real
- ✅ Copia al portapapeles
- ✅ Guardado y carga de archivos

### Controles de Interfaz
- **Doble-clic**: Editar bloque de texto
- **Click derecho**: Menú contextual con opciones
- **Click simple en outline**: Seleccionar/deseleccionar párrafo
- **Doble-clic en outline**: Navegar al bloque

### Operaciones de Archivo
- **Abrir Archivo**: Cargar archivo de texto y parsear automáticamente
- **Guardar Archivo**: Exportar todos los bloques a archivo de texto
- **Pegar**: Pegar texto desde el portapapeles
- **Limpiar**: Borrar contenido

### Gestión de Bloques
- **Crear Párrafos**: Analizar texto y crear bloques automáticamente
- **Editar**: Modificar el contenido de cualquier bloque
- **Eliminar**: Borrar bloques seleccionados
- **Agregar Vacío**: Añadir párrafo en blanco

### Funciones de Vista
- **Expandir Todo**: Mostrar todos los párrafos
- **Colapsar Todo**: Ocultar párrafos bajo títulos
- **Aplicar Seleccionados**: Copiar párrafos seleccionados y marcarlos como aplicados

## Características Técnicas

### Detección de Títulos
La aplicación usa la misma lógica avanzada que la versión React:
- Líneas que comienzan con números
- Separación con líneas vacías antes y/o después
- Detección contextual mejorada

### Gestión de Estado
- Mantiene estado de colapso por título
- Tracking de párrafos seleccionados
- Marcado de párrafos aplicados
- Numeración automática

### Interfaz
- Panel izquierdo: Texto original y bloques editables
- Panel derecho: Vista general y selección
- Estadísticas en tiempo real
- Colores para estado visual (aplicado, seleccionado)

## Diferencias con la Versión React

### Limitaciones de tkinter
- No hay animaciones suaves
- Estilos más básicos (sin gradientes complejos)
- Menos componentes UI avanzados

### Adaptaciones Realizadas
- TreeView para mostrar jerarquía de bloques
- Diálogos modales para edición
- Menús contextuales para operaciones
- Etiquetas de color para estados visuales

### Funcionalidades Mantenidas
- ✅ Toda la lógica de negocio
- ✅ Detección de títulos idéntica
- ✅ Selección múltiple
- ✅ Operaciones de archivo
- ✅ Estadísticas completas
- ✅ Manejo del portapapeles
