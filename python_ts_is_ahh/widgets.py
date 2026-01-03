"""
Custom GUI widgets for Byte-Sized Business Boost
"""
from PyQt5.QtWidgets import *
from PyQt5.QtCore import *
from PyQt5.QtGui import *
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
import random
import string


class RatingWidget(QWidget):
    """Widget for displaying and selecting ratings"""

    def __init__(self, rating=0, editable=False):
        super().__init__()
        self.rating = rating
        self.editable = editable
        self.stars = []
        self.init_ui()

    def init_ui(self):
        layout = QHBoxLayout()
        layout.setSpacing(2)

        for i in range(5):
            star = QLabel()
            star.setFixedSize(24, 24)
            star.setProperty('star_index', i)

            if self.editable:
                star.mousePressEvent = lambda e, idx=i: self.set_rating(idx + 1)

            self.stars.append(star)
            layout.addWidget(star)

        self.setLayout(layout)
        self.update_stars()

    def set_rating(self, rating):
        if self.editable:
            self.rating = rating
            self.update_stars()

    def update_stars(self):
        for i, star in enumerate(self.stars):
            if i < self.rating:
                star.setText('★')
                star.setStyleSheet('color: #FFD700; font-size: 20px;')
            else:
                star.setText('☆')
                star.setStyleSheet('color: #CCCCCC; font-size: 20px;')

    def get_rating(self):
        return self.rating


class CAPTCHAWidget(QDialog):
    """Simple CAPTCHA verification dialog"""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Verify You're Human")
        self.setFixedSize(300, 200)
        self.init_ui()
        self.generate_captcha()

    def init_ui(self):
        layout = QVBoxLayout()

        # CAPTCHA display
        self.captcha_label = QLabel()
        self.captcha_label.setAlignment(Qt.AlignCenter)
        self.captcha_label.setStyleSheet("""
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 5px;
            background-color: #f0f0f0;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        """)
        layout.addWidget(self.captcha_label)

        # Instructions
        instructions = QLabel("Enter the text shown above:")
        layout.addWidget(instructions)

        # Input field
        self.input_field = QLineEdit()
        self.input_field.setPlaceholderText("Type the characters above")
        layout.addWidget(self.input_field)

        # Buttons
        button_layout = QHBoxLayout()

        refresh_btn = QPushButton("Refresh")
        refresh_btn.clicked.connect(self.generate_captcha)
        button_layout.addWidget(refresh_btn)

        verify_btn = QPushButton("Verify")
        verify_btn.clicked.connect(self.accept)
        button_layout.addWidget(verify_btn)

        cancel_btn = QPushButton("Cancel")
        cancel_btn.clicked.connect(self.reject)
        button_layout.addWidget(cancel_btn)

        layout.addLayout(button_layout)
        self.setLayout(layout)

    def generate_captcha(self):
        """Generate random CAPTCHA text"""
        characters = string.ascii_uppercase + string.digits
        # Remove confusing characters
        characters = characters.replace('0', '').replace('O', '').replace('1', '').replace('I', '')
        self.captcha_text = ''.join(random.choices(characters, k=6))

        # Apply some visual distortion
        display_text = ''
        for i, char in enumerate(self.captcha_text):
            if i % 2 == 0:
                display_text += f'<span style="color: #FF0000;">{char}</span>'
            else:
                display_text += f'<span style="color: #0000FF;">{char}</span>'

        self.captcha_label.setText(display_text)
        self.input_field.clear()

    def verify(self):
        """Verify the entered CAPTCHA"""
        entered_text = self.input_field.text().upper().replace(' ', '')
        return entered_text == self.captcha_text

    @staticmethod
    def show_captcha(parent=None):
        """Static method to show CAPTCHA and return verification result"""
        captcha = CAPTCHAWidget(parent)
        result = captcha.exec_()

        if result == QDialog.Accepted:
            return captcha.verify()
        return False


class StatisticsWidget(QWidget):
    """Widget for displaying business statistics"""

    def __init__(self, stats):
        super().__init__()
        self.stats = stats
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        # Title
        title = QLabel("Business Statistics")
        title.setStyleSheet("font-size: 18px; font-weight: bold; margin: 10px;")
        layout.addWidget(title)

        # Stats grid
        grid = QGridLayout()

        # Total businesses
        grid.addWidget(QLabel("Total Businesses:"), 0, 0)
        grid.addWidget(QLabel(str(self.stats['total_businesses'])), 0, 1)

        # Total reviews
        grid.addWidget(QLabel("Total Reviews:"), 1, 0)
        grid.addWidget(QLabel(str(self.stats['total_reviews'])), 1, 1)

        # Average rating
        grid.addWidget(QLabel("Average Rating:"), 2, 0)
        grid.addWidget(QLabel(f"{self.stats['avg_rating']:.1f}/5.0"), 2, 1)

        layout.addLayout(grid)

        # Categories breakdown
        if self.stats['by_category']:
            categories_label = QLabel("\nBusinesses by Category:")
            categories_label.setStyleSheet("font-weight: bold; margin-top: 10px;")
            layout.addWidget(categories_label)

            for category, count in self.stats['by_category'].items():
                cat_layout = QHBoxLayout()
                cat_layout.addWidget(QLabel(f"  {category.capitalize()}:"))
                cat_layout.addWidget(QLabel(str(count)))
                cat_layout.addStretch()
                layout.addLayout(cat_layout)

        # Top rated
        if self.stats['top_rated']:
            top_label = QLabel("\nTop Rated Businesses:")
            top_label.setStyleSheet("font-weight: bold; margin-top: 10px;")
            layout.addWidget(top_label)

            for name, rating in self.stats['top_rated']:
                biz_layout = QHBoxLayout()
                biz_layout.addWidget(QLabel(f"  {name}:"))
                biz_layout.addWidget(QLabel(f"{rating:.1f}/5.0"))
                biz_layout.addStretch()
                layout.addLayout(biz_layout)

        layout.addStretch()
        self.setLayout(layout)


class BusinessCardWidget(QFrame):
    """Widget for displaying a business card"""

    def __init__(self, business, bookmarked=False):
        super().__init__()
        self.business = business
        self.bookmarked = bookmarked
        self.init_ui()
        self.setFrameStyle(QFrame.Box | QFrame.Raised)
        self.setLineWidth(2)
        self.setStyleSheet("""
            BusinessCardWidget {
                background-color: white;
                border-radius: 8px;
                padding: 15px;
                margin: 5px;
            }
            BusinessCardWidget:hover {
                background-color: #f9f9f9;
                border: 2px solid #007bff;
            }
        """)

    def init_ui(self):
        layout = QVBoxLayout()

        # Header with name and bookmark
        header_layout = QHBoxLayout()

        # Business name
        name_label = QLabel(self.business['name'])
        name_label.setStyleSheet("font-size: 16px; font-weight: bold;")
        header_layout.addWidget(name_label)

        header_layout.addStretch()

        # Bookmark icon
        self.bookmark_btn = QPushButton()
        self.bookmark_btn.setFixedSize(30, 30)
        self.bookmark_btn.setFlat(True)
        self.update_bookmark_icon()
        header_layout.addWidget(self.bookmark_btn)

        layout.addLayout(header_layout)

        # Category and rating
        info_layout = QHBoxLayout()

        # Category
        category_label = QLabel(f"Category: {self.business['category'].capitalize()}")
        category_label.setStyleSheet("color: #666; font-size: 12px;")
        info_layout.addWidget(category_label)

        info_layout.addStretch()

        # Rating
        rating_widget = RatingWidget(rating=int(self.business['rating']))
        info_layout.addWidget(rating_widget)

        rating_text = QLabel(f"({self.business['rating']:.1f})")
        info_layout.addWidget(rating_text)

        layout.addLayout(info_layout)

        # Address
        if self.business.get('address'):
            address_label = QLabel(f"📍 {self.business['address']}")
            address_label.setStyleSheet("color: #444; font-size: 12px;")
            layout.addWidget(address_label)

        # Description
        if self.business.get('description'):
            desc_label = QLabel(self.business['description'])
            desc_label.setWordWrap(True)
            desc_label.setStyleSheet("color: #333; margin-top: 5px;")
            layout.addWidget(desc_label)

        # Deals
        if self.business.get('deals'):
            deals_label = QLabel(f"🔥 Special Deal: {self.business['deals']}")
            deals_label.setStyleSheet("""
                color: #d35400;
                font-weight: bold;
                background-color: #fff3cd;
                padding: 5px;
                border-radius: 4px;
                margin-top: 10px;
            """)
            layout.addWidget(deals_label)

        # Contact info
        contact_layout = QHBoxLayout()
        if self.business.get('phone'):
            phone_label = QLabel(f"📞 {self.business['phone']}")
            phone_label.setStyleSheet("font-size: 11px; color: #007bff;")
            contact_layout.addWidget(phone_label)

        if self.business.get('email'):
            email_label = QLabel(f"✉️ {self.business['email']}")
            email_label.setStyleSheet("font-size: 11px; color: #007bff;")
            contact_layout.addWidget(email_label)

        if contact_layout.count() > 0:
            layout.addLayout(contact_layout)

        self.setLayout(layout)

    def update_bookmark_icon(self):
        if self.bookmarked:
            self.bookmark_btn.setText('★')
            self.bookmark_btn.setStyleSheet('color: #FFD700; font-size: 16px;')
        else:
            self.bookmark_btn.setText('☆')
            self.bookmark_btn.setStyleSheet('color: #CCCCCC; font-size: 16px;')


class ExportDialog(QDialog):
    """Dialog for exporting business data"""

    def __init__(self, businesses, parent=None):
        super().__init__(parent)
        self.businesses = businesses
        self.setWindowTitle("Export Business Data")
        self.setFixedSize(400, 300)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        # Format selection
        format_group = QGroupBox("Export Format")
        format_layout = QVBoxLayout()

        self.csv_radio = QRadioButton("CSV (Comma Separated Values)")
        self.pdf_radio = QRadioButton("PDF Report")
        self.csv_radio.setChecked(True)

        format_layout.addWidget(self.csv_radio)
        format_layout.addWidget(self.pdf_radio)
        format_group.setLayout(format_layout)
        layout.addWidget(format_group)

        # Options
        options_group = QGroupBox("Options")
        options_layout = QVBoxLayout()

        self.include_reviews = QCheckBox("Include reviews")
        self.include_contact = QCheckBox("Include contact information")
        self.include_ratings = QCheckBox("Include ratings")
        self.include_contact.setChecked(True)
        self.include_ratings.setChecked(True)

        options_layout.addWidget(self.include_reviews)
        options_layout.addWidget(self.include_contact)
        options_layout.addWidget(self.include_ratings)
        options_group.setLayout(options_layout)
        layout.addWidget(options_group)

        # File selection
        file_layout = QHBoxLayout()
        file_layout.addWidget(QLabel("Filename:"))
        self.filename_edit = QLineEdit("business_export")
        file_layout.addWidget(self.filename_edit)

        self.browse_btn = QPushButton("Browse...")
        self.browse_btn.clicked.connect(self.browse_file)
        file_layout.addWidget(self.browse_btn)

        layout.addLayout(file_layout)

        # Buttons
        button_layout = QHBoxLayout()
        button_layout.addStretch()

        cancel_btn = QPushButton("Cancel")
        cancel_btn.clicked.connect(self.reject)
        button_layout.addWidget(cancel_btn)

        export_btn = QPushButton("Export")
        export_btn.clicked.connect(self.accept)
        export_btn.setStyleSheet("background-color: #007bff; color: white;")
        button_layout.addWidget(export_btn)

        layout.addLayout(button_layout)
        self.setLayout(layout)

    def browse_file(self):
        filename, _ = QFileDialog.getSaveFileName(
            self, "Save Export File", self.filename_edit.text(),
            "CSV Files (*.csv);;PDF Files (*.pdf)"
        )
        if filename:
            self.filename_edit.setText(filename)

    def get_export_options(self):
        return {
            'format': 'csv' if self.csv_radio.isChecked() else 'pdf',
            'filename': self.filename_edit.text(),
            'include_reviews': self.include_reviews.isChecked(),
            'include_contact': self.include_contact.isChecked(),
            'include_ratings': self.include_ratings.isChecked()
        }