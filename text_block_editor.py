
import tkinter as tk
from tkinter import ttk, scrolledtext, filedialog, messagebox
import re
import pyperclip
from datetime import datetime

class TextElement:
    def __init__(self, text="", is_title=False, element_id=None, visible=True, applied=False):
        self.id = element_id or f"block-{datetime.now().timestamp()}-{id(self)}"
        self.text = text
        self.is_title = is_title
        self.number = None
        self.title_number = None
        self.visible = visible
        self.applied = applied

class TextBlockEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Text Block Editor - Python Version")
        self.root.geometry("1400x900")
        self.root.configure(bg="#f8fafc")
        
        # Data
        self.original_text = ""
        self.text_blocks = []
        self.collapsed_titles = set()
        self.selected_paragraphs = set()
        
        # Create main interface
        self.setup_ui()
        
    def setup_ui(self):
        # Main container
        main_frame = ttk.Frame(self.root)
        main_frame.pack(fill="both", expand=True, padx=20, pady=20)
        
        # Header
        header_frame = ttk.Frame(main_frame)
        header_frame.pack(fill="x", pady=(0, 20))
        
        title_label = ttk.Label(header_frame, text="📄 Text Block Editor", 
                               font=("Arial", 24, "bold"))
        title_label.pack()
        
        subtitle_label = ttk.Label(header_frame, text="Advanced paragraph and title management system")
        subtitle_label.pack()
        
        # Control buttons frame
        controls_frame = ttk.Frame(main_frame)
        controls_frame.pack(fill="x", pady=(0, 20))
        
        # File operations
        file_frame = ttk.Frame(controls_frame)
        file_frame.pack(side="left", padx=(0, 10))
        
        ttk.Button(file_frame, text="📁 Open File", command=self.open_file).pack(side="left", padx=(0, 5))
        ttk.Button(file_frame, text="💾 Save File", command=self.save_file).pack(side="left", padx=(0, 5))
        
        # View operations
        view_frame = ttk.Frame(controls_frame)
        view_frame.pack(side="left", padx=(0, 10))
        
        ttk.Button(view_frame, text="👁 Expand All", command=self.expand_all).pack(side="left", padx=(0, 5))
        ttk.Button(view_frame, text="👁‍🗨 Collapse All", command=self.collapse_all).pack(side="left", padx=(0, 5))
        
        # Clear operations
        clear_frame = ttk.Frame(controls_frame)
        clear_frame.pack(side="left", padx=(0, 10))
        
        ttk.Button(clear_frame, text="🗑 Clear All", command=self.clear_all).pack(side="left", padx=(0, 5))
        
        # Selection info
        self.selection_label = ttk.Label(controls_frame, text="")
        self.selection_label.pack(side="right")
        
        # Main content area - two panels
        content_frame = ttk.Frame(main_frame)
        content_frame.pack(fill="both", expand=True)
        
        # Left panel - Main content
        left_frame = ttk.Frame(content_frame)
        left_frame.pack(side="left", fill="both", expand=True, padx=(0, 10))
        
        # Original text section
        original_frame = ttk.LabelFrame(left_frame, text="Original Text", padding=10)
        original_frame.pack(fill="x", pady=(0, 10))
        
        self.original_text_widget = scrolledtext.ScrolledText(original_frame, height=8, wrap="word")
        self.original_text_widget.pack(fill="x")
        
        # Original text controls
        original_controls = ttk.Frame(original_frame)
        original_controls.pack(fill="x", pady=(10, 0))
        
        ttk.Button(original_controls, text="📝 Create Paragraphs", 
                  command=self.create_paragraphs).pack(side="left", padx=(0, 5))
        ttk.Button(original_controls, text="📋 Paste", 
                  command=self.paste_text).pack(side="left", padx=(0, 5))
        ttk.Button(original_controls, text="🗑 Clear", 
                  command=self.clear_original_text).pack(side="left", padx=(0, 5))
        ttk.Button(original_controls, text="➕ Add Empty", 
                  command=self.add_empty_paragraph).pack(side="left", padx=(0, 5))
        
        # Text blocks section
        blocks_frame = ttk.LabelFrame(left_frame, text="Editable Blocks", padding=10)
        blocks_frame.pack(fill="both", expand=True)
        
        # Create treeview for blocks
        self.blocks_tree = ttk.Treeview(blocks_frame, columns=("type", "text", "chars"), show="tree headings")
        self.blocks_tree.heading("#0", text="Block")
        self.blocks_tree.heading("type", text="Type")
        self.blocks_tree.heading("text", text="Text Preview")
        self.blocks_tree.heading("chars", text="Characters")
        
        self.blocks_tree.column("#0", width=80)
        self.blocks_tree.column("type", width=80)
        self.blocks_tree.column("text", width=300)
        self.blocks_tree.column("chars", width=80)
        
        # Scrollbar for treeview
        tree_scrollbar = ttk.Scrollbar(blocks_frame, orient="vertical", command=self.blocks_tree.yview)
        self.blocks_tree.configure(yscrollcommand=tree_scrollbar.set)
        
        self.blocks_tree.pack(side="left", fill="both", expand=True)
        tree_scrollbar.pack(side="right", fill="y")
        
        # Bind double-click to edit
        self.blocks_tree.bind("<Double-1>", self.edit_block)
        self.blocks_tree.bind("<Button-3>", self.show_context_menu)
        
        # Statistics frame
        stats_frame = ttk.LabelFrame(left_frame, text="Statistics", padding=10)
        stats_frame.pack(fill="x", pady=(10, 0))
        
        self.stats_label = ttk.Label(stats_frame, text="No blocks created yet")
        self.stats_label.pack()
        
        # Right panel - Outline
        right_frame = ttk.LabelFrame(content_frame, text="📋 Vista General", padding=10)
        right_frame.pack(side="right", fill="y", width=300)
        
        # Selection controls
        selection_frame = ttk.Frame(right_frame)
        selection_frame.pack(fill="x", pady=(0, 10))
        
        ttk.Button(selection_frame, text="✅ Apply Selected", 
                  command=self.apply_selected).pack(side="left", padx=(0, 5))
        ttk.Button(selection_frame, text="❌ Clear Selection", 
                  command=self.clear_selection).pack(side="left")
        
        # Outline tree
        self.outline_tree = ttk.Treeview(right_frame, show="tree")
        outline_scrollbar = ttk.Scrollbar(right_frame, orient="vertical", command=self.outline_tree.yview)
        self.outline_tree.configure(yscrollcommand=outline_scrollbar.set)
        
        self.outline_tree.pack(side="left", fill="both", expand=True)
        outline_scrollbar.pack(side="right", fill="y")
        
        # Bind selection events
        self.outline_tree.bind("<Button-1>", self.toggle_paragraph_selection)
        self.outline_tree.bind("<Double-1>", self.scroll_to_block)
        
        # Context menu
        self.create_context_menu()
        
    def create_context_menu(self):
        self.context_menu = tk.Menu(self.root, tearoff=0)
        self.context_menu.add_command(label="Edit", command=self.edit_selected_block)
        self.context_menu.add_command(label="Delete", command=self.delete_selected_block)
        self.context_menu.add_separator()
        self.context_menu.add_command(label="Toggle Collapse", command=self.toggle_selected_collapse)
        
    def show_context_menu(self, event):
        try:
            self.context_menu.post(event.x_root, event.y_root)
        except:
            pass
            
    def is_title(self, line, index, all_lines):
        """Enhanced title detection logic"""
        if not re.match(r'^\d+', line):
            return False
            
        # Check empty lines before
        empty_lines_before = 0
        for j in range(index - 1, -1, -1):
            if all_lines[j].strip() == "":
                empty_lines_before += 1
            else:
                break
                
        # Check empty lines after
        empty_lines_after = 0
        for j in range(index + 1, len(all_lines)):
            if all_lines[j].strip() == "":
                empty_lines_after += 1
            else:
                break
                
        is_start = index == 0
        is_end = index == len(all_lines) - 1
        
        # Title conditions
        if empty_lines_before >= 1 and empty_lines_after >= 1:
            return True
        if is_start and empty_lines_after >= 1:
            return True
        if is_end and empty_lines_before >= 1:
            return True
            
        return False
        
    def analyze_text_with_titles(self, text):
        """Analyze text to identify titles and paragraphs"""
        lines = text.split('\n')
        elements = []
        i = 0
        
        while i < len(lines):
            current_line = lines[i].strip()
            
            if not current_line:
                i += 1
                continue
                
            is_title_line = self.is_title(current_line, i, lines)
            elements.append(TextElement(
                text=current_line,
                is_title=is_title_line,
                element_id=f"block-{datetime.now().timestamp()}-{i}"
            ))
            i += 1
            
        return elements
        
    def update_numbering(self, blocks):
        """Update numbering for all blocks"""
        paragraph_number = 1
        title_number = 1
        
        for block in blocks:
            if block.is_title:
                block.title_number = title_number
                title_number += 1
                block.number = None
            else:
                block.number = paragraph_number
                paragraph_number += 1
                block.title_number = None
                
        return blocks
        
    def create_paragraphs(self):
        """Create paragraphs from original text"""
        text = self.original_text_widget.get("1.0", "end-1c")
        if not text.strip():
            messagebox.showwarning("Warning", "No text to convert into paragraphs")
            return
            
        elements = self.analyze_text_with_titles(text)
        self.text_blocks = self.update_numbering(elements)
        self.collapsed_titles.clear()
        self.selected_paragraphs.clear()
        
        self.update_blocks_display()
        self.update_outline_display()
        self.update_stats()
        
        titles = sum(1 for el in self.text_blocks if el.is_title)
        paragraphs = len(self.text_blocks) - titles
        
        messagebox.showinfo("Success", f"Created {titles} titles and {paragraphs} paragraphs.")
        
    def update_blocks_display(self):
        """Update the blocks treeview"""
        for item in self.blocks_tree.get_children():
            self.blocks_tree.delete(item)
            
        for block in self.text_blocks:
            if not block.visible:
                continue
                
            block_type = f"Título {block.title_number}" if block.is_title else f"Párrafo {block.number}"
            text_preview = block.text[:50] + "..." if len(block.text) > 50 else block.text
            char_count = str(len(block.text))
            
            # Color coding for applied blocks
            tags = []
            if block.applied:
                tags.append("applied")
            if block.id in self.selected_paragraphs:
                tags.append("selected")
                
            item = self.blocks_tree.insert("", "end", 
                                         values=(block_type, text_preview, char_count),
                                         tags=tags)
            
            # Store block reference
            self.blocks_tree.set(item, "#0", block.id)
            
        # Configure tags
        self.blocks_tree.tag_configure("applied", background="#dcfce7")
        self.blocks_tree.tag_configure("selected", background="#dbeafe")
        
    def update_outline_display(self):
        """Update the outline treeview"""
        for item in self.outline_tree.get_children():
            self.outline_tree.delete(item)
            
        current_title_item = None
        
        for block in self.text_blocks:
            if block.is_title:
                is_collapsed = block.id in self.collapsed_titles
                title_text = f"{'▶' if is_collapsed else '▼'} Título {block.title_number}: {block.text[:30]}..."
                
                tags = ["title"]
                if block.applied:
                    tags.append("applied")
                    
                current_title_item = self.outline_tree.insert("", "end", text=title_text, 
                                                             open=not is_collapsed, tags=tags)
                self.outline_tree.set(current_title_item, "#0", block.id)
                
            else:
                # Paragraph
                para_text = f"Párrafo {block.number} ({len(block.text)} caracteres)"
                if block.applied:
                    para_text += " ✓"
                    
                tags = ["paragraph"]
                if block.applied:
                    tags.append("applied")
                if block.id in self.selected_paragraphs:
                    tags.append("selected")
                    
                if current_title_item and not self.collapsed_titles.intersection({block.id}):
                    item = self.outline_tree.insert(current_title_item, "end", text=para_text, tags=tags)
                else:
                    item = self.outline_tree.insert("", "end", text=para_text, tags=tags)
                    
                self.outline_tree.set(item, "#0", block.id)
                
        # Configure outline tags
        self.outline_tree.tag_configure("applied", foreground="#059669")
        self.outline_tree.tag_configure("selected", background="#dbeafe")
        self.outline_tree.tag_configure("title", font=("Arial", 10, "bold"))
        
    def update_stats(self):
        """Update statistics display"""
        if not self.text_blocks:
            self.stats_label.config(text="No blocks created yet")
            return
            
        total_blocks = len(self.text_blocks)
        titles = sum(1 for block in self.text_blocks if block.is_title)
        paragraphs = total_blocks - titles
        total_chars = sum(len(block.text) for block in self.text_blocks)
        applied_count = sum(1 for block in self.text_blocks if block.applied)
        
        stats_text = f"Blocks: {total_blocks} | Titles: {titles} | Paragraphs: {paragraphs} | "
        stats_text += f"Characters: {total_chars} | Applied: {applied_count}"
        
        self.stats_label.config(text=stats_text)
        
        # Update selection info
        if self.selected_paragraphs:
            selected_chars = sum(len(block.text) for block in self.text_blocks 
                               if block.id in self.selected_paragraphs)
            selection_text = f"Selected: {len(self.selected_paragraphs)} paragraphs ({selected_chars} chars)"
            self.selection_label.config(text=selection_text)
        else:
            self.selection_label.config(text="")
            
    def toggle_paragraph_selection(self, event):
        """Toggle paragraph selection in outline"""
        item = self.outline_tree.selection()[0] if self.outline_tree.selection() else None
        if not item:
            return
            
        block_id = self.outline_tree.set(item, "#0")
        block = next((b for b in self.text_blocks if b.id == block_id), None)
        
        if block and not block.is_title:
            if block_id in self.selected_paragraphs:
                self.selected_paragraphs.remove(block_id)
            else:
                self.selected_paragraphs.add(block_id)
                
            self.update_outline_display()
            self.update_blocks_display()
            self.update_stats()
            
    def scroll_to_block(self, event):
        """Scroll to block in main view"""
        item = self.outline_tree.selection()[0] if self.outline_tree.selection() else None
        if not item:
            return
            
        block_id = self.outline_tree.set(item, "#0")
        
        # Find and select in blocks tree
        for child in self.blocks_tree.get_children():
            if self.blocks_tree.set(child, "#0") == block_id:
                self.blocks_tree.selection_set(child)
                self.blocks_tree.see(child)
                break
                
    def apply_selected(self):
        """Apply selected paragraphs"""
        if not self.selected_paragraphs:
            messagebox.showinfo("Info", "No paragraphs selected")
            return
            
        selected_texts = []
        for block in self.text_blocks:
            if block.id in self.selected_paragraphs:
                selected_texts.append(block.text)
                block.applied = True
                
        combined_text = '\n\n'.join(selected_texts)
        
        try:
            pyperclip.copy(combined_text)
            messagebox.showinfo("Applied", 
                              f"Text from {len(self.selected_paragraphs)} paragraphs copied to clipboard and marked as applied")
        except:
            messagebox.showinfo("Applied", 
                              f"{len(self.selected_paragraphs)} paragraphs marked as applied (clipboard copy failed)")
            
        self.clear_selection()
        
    def clear_selection(self):
        """Clear paragraph selection"""
        self.selected_paragraphs.clear()
        self.update_outline_display()
        self.update_blocks_display()
        self.update_stats()
        
    def edit_block(self, event):
        """Edit selected block"""
        selection = self.blocks_tree.selection()
        if not selection:
            return
            
        item = selection[0]
        block_id = self.blocks_tree.set(item, "#0")
        block = next((b for b in self.text_blocks if b.id == block_id), None)
        
        if block:
            self.open_edit_dialog(block)
            
    def open_edit_dialog(self, block):
        """Open edit dialog for block"""
        dialog = tk.Toplevel(self.root)
        dialog.title(f"Edit {'Title' if block.is_title else 'Paragraph'}")
        dialog.geometry("500x300")
        dialog.transient(self.root)
        dialog.grab_set()
        
        # Text editor
        text_frame = ttk.Frame(dialog)
        text_frame.pack(fill="both", expand=True, padx=10, pady=10)
        
        text_widget = scrolledtext.ScrolledText(text_frame, wrap="word")
        text_widget.pack(fill="both", expand=True)
        text_widget.insert("1.0", block.text)
        
        # Buttons
        button_frame = ttk.Frame(dialog)
        button_frame.pack(fill="x", padx=10, pady=(0, 10))
        
        def save_changes():
            new_text = text_widget.get("1.0", "end-1c")
            block.text = new_text
            block.applied = False  # Reset applied status when text changes
            self.update_blocks_display()
            self.update_outline_display()
            self.update_stats()
            dialog.destroy()
            
        def cancel_changes():
            dialog.destroy()
            
        ttk.Button(button_frame, text="Save", command=save_changes).pack(side="right", padx=(5, 0))
        ttk.Button(button_frame, text="Cancel", command=cancel_changes).pack(side="right")
        
    def edit_selected_block(self):
        """Edit currently selected block"""
        selection = self.blocks_tree.selection()
        if not selection:
            return
        self.edit_block(None)
        
    def delete_selected_block(self):
        """Delete currently selected block"""
        selection = self.blocks_tree.selection()
        if not selection:
            return
            
        item = selection[0]
        block_id = self.blocks_tree.set(item, "#0")
        
        if messagebox.askyesno("Confirm Delete", "Are you sure you want to delete this block?"):
            self.text_blocks = [b for b in self.text_blocks if b.id != block_id]
            self.text_blocks = self.update_numbering(self.text_blocks)
            
            # Clean up references
            self.collapsed_titles.discard(block_id)
            self.selected_paragraphs.discard(block_id)
            
            self.update_blocks_display()
            self.update_outline_display()
            self.update_stats()
            
    def toggle_selected_collapse(self):
        """Toggle collapse for selected title"""
        selection = self.blocks_tree.selection()
        if not selection:
            return
            
        item = selection[0]
        block_id = self.blocks_tree.set(item, "#0")
        block = next((b for b in self.text_blocks if b.id == block_id), None)
        
        if block and block.is_title:
            if block_id in self.collapsed_titles:
                self.collapsed_titles.remove(block_id)
                self.expand_title_paragraphs(block_id)
            else:
                self.collapsed_titles.add(block_id)
                self.collapse_title_paragraphs(block_id)
                
            self.update_blocks_display()
            self.update_outline_display()
            
    def collapse_title_paragraphs(self, title_id):
        """Collapse paragraphs under a title"""
        title_index = next((i for i, b in enumerate(self.text_blocks) if b.id == title_id), -1)
        if title_index == -1:
            return
            
        for i in range(title_index + 1, len(self.text_blocks)):
            if self.text_blocks[i].is_title:
                break
            self.text_blocks[i].visible = False
            
    def expand_title_paragraphs(self, title_id):
        """Expand paragraphs under a title"""
        title_index = next((i for i, b in enumerate(self.text_blocks) if b.id == title_id), -1)
        if title_index == -1:
            return
            
        for i in range(title_index + 1, len(self.text_blocks)):
            if self.text_blocks[i].is_title:
                break
            self.text_blocks[i].visible = True
            
    def expand_all(self):
        """Expand all titles"""
        self.collapsed_titles.clear()
        for block in self.text_blocks:
            block.visible = True
        self.update_blocks_display()
        self.update_outline_display()
        messagebox.showinfo("Expanded", "All sections expanded")
        
    def collapse_all(self):
        """Collapse all titles"""
        for block in self.text_blocks:
            if block.is_title:
                self.collapsed_titles.add(block.id)
                self.collapse_title_paragraphs(block.id)
                
        self.update_blocks_display()
        self.update_outline_display()
        messagebox.showinfo("Collapsed", "All sections collapsed")
        
    def add_empty_paragraph(self):
        """Add empty paragraph"""
        new_block = TextElement(text="", is_title=False)
        self.text_blocks.append(new_block)
        self.text_blocks = self.update_numbering(self.text_blocks)
        
        self.update_blocks_display()
        self.update_outline_display()
        self.update_stats()
        
    def paste_text(self):
        """Paste text from clipboard"""
        try:
            text = pyperclip.paste()
            self.original_text_widget.delete("1.0", "end")
            self.original_text_widget.insert("1.0", text)
            messagebox.showinfo("Pasted", "Text pasted from clipboard")
        except:
            messagebox.showerror("Error", "Could not paste from clipboard")
            
    def clear_original_text(self):
        """Clear original text"""
        self.original_text_widget.delete("1.0", "end")
        
    def clear_all(self):
        """Clear all content"""
        if messagebox.askyesno("Confirm Clear", "Are you sure you want to clear all content?"):
            self.original_text_widget.delete("1.0", "end")
            self.text_blocks.clear()
            self.collapsed_titles.clear()
            self.selected_paragraphs.clear()
            
            self.update_blocks_display()
            self.update_outline_display()
            self.update_stats()
            
            messagebox.showinfo("Cleared", "All content cleared")
            
    def save_file(self):
        """Save file"""
        if not self.text_blocks:
            messagebox.showwarning("Warning", "No paragraphs to save")
            return
            
        filename = filedialog.asksaveasfilename(
            defaultextension=".txt",
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if filename:
            content = '\n\n'.join(block.text for block in self.text_blocks if block.text.strip())
            
            try:
                with open(filename, 'w', encoding='utf-8') as f:
                    f.write(content)
                messagebox.showinfo("Saved", "File saved successfully")
            except Exception as e:
                messagebox.showerror("Error", f"Could not save file: {str(e)}")
                
    def open_file(self):
        """Open file"""
        filename = filedialog.askopenfilename(
            filetypes=[("Text files", "*.txt"), ("All files", "*.*")]
        )
        
        if filename:
            try:
                with open(filename, 'r', encoding='utf-8') as f:
                    content = f.read()
                    
                self.original_text_widget.delete("1.0", "end")
                self.original_text_widget.insert("1.0", content)
                
                # Auto-create paragraphs
                elements = self.analyze_text_with_titles(content)
                self.text_blocks = self.update_numbering(elements)
                self.collapsed_titles.clear()
                self.selected_paragraphs.clear()
                
                self.update_blocks_display()
                self.update_outline_display()
                self.update_stats()
                
                messagebox.showinfo("Opened", "File opened and parsed successfully")
                
            except Exception as e:
                messagebox.showerror("Error", f"Could not open file: {str(e)}")

def main():
    root = tk.Tk()
    app = TextBlockEditor(root)
    root.mainloop()

if __name__ == "__main__":
    main()
