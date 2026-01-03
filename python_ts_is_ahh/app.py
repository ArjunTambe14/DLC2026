"""
Main application file for Byte-Sized Business Boost
Interactive desktop application for discovering local businesses
"""
import sys
import csv
from datetime import datetime
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from database import Database
from widgets import *


class BusinessBoostApp(QMainWindow):
    """Main application window"""

    def __init__(self):
        super().__init__()
        self.db = Database()
        self.current_user = None
        self.init_ui()
        self.load_businesses()

    def init_ui(self):
        """Initialize the user interface"""
        self.setWindowTitle("Byte-Sized Business Boost")
        self.setGeometry(100, 100, 1200, 800)
        self.setStyleSheet("""
            QMainWindow {
                background-color: #f5f5f5;
            }
            QPushButton {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
            }
            QPushButton:hover {
                background-color: #0056b3;
            }
            QPushButton:disabled {
                background-color: #cccccc;
                color: #666666;
            }
            QLineEdit, QTextEdit, QComboBox {
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: white;
            }
            QLineEdit:focus, QTextEdit:focus {
                border-color: #007bff;
            }
            QLabel {
                color: #333;
            }
            QTabWidget::pane {
                border: 1px solid #ddd;
                background-color: white;
            }
            QTabBar::tab {
                background-color: #e9ecef;
                padding: 10px 20px;
                margin-right: 2px;
            }
            QTabBar::tab:selected {
                background-color: white;
                border-bottom: 2px solid #007bff;
            }
        """)

        # Create central widget and main layout
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        main_layout = QVBoxLayout(central_widget)

        # Create tab widget
        self.tab_widget = QTabWidget()
        main_layout.addWidget(self.tab_widget)

        # Create tabs
        self.create_discover_tab()
        self.create_bookmarks_tab()
        self.create_reviews_tab()
        self.create_statistics_tab()

        # Create status bar
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("Ready")

        # Create menu bar
        self.create_menu_bar()

        # Login dialog
        self.show_login_dialog()

    def create_menu_bar(self):
        """Create the application menu bar"""
        menubar = self.menuBar()

        # File menu
        file_menu = menubar.addMenu('File')

        export_action = QAction('Export Data...', self)
        export_action.triggered.connect(self.export_data)
        file_menu.addAction(export_action)

        file_menu.addSeparator()

        exit_action = QAction('Exit', self)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)

        # Account menu
        account_menu = menubar.addMenu('Account')

        login_action = QAction('Login/Register', self)
        login_action.triggered.connect(self.show_login_dialog)
        account_menu.addAction(login_action)

        logout_action = QAction('Logout', self)
        logout_action.triggered.connect(self.logout)
        account_menu.addAction(logout_action)

        # Help menu
        help_menu = menubar.addMenu('Help')

        about_action = QAction('About', self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)

    def create_discover_tab(self):
        """Create the business discovery tab"""
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # Search and filter bar
        filter_layout = QHBoxLayout()

        # Search box
        self.search_box = QLineEdit()
        self.search_box.setPlaceholderText("Search businesses...")
        self.search_box.textChanged.connect(self.load_businesses)
        filter_layout.addWidget(self.search_box)

        # Category filter
        self.category_combo = QComboBox()
        self.category_combo.addItems(['All Categories', 'Food', 'Retail', 'Services'])
        self.category_combo.currentTextChanged.connect(self.load_businesses)
        filter_layout.addWidget(self.category_combo)

        # Rating filter
        self.rating_combo = QComboBox()
        self.rating_combo.addItems(['All Ratings', '4+ Stars', '3+ Stars', '2+ Stars'])
        self.rating_combo.currentTextChanged.connect(self.load_businesses)
        filter_layout.addWidget(self.rating_combo)

        # Sort by
        self.sort_combo = QComboBox()
        self.sort_combo.addItems(['Sort by Name', 'Sort by Rating', 'Sort by Popularity'])
        self.sort_combo.currentTextChanged.connect(self.load_businesses)
        filter_layout.addWidget(self.sort_combo)

        filter_layout.addStretch()

        # Refresh button
        refresh_btn = QPushButton("Refresh")
        refresh_btn.clicked.connect(self.load_businesses)
        filter_layout.addWidget(refresh_btn)

        layout.addLayout(filter_layout)

        # Business list
        self.business_list = QScrollArea()
        self.business_list.setWidgetResizable(True)
        self.business_list.setWidget(QWidget())
        self.business_list.setStyleSheet("""
            QScrollArea {
                border: 1px solid #ddd;
                border-radius: 4px;
                background-color: white;
            }
        """)

        self.business_list_widget = QVBoxLayout(self.business_list.widget())
        self.business_list_widget.setAlignment(Qt.AlignTop)

        layout.addWidget(self.business_list)

        # Add review button (only shown when user is logged in)
        self.add_review_btn = QPushButton("Add Review")
        self.add_review_btn.clicked.connect(self.show_add_review_dialog)
        self.add_review_btn.setVisible(False)
        layout.addWidget(self.add_review_btn)

        self.tab_widget.addTab(tab, "Discover")

    def create_bookmarks_tab(self):
        """Create the bookmarks tab"""
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # Title
        title = QLabel("Your Bookmarked Businesses")
        title.setStyleSheet("font-size: 18px; font-weight: bold; margin: 10px;")
        layout.addWidget(title)

        # Bookmarks list
        self.bookmarks_list = QScrollArea()
        self.bookmarks_list.setWidgetResizable(True)
        self.bookmarks_list.setWidget(QWidget())

        self.bookmarks_list_widget = QVBoxLayout(self.bookmarks_list.widget())
        self.bookmarks_list_widget.setAlignment(Qt.AlignTop)

        layout.addWidget(self.bookmarks_list)

        # Empty state message
        self.empty_bookmarks_label = QLabel("No bookmarks yet. Discover businesses and click the star to bookmark them!")
        self.empty_bookmarks_label.setAlignment(Qt.AlignCenter)
        self.empty_bookmarks_label.setStyleSheet("color: #666; font-style: italic; padding: 20px;")
        layout.addWidget(self.empty_bookmarks_label)

        self.tab_widget.addTab(tab, "Bookmarks")

    def create_reviews_tab(self):
        """Create the reviews tab"""
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # Title
        title = QLabel("Your Reviews")
        title.setStyleSheet("font-size: 18px; font-weight: bold; margin: 10px;")
        layout.addWidget(title)

        # Reviews list
        self.reviews_list = QScrollArea()
        self.reviews_list.setWidgetResizable(True)
        self.reviews_list.setWidget(QWidget())

        self.reviews_list_widget = QVBoxLayout(self.reviews_list.widget())
        self.reviews_list_widget.setAlignment(Qt.AlignTop)

        layout.addWidget(self.reviews_list)

        # Empty state message
        self.empty_reviews_label = QLabel("No reviews yet. Add your first review from the Discover tab!")
        self.empty_reviews_label.setAlignment(Qt.AlignCenter)
        self.empty_reviews_label.setStyleSheet("color: #666; font-style: italic; padding: 20px;")
        layout.addWidget(self.empty_reviews_label)

        self.tab_widget.addTab(tab, "My Reviews")

    def create_statistics_tab(self):
        """Create the statistics tab"""
        tab = QWidget()
        layout = QVBoxLayout(tab)

        # Title
        title = QLabel("Community Statistics")
        title.setStyleSheet("font-size: 18px; font-weight: bold; margin: 10px;")
        layout.addWidget(title)

        # Statistics widget
        self.stats_widget = QWidget()
        self.stats_layout = QVBoxLayout(self.stats_widget)
        layout.addWidget(self.stats_widget)

        # Refresh button
        refresh_stats_btn = QPushButton("Refresh Statistics")
        refresh_stats_btn.clicked.connect(self.load_statistics)
        layout.addWidget(refresh_stats_btn)

        self.tab_widget.addTab(tab, "Statistics")

    def show_login_dialog(self):
        """Show login/registration dialog"""
        dialog = QDialog(self)
        dialog.setWindowTitle("Login / Register")
        dialog.setFixedSize(300, 300)

        layout = QVBoxLayout()

        # Tab widget for login/register
        tab_widget = QTabWidget()

        # Login tab
        login_tab = QWidget()
        login_layout = QVBoxLayout(login_tab)

        login_layout.addWidget(QLabel("Username:"))
        login_username = QLineEdit()
        login_layout.addWidget(login_username)

        login_layout.addWidget(QLabel("Password:"))
        login_password = QLineEdit()
        login_password.setEchoMode(QLineEdit.Password)
        login_layout.addWidget(login_password)

        login_btn = QPushButton("Login")
        login_btn.clicked.connect(lambda: self.login(
            login_username.text(), login_password.text(), dialog
        ))
        login_layout.addWidget(login_btn)

        # Register tab
        register_tab = QWidget()
        register_layout = QVBoxLayout(register_tab)

        register_layout.addWidget(QLabel("Username:"))
        reg_username = QLineEdit()
        register_layout.addWidget(reg_username)

        register_layout.addWidget(QLabel("Email:"))
        reg_email = QLineEdit()
        register_layout.addWidget(reg_email)

        register_layout.addWidget(QLabel("Password:"))
        reg_password = QLineEdit()
        reg_password.setEchoMode(QLineEdit.Password)
        register_layout.addWidget(reg_password)

        register_layout.addWidget(QLabel("Confirm Password:"))
        reg_confirm = QLineEdit()
        reg_confirm.setEchoMode(QLineEdit.Password)
        register_layout.addWidget(reg_confirm)

        register_btn = QPushButton("Register")
        register_btn.clicked.connect(lambda: self.register(
            reg_username.text(), reg_email.text(),
            reg_password.text(), reg_confirm.text(), dialog
        ))
        register_layout.addWidget(register_btn)

        tab_widget.addTab(login_tab, "Login")
        tab_widget.addTab(register_tab, "Register")

        layout.addWidget(tab_widget)

        # Skip login button (demo mode)
        skip_btn = QPushButton("Continue as Guest")
        skip_btn.clicked.connect(dialog.accept)
        layout.addWidget(skip_btn)

        dialog.setLayout(layout)
        dialog.exec_()

    def login(self, username, password, dialog):
        """Handle user login"""
        if not username or not password:
            QMessageBox.warning(self, "Error", "Please enter username and password")
            return

        # Show CAPTCHA for bot prevention
        if not CAPTCHAWidget.show_captcha(self):
            QMessageBox.warning(self, "Error", "CAPTCHA verification failed")
            return

        user = self.db.authenticate_user(username, password)
        if user:
            self.current_user = user
            self.status_bar.showMessage(f"Logged in as {user['username']}")
            self.add_review_btn.setVisible(True)
            self.load_bookmarks()
            self.load_user_reviews()
            dialog.accept()

            QMessageBox.information(self, "Success", f"Welcome back, {user['username']}!")
        else:
            QMessageBox.warning(self, "Error", "Invalid username or password")

    def register(self, username, email, password, confirm, dialog):
        """Handle user registration"""
        # Input validation
        if not all([username, email, password, confirm]):
            QMessageBox.warning(self, "Error", "All fields are required")
            return

        if password != confirm:
            QMessageBox.warning(self, "Error", "Passwords do not match")
            return

        if len(password) < 6:
            QMessageBox.warning(self, "Error", "Password must be at least 6 characters")
            return

        if '@' not in email or '.' not in email:
            QMessageBox.warning(self, "Error", "Please enter a valid email address")
            return

        # Show CAPTCHA
        if not CAPTCHAWidget.show_captcha(self):
            QMessageBox.warning(self, "Error", "CAPTCHA verification failed")
            return

        user_id = self.db.add_user(username, password, email)
        if user_id:
            QMessageBox.information(self, "Success", "Registration successful! Please log in.")
            dialog.reject()
            self.show_login_dialog()
        else:
            QMessageBox.warning(self, "Error", "Username already exists")

    def logout(self):
        """Handle user logout"""
        self.current_user = None
        self.status_bar.showMessage("Logged out")
        self.add_review_btn.setVisible(False)
        self.load_businesses()
        self.load_bookmarks()
        self.load_user_reviews()

        QMessageBox.information(self, "Logged Out", "You have been logged out successfully.")

    def load_businesses(self):
        """Load and display businesses based on filters"""
        # Clear current list
        while self.business_list_widget.count():
            item = self.business_list_widget.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        # Get filter values
        category = self.category_combo.currentText().lower()
        if category == 'all categories':
            category = None

        rating_text = self.rating_combo.currentText()
        min_rating = 0
        if rating_text == '4+ Stars':
            min_rating = 4
        elif rating_text == '3+ Stars':
            min_rating = 3
        elif rating_text == '2+ Stars':
            min_rating = 2

        search_term = self.search_box.text().strip() or None

        sort_text = self.sort_combo.currentText()
        if sort_text == 'Sort by Rating':
            sort_by = 'rating'
        elif sort_text == 'Sort by Popularity':
            sort_by = 'review_count'
        else:
            sort_by = 'name'

        # Get businesses from database
        businesses = self.db.get_businesses(category, sort_by, search_term, min_rating)

        if not businesses:
            # Show empty state
            empty_label = QLabel("No businesses found. Try adjusting your filters.")
            empty_label.setAlignment(Qt.AlignCenter)
            empty_label.setStyleSheet("color: #666; font-style: italic; padding: 50px;")
            self.business_list_widget.addWidget(empty_label)
            return

        # Display businesses
        for business in businesses:
            # Check if bookmarked
            bookmarked = False
            if self.current_user:
                bookmarks = self.db.get_bookmarks(self.current_user['id'])
                bookmarked = any(b['id'] == business['id'] for b in bookmarks)

            card = BusinessCardWidget(business, bookmarked)

            # Connect bookmark button
            if self.current_user:
                card.bookmark_btn.clicked.connect(
                    lambda checked, b=business: self.toggle_bookmark(b['id'])
                )

            self.business_list_widget.addWidget(card)

        self.business_list_widget.addStretch()

    def load_bookmarks(self):
        """Load and display user's bookmarks"""
        # Clear current list
        while self.bookmarks_list_widget.count():
            item = self.bookmarks_list_widget.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        if not self.current_user:
            self.empty_bookmarks_label.show()
            return

        bookmarks = self.db.get_bookmarks(self.current_user['id'])

        if not bookmarks:
            self.empty_bookmarks_label.show()
            return

        self.empty_bookmarks_label.hide()

        for business in bookmarks:
            card = BusinessCardWidget(business, True)

            # Connect bookmark button
            card.bookmark_btn.clicked.connect(
                lambda checked, b=business: self.toggle_bookmark(b['id'])
            )

            self.bookmarks_list_widget.addWidget(card)

        self.bookmarks_list_widget.addStretch()

    def load_user_reviews(self):
        """Load and display user's reviews"""
        # Clear current list
        while self.reviews_list_widget.count():
            item = self.reviews_list_widget.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        if not self.current_user:
            self.empty_reviews_label.show()
            return

        reviews = self.db.get_user_reviews(self.current_user['id'])

        if not reviews:
            self.empty_reviews_label.show()
            return

        self.empty_reviews_label.hide()

        for review in reviews:
            frame = QFrame()
            frame.setFrameStyle(QFrame.Box | QFrame.Raised)
            frame.setStyleSheet("""
                QFrame {
                    background-color: white;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 5px;
                }
            """)

            layout = QVBoxLayout(frame)

            # Business name
            name_label = QLabel(review['business_name'])
            name_label.setStyleSheet("font-size: 14px; font-weight: bold;")
            layout.addWidget(name_label)

            # Rating
            rating_widget = RatingWidget(rating=review['rating'])
            layout.addWidget(rating_widget)

            # Comment
            if review['comment']:
                comment_label = QLabel(review['comment'])
                comment_label.setWordWrap(True)
                comment_label.setStyleSheet("color: #333; margin-top: 5px;")
                layout.addWidget(comment_label)

            # Date
            date_label = QLabel(f"Reviewed on {review['created_at']}")
            date_label.setStyleSheet("color: #666; font-size: 11px; margin-top: 10px;")
            layout.addWidget(date_label)

            self.reviews_list_widget.addWidget(frame)

        self.reviews_list_widget.addStretch()

    def load_statistics(self):
        """Load and display statistics"""
        # Clear current stats
        while self.stats_layout.count():
            item = self.stats_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        stats = self.db.get_statistics()
        stats_widget = StatisticsWidget(stats)
        self.stats_layout.addWidget(stats_widget)

    def toggle_bookmark(self, business_id):
        """Toggle bookmark for a business"""
        if not self.current_user:
            QMessageBox.warning(self, "Error", "Please log in to bookmark businesses")
            return

        action = self.db.toggle_bookmark(self.current_user['id'], business_id)

        # Update UI
        self.load_businesses()
        self.load_bookmarks()

        self.status_bar.showMessage(f"Bookmark {action} successfully")

    def show_add_review_dialog(self):
        """Show dialog to add a review"""
        if not self.current_user:
            QMessageBox.warning(self, "Error", "Please log in to add reviews")
            return

        dialog = QDialog(self)
        dialog.setWindowTitle("Add Review")
        dialog.setFixedSize(400, 400)

        layout = QVBoxLayout()

        # Business selection
        layout.addWidget(QLabel("Select Business:"))

        business_combo = QComboBox()
        businesses = self.db.get_businesses()
        for business in businesses:
            business_combo.addItem(business['name'], business['id'])
        layout.addWidget(business_combo)

        # Rating
        layout.addWidget(QLabel("Rating:"))
        rating_widget = RatingWidget(editable=True)
        layout.addWidget(rating_widget)

        # Comment
        layout.addWidget(QLabel("Comment:"))
        comment_edit = QTextEdit()
        comment_edit.setMaximumHeight(150)
        layout.addWidget(comment_edit)

        # Buttons
        button_layout = QHBoxLayout()

        cancel_btn = QPushButton("Cancel")
        cancel_btn.clicked.connect(dialog.reject)
        button_layout.addWidget(cancel_btn)

        submit_btn = QPushButton("Submit Review")
        submit_btn.clicked.connect(lambda: self.submit_review(
            business_combo.currentData(),
            rating_widget.get_rating(),
            comment_edit.toPlainText(),
            dialog
        ))
        submit_btn.setStyleSheet("background-color: #28a745; color: white;")
        button_layout.addWidget(submit_btn)

        layout.addLayout(button_layout)
        dialog.setLayout(layout)
        dialog.exec_()

    def submit_review(self, business_id, rating, comment, dialog):
        """Submit a new review"""
        if rating == 0:
            QMessageBox.warning(self, "Error", "Please select a rating")
            return

        if not comment.strip():
            QMessageBox.warning(self, "Error", "Please enter a comment")
            return

        # Show CAPTCHA
        if not CAPTCHAWidget.show_captcha(self):
            QMessageBox.warning(self, "Error", "CAPTCHA verification failed")
            return

        self.db.add_review(business_id, self.current_user['id'], rating, comment)

        # Update UI
        self.load_businesses()
        self.load_user_reviews()

        dialog.accept()
        QMessageBox.information(self, "Success", "Review submitted successfully!")

    def export_data(self):
        """Export business data to CSV or PDF"""
        businesses = self.db.get_businesses()

        if not businesses:
            QMessageBox.warning(self, "Error", "No businesses to export")
            return

        dialog = ExportDialog(businesses, self)
        if dialog.exec_() == QDialog.Accepted:
            options = dialog.get_export_options()
            self.perform_export(businesses, options)

    def perform_export(self, businesses, options):
        """Perform the actual export based on options"""
        try:
            if options['format'] == 'csv':
                self.export_to_csv(businesses, options)
            else:
                self.export_to_pdf(businesses, options)

            QMessageBox.information(self, "Success", f"Data exported to {options['filename']}")
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Export failed: {str(e)}")

    def export_to_csv(self, businesses, options):
        """Export businesses to CSV file"""
        filename = options['filename']
        if not filename.endswith('.csv'):
            filename += '.csv'

        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['Name', 'Category', 'Address', 'Rating', 'Review Count']

            if options['include_contact']:
                fieldnames.extend(['Phone', 'Email'])

            if options['include_reviews']:
                fieldnames.append('Deals')

            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()

            for business in businesses:
                row = {
                    'Name': business['name'],
                    'Category': business['category'].capitalize(),
                    'Address': business.get('address', ''),
                    'Rating': business['rating'],
                    'Review Count': business['review_count']
                }

                if options['include_contact']:
                    row['Phone'] = business.get('phone', '')
                    row['Email'] = business.get('email', '')

                if options['include_reviews']:
                    row['Deals'] = business.get('deals', '')

                writer.writerow(row)

    def export_to_pdf(self, businesses, options):
        """Export businesses to PDF file"""
        filename = options['filename']
        if not filename.endswith('.pdf'):
            filename += '.pdf'

        doc = SimpleDocTemplate(filename, pagesize=letter)
        story = []
        styles = getSampleStyleSheet()

        # Title
        title = Paragraph("Business Directory Report", styles['Title'])
        story.append(title)

        # Date
        date_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        date_para = Paragraph(f"Generated on: {date_str}", styles['Normal'])
        story.append(date_para)

        story.append(Spacer(1, 20))

        # Summary
        summary_text = f"Total Businesses: {len(businesses)}"
        story.append(Paragraph(summary_text, styles['Normal']))
        story.append(Spacer(1, 20))

        # Create table data
        table_data = [['Name', 'Category', 'Address', 'Rating']]

        if options['include_contact']:
            table_data[0].extend(['Phone', 'Email'])

        if options['include_reviews']:
            table_data[0].append('Deals')

        for business in businesses:
            row = [
                business['name'],
                business['category'].capitalize(),
                business.get('address', ''),
                str(business['rating'])
            ]

            if options['include_contact']:
                row.extend([business.get('phone', ''), business.get('email', '')])

            if options['include_reviews']:
                row.append(business.get('deals', ''))

            table_data.append(row)

        # Create table
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
        ]))

        story.append(table)
        doc.build(story)

    def show_about(self):
        """Show about dialog"""
        about_text = """
        <h1>Byte-Sized Business Boost</h1>
        <p>Version 1.0</p>
        <p>An interactive desktop application for discovering, 
        supporting, and engaging with local businesses in your community.</p>
        <p>Features:</p>
        <ul>
            <li>Discover local businesses by category</li>
            <li>Leave ratings and reviews</li>
            <li>Bookmark favorite businesses</li>
            <li>View special deals and coupons</li>
            <li>Bot prevention with CAPTCHA</li>
            <li>Export data to CSV/PDF</li>
        </ul>
        <p>Built with Python and PyQt5</p>
        """

        QMessageBox.about(self, "About", about_text)

    def closeEvent(self, event):
        """Handle application close event"""
        self.db.close()
        event.accept()


def main():
    """Main application entry point"""
    app = QApplication(sys.argv)
    app.setApplicationName("Byte-Sized Business Boost")

    # Set application style
    app.setStyle('Fusion')

    # Create and show main window
    window = BusinessBoostApp()
    window.show()

    sys.exit(app.exec_())


if __name__ == '__main__':
    main()