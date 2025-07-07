import customtkinter as ctk
import requests
import threading
import json
from datetime import datetime
from login_window import LoginWindow
from signup_window import SignupWindow

class ChatBotApp:
    def __init__(self):
        self.chat_history = []
        self.setup_ui()
        
    def setup_ui(self):
        # Initialize app
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("blue")

        self.app = ctk.CTk()
        self.app.title("Ollama AI Assistant")
        self.app.geometry("900x700")
        self.app.minsize(600, 500)
        
        # Configure grid weights
        self.app.grid_columnconfigure(0, weight=1)
        self.app.grid_rowconfigure(1, weight=1)
        
        self.create_header()
        self.create_main_content()
        self.create_footer()
        
    def create_header(self):
        # Header frame
        header_frame = ctk.CTkFrame(self.app, height=60)
        header_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=(10, 0))
        header_frame.grid_columnconfigure(1, weight=1)
        
        # Title and status
        title_label = ctk.CTkLabel(header_frame, text="🤖 Ollama AI Assistant", 
                                  font=ctk.CTkFont(size=20, weight="bold"))
        title_label.grid(row=0, column=0, padx=20, pady=15, sticky="w")
        
        self.status_label = ctk.CTkLabel(header_frame, text="● Ready", 
                                        font=ctk.CTkFont(size=12), 
                                        text_color="green")
        self.status_label.grid(row=0, column=1, padx=20, pady=15, sticky="e")
        
    def create_main_content(self):
        # Main content frame
        main_frame = ctk.CTkFrame(self.app)
        main_frame.grid(row=1, column=0, sticky="nsew", padx=10, pady=10)
        main_frame.grid_columnconfigure(0, weight=1)
        main_frame.grid_rowconfigure(0, weight=1)
        
        # Chat display area with scrollable frame
        self.chat_display = ctk.CTkScrollableFrame(main_frame, label_text="Conversation")
        self.chat_display.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        self.chat_display.grid_columnconfigure(0, weight=1)
        
        # Welcome message
        self.add_message("assistant", "Welcome! I'm your AI assistant powered by Ollama. How can I help you today?")
        
    def create_footer(self):
        # Footer frame for input
        footer_frame = ctk.CTkFrame(self.app, height=120)
        footer_frame.grid(row=2, column=0, sticky="ew", padx=10, pady=(0, 10))
        footer_frame.grid_columnconfigure(0, weight=1)
        
        # Input frame
        input_frame = ctk.CTkFrame(footer_frame)
        input_frame.grid(row=0, column=0, sticky="ew", padx=10, pady=10)
        input_frame.grid_columnconfigure(0, weight=1)
        
        # Prompt entry with better styling
        self.prompt_entry = ctk.CTkTextbox(input_frame, height=60, wrap="word")
        self.prompt_entry.grid(row=0, column=0, sticky="ew", padx=(10, 5), pady=10)
        self.prompt_entry.bind("<KeyPress>", self.on_key_press)
        
        # Button frame
        button_frame = ctk.CTkFrame(input_frame, fg_color="transparent")
        button_frame.grid(row=0, column=1, padx=(5, 10), pady=10, sticky="ns")
        
        # Generate button with better styling
        self.generate_button = ctk.CTkButton(button_frame, text="Send", 
                                           command=self.generate_text,
                                           width=80, height=60,
                                           font=ctk.CTkFont(size=14, weight="bold"))
        self.generate_button.pack(pady=(0, 5))
        
        # Clear button
        self.clear_button = ctk.CTkButton(button_frame, text="Clear", 
                                         command=self.clear_chat,
                                         width=80, height=25,
                                         fg_color="gray",
                                         hover_color="dark gray")
        self.clear_button.pack()
        
    def on_key_press(self, event):
        # Send message on Ctrl+Enter
        if event.keysym == "Return" and event.state & 0x4:  # Ctrl+Enter
            self.generate_text()
            return "break"
            
    def add_message(self, role, content):
        # Create message frame
        message_frame = ctk.CTkFrame(self.chat_display)
        message_frame.grid(row=len(self.chat_history), column=0, sticky="ew", padx=5, pady=5)
        message_frame.grid_columnconfigure(1, weight=1)
        
        # Role indicator
        role_color = "#2196F3" if role == "user" else "#4CAF50"
        role_text = "You" if role == "user" else "AI Assistant"
        
        role_label = ctk.CTkLabel(message_frame, text=role_text, 
                                 font=ctk.CTkFont(size=12, weight="bold"),
                                 text_color=role_color)
        role_label.grid(row=0, column=0, padx=10, pady=(10, 5), sticky="w")
          # Timestamp
        timestamp = datetime.now().strftime("%H:%M")
        time_label = ctk.CTkLabel(message_frame, text=timestamp, 
                                 font=ctk.CTkFont(size=10),
                                 text_color="gray")
        time_label.grid(row=0, column=1, padx=10, pady=(10, 5), sticky="e")
          # Message content with compact auto-sizing
        # Simple and accurate height calculation based on line count
        lines = content.split('\n')
        # Count actual lines plus estimate wrapped lines for long lines
        total_lines = 0
        for line in lines:
            if len(line) == 0:
                total_lines += 1  # Empty line
            else:
                # Rough estimate: 100 characters per line (more realistic for chat width)
                estimated_wrapped = max(1, (len(line) + 99) // 100)
                total_lines += estimated_wrapped
        
        # Calculate compact height: 18px per line + minimal padding
        content_height = max(30, total_lines * 18 + 12)  # Minimum 30px, 18px per line + 12px padding
        
        content_textbox = ctk.CTkTextbox(message_frame, height=content_height, wrap="word")
        content_textbox.grid(row=1, column=0, columnspan=2, sticky="ew", padx=10, pady=(0, 10))
        content_textbox.insert("1.0", content)
        content_textbox.configure(state="disabled")
        
        # Store in history
        self.chat_history.append({"role": role, "content": content, "timestamp": timestamp})
        
        # Auto-scroll to bottom
        self.app.after(100, self.scroll_to_bottom)
        
    def scroll_to_bottom(self):
        self.chat_display._parent_canvas.yview_moveto(1.0)
        
    def clear_chat(self):
        # Clear chat history and display
        self.chat_history = []
        for widget in self.chat_display.winfo_children():
            widget.destroy()
        self.add_message("assistant", "Chat cleared. How can I help you?")
        
    def update_status(self, status, color="green"):
        self.status_label.configure(text=f"● {status}", text_color=color)
        
    def generate_text(self):
        prompt = self.prompt_entry.get("1.0", "end-1c").strip()
        if not prompt:
            self.update_status("Please enter a message", "orange")
            return

        # Add user message to chat
        self.add_message("user", prompt)
        
        # Clear input
        self.prompt_entry.delete("1.0", ctk.END)
        
        # Disable button and show loading
        self.generate_button.configure(state="disabled", text="Sending...")
        self.update_status("Generating response...", "orange")
        
        # Run API call in separate thread
        threading.Thread(target=self.api_call, args=(prompt,), daemon=True).start()
        
    def api_call(self, prompt):
        payload = {
            "model": "llama3.2:3b",
            "prompt": prompt,
            "stream": False
        }

        try:
            response = requests.post("http://localhost:11434/api/generate", 
                                   json=payload, timeout=30)
            response.raise_for_status()
            data = response.json()
            result = data.get("response", "No response received.")
            
            # Update UI in main thread
            self.app.after(0, lambda: self.handle_response(result, True))
            
        except requests.exceptions.ConnectionError:
            error_msg = "❌ Connection Error: Unable to connect to Ollama server.\nPlease ensure Ollama is running on localhost:11434"
            self.app.after(0, lambda: self.handle_response(error_msg, False))
        except requests.exceptions.Timeout:
            error_msg = "⏱️ Timeout Error: The request took too long to complete."
            self.app.after(0, lambda: self.handle_response(error_msg, False))
        except Exception as e:
            error_msg = f"❌ Unexpected Error: {str(e)}"
            self.app.after(0, lambda: self.handle_response(error_msg, False))
            
    def handle_response(self, result, success):
        # Add AI response to chat
        self.add_message("assistant", result)
        
        # Re-enable button and update status
        self.generate_button.configure(state="normal", text="Send")
        if success:
            self.update_status("Ready", "green")
        else:
            self.update_status("Error occurred", "red")
            
    def run(self):
        self.app.mainloop()

# Create and run the application
def start_main_app():
    app = ChatBotApp()
    app.run()

def after_signup():
    login = LoginWindow(start_main_app)
    login.run()
if __name__ == "__main__":
    signup = SignupWindow(after_signup)
    signup.run()