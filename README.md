# Edu X Change

Edu X Change is an educational social media platform built using Python, Django, Preact with Typescript in frontend. It allows students to join virtual groups called "communities" based on their interests. Within these communities, students can share study materials such as e-books, PDF notes, images, and videos. They can also create posts with text, embedded images, or links to external applications. Users can ask questions related to the topic, and other members of the community can provide answers. Additionally, users can up-vote and down-vote posts, questions, and answers to filter out the best content.

## Features

- User Registration and Authentication: Users can create accounts and log in to the platform.
- Community Creation and Joining: Users can create new communities or join existing ones based on their interests.
- Content Sharing: Users can upload and share study materials like e-books, PDF notes, images, and videos within their communities.
- Post Creation: Users can create text-based posts with embedded images or links to external applications.
- Question and Answer System: Users can ask questions related to a community's topic, and other members can provide answers.
- Voting System: Users can up-vote or down-vote posts, questions, and answers to determine the quality and relevance of the content.

## Tech Stack

The project is built using the following technologies:

### Backend

- Python v3.8 : Programming language used for the backend development.
- Django v4.2 : Python web framework used for building the server-side logic and APIs.
- MySQL: Relational database management system used for storing data.
  - Host: localhost
  - Port: 3306
  - User: root

### Frontend

- TypeScript: Programming language used for the frontend development.
- Preact: JavaScript library used for building the user interface components.
- Vite: Build tool used for bundling and optimizing the frontend code.

## Getting Started

To get a local copy of the project up and running, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/edu-x-change.git
   cd edu-x-change
   ```

2. Set up the backend:

   ```bash
   # Assuming you have Python and pip installed
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. Configure the database settings:

   Install MySQL and run the server. Open the `settings.py` file and modify the following section:

   ```python
   DATABASES = {
    'default': {
     'ENGINE': 'django.db.backends.mysql',
     'NAME': 'your_database_name',
     'USER': 'root',
     'PASSWORD': 'your_database_password',
     'HOST': 'localhost',
     'PORT': '3306',
    }
   }
   ```

   Replace your_database_name with the name of your MySQL database and your_database_password with the password for your MySQL root user.

4. Apply migrations and start the backend server:

   ```bash
   python manage.py migrate
   python manage.py runserver
   ```

5. Set up the frontend:

   ```bash
   # Assuming you have Node.js and npm installed
   cd frontend
   npm install
   npm run dev
   ```

6. Access the application:

   Open your browser and visit `http://127.0.0.1:8000/` to access the Edu X Change application.
