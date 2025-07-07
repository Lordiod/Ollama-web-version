import customtkinter as ctk
from supabase import create_client, Client
import threading

# Fill these with your Supabase project details
SUPABASE_URL = "https://kncolxdswqhznaljmyup.supabase.co"  # e.g. "https://xyzcompany.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY29seGRzd3Foem5hbGpteXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDEzOTYsImV4cCI6MjA2NzQ3NzM5Nn0._z6Dryqzvh8x590vmEHcIZO8JLzlspwj7FjuvrNJRkA"  # e.g. "eyJhbGciOiJI..."

class LoginWindow:
    def __init__(self, on_success_callback):
        self.on_success_callback = on_success_callback
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.root = ctk.CTk()
        self.root.title("Login - Ollama AI Assistant")
        self.root.geometry("400x300")
        self.root.minsize(300, 250)
        self.setup_ui()

    def setup_ui(self):
        frame = ctk.CTkFrame(self.root)
        frame.pack(expand=True, fill="both", padx=20, pady=20)

        title = ctk.CTkLabel(frame, text="Login", font=ctk.CTkFont(size=20, weight="bold"))
        title.pack(pady=(10, 20))

        self.email_entry = ctk.CTkEntry(frame, placeholder_text="Email")
        self.email_entry.pack(fill="x", pady=5)
        self.password_entry = ctk.CTkEntry(frame, placeholder_text="Password", show="*")
        self.password_entry.pack(fill="x", pady=5)

        self.status_label = ctk.CTkLabel(frame, text="", font=ctk.CTkFont(size=12), text_color="red")
        self.status_label.pack(pady=5)

        login_btn = ctk.CTkButton(frame, text="Login", command=self.login)
        login_btn.pack(pady=10)

        signup_btn = ctk.CTkButton(frame, text="Don't have an account? Sign Up", fg_color="gray", hover_color="dark gray", command=self.open_signup)
        signup_btn.pack(pady=(0, 5))

    def open_signup(self):
        self.root.destroy()
        from signup_window import SignupWindow
        SignupWindow(self.on_success_callback).run()

    def login(self):
        email = self.email_entry.get().strip()
        password = self.password_entry.get().strip()
        if not email or not password:
            self.status_label.configure(text="Please enter email and password.")
            return
        self.status_label.configure(text="Logging in...")
        threading.Thread(target=self._login_thread, args=(email, password), daemon=True).start()

    def _login_thread(self, email, password):
        try:
            res = self.supabase.auth.sign_in_with_password({"email": email, "password": password})
            if res.user:
                self.root.after(0, self._on_login_success)
            else:
                self.root.after(0, lambda: self.status_label.configure(text="Login failed. Check credentials."))
        except Exception as e:
            self.root.after(0, lambda: self.status_label.configure(text=f"Error: {str(e)}"))

    def _on_login_success(self):
        self.status_label.configure(text="Login successful!", text_color="green")
        self.root.after(500, self._close_and_continue)

    def _close_and_continue(self):
        self.root.destroy()
        self.on_success_callback()

    def run(self):
        self.root.mainloop()