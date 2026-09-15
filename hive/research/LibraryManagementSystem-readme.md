# Library Management System

A comprehensive Java-based Library Management System with a Graphical User Interface (GUI) built using Java Swing.

## Features

### 📚 Core Features

#### Book Catalog
- Display all books in the library with full details: title, author, genre, ISBN, and availability status
- Search books by title, author, genre, or ISBN
- Filter books by availability status (All, Available, Borrowed)

#### User Actions
- Borrow and return books through the GUI
- Display success/error messages based on book availability
- Track borrowing history for each user

#### Recommendations
- Track user borrowing history and preferences
- Suggest books based on previously borrowed genres or authors
- Intelligent recommendation algorithm that scores books based on user preferences

### ⚙️ Technical Features

#### Object-Oriented Design
- **Book**: Manages book properties and borrowing status
- **User**: Tracks user information and borrowing history
- **Library**: Central management class for all operations
- **RecommendationEngine**: Provides intelligent book recommendations
- **LibraryGUI**: Complete GUI interface using Java Swing

#### Data Management
- In-memory storage using ArrayList and HashMap
- Serializable data for save/load functionality
- Persistent data storage using Java serialization

#### User Interface
- Modern, intuitive GUI with tabbed interface
- Three main tabs: Book Catalog, My Borrowed Books, Recommendations
- Search and filter functionality
- Real-time status updates

### 🧩 Bonus Features

#### Save/Load Functionality
- Save library data to file using serialization
- Load previously saved data
- Automatic data persistence

#### Search and Filter
- Search books by title, author, genre, or ISBN
- Filter books by availability status
- Real-time search results

#### User Authentication
- Simple login system with username/password
- Multiple user support
- User-specific borrowing history and recommendations

## How to Run

### Prerequisites
- Java 8 or higher
- Any Java IDE or command line

### Compilation and Execution

1. **Compile all Java files:**
   ```bash
   javac *.java
   ```

2. **Run the application:**
   ```bash
   java LibraryGUI
   ```

### Default Login Credentials

The system comes with pre-configured users:
- **Username**: `admin`, **Password**: `admin123`
- **Username**: `john`, **Password**: `password123`
- **Username**: `sarah`, **Password**: `password456`

## Sample Books Included

The system comes with 15 sample books across various genres:
- Fiction: The Great Gatsby, To Kill a Mockingbird, The Catcher in the Rye, etc.
- Science Fiction: 1984, Brave New World
- Fantasy: The Hobbit, Harry Potter and the Sorcerer's Stone
- Romance: Pride and Prejudice
- Thriller: The Da Vinci Code, Gone Girl
- Young Adult: The Hunger Games
- And more...

## Usage Guide

### 1. Login
- Launch the application
- Enter username and password
- Click "Login"

### 2. Book Catalog Tab
- **View all books** in the library
- **Search books** using the search field
- **Filter books** by availability status
- **Borrow/Return books** by selecting a book and clicking the appropriate button

### 3. My Borrowed Books Tab
- View all books currently borrowed by the logged-in user
- Return borrowed books directly from this tab

### 4. Recommendations Tab
- View personalized book recommendations based on borrowing history
- Recommendations are based on favorite genres and authors
- Borrow recommended books directly from this tab

### 5. Data Persistence
- **Save Data**: Click "Save Data" to persist all changes
- **Load Data**: Click "Load Data" to restore previously saved data

## System Architecture

```
Library Management System
├── Book.java                    # Book entity with properties and methods
├── User.java                    # User entity with borrowing history
├── Library.java                 # Main library management class
├── RecommendationEngine.java    # Intelligent recommendation system
├── LibraryGUI.java             # Complete GUI interface
└── README.md                   # This documentation
```

## Key Features Explained

### Recommendation Algorithm
The recommendation system works by:
1. Tracking user's borrowing history
2. Analyzing preferred genres and authors
3. Scoring available books based on preferences
4. Avoiding books already borrowed by the user
5. Providing top-scoring recommendations

### Search Functionality
- Searches across title, author, genre, and ISBN
- Case-insensitive search
- Real-time results display

### Data Management
- All data stored in memory for fast access
- Serializable objects for persistence
- Automatic data validation and error handling

## Technical Details

- **GUI Framework**: Java Swing
- **Data Structures**: ArrayList, HashMap
- **Serialization**: Java Object Serialization
- **Event Handling**: ActionListener pattern
- **Layout Management**: BorderLayout, GridBagLayout, FlowLayout

## Future Enhancements

Potential improvements for the system:
- Database integration (MySQL, PostgreSQL)
- Advanced search with multiple criteria
- Email notifications for due dates
- Fine calculation for overdue books
- Book reservation system
- Advanced user roles (Admin, Librarian, Member)
- Book reviews and ratings
- Export functionality (PDF, Excel)

## Troubleshooting

### Common Issues

1. **Login fails**: Check username/password combination
2. **Cannot borrow book**: Book may already be borrowed
3. **Cannot return book**: Book may not be borrowed by current user
4. **Save/Load errors**: Check file permissions in the application directory

### Error Messages
- "Invalid username or password" - Login credentials incorrect
- "Failed to borrow book" - Book not available
- "Failed to return book" - Book not borrowed by current user
- "Please select a book" - No book selected in table

## License

This project is open source and available under the MIT License. 
