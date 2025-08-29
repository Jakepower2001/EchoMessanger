# Firebase React Messaging App

This project is a real-time messaging application built with React and Firebase. It allows users to sign up, log in, and chat with each other in real-time.

## Features

- User authentication (login and signup)
- Real-time messaging
- User list to select and chat with other users

## Technologies Used

- React
- Firebase
- TypeScript

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 5.6 or higher)

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/firebase-react-messaging-app.git
   ```

2. Navigate to the project directory:

   ```
   cd firebase-react-messaging-app
   ```

3. Install the dependencies:

   ```
   npm install
   ```

4. Set up Firebase:

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable Authentication and Firestore in your Firebase project.
   - Add your Firebase configuration to `src/firebase/config.ts`.

### Running the App

To start the development server, run:

```
npm start
```

The app will be available at `http://localhost:3000`.

### Usage

- Users can sign up for a new account or log in with existing credentials.
- Once logged in, users can view a list of other users and start chatting in real-time.

## Contributing

Feel free to submit issues or pull requests for any improvements or bug fixes.

## License

This project is licensed under the MIT License.