# Chat.IO
Lightweight NodeJS chatroom using Webpack and Socket.IO

## Usage

You will need NodeJS v16+ to run the server.

1. Clone the repo
   ```sh
   git clone https://github.com/lkk6057/Chat.io.git
   ```
   
2. Configure 'constants.js'
   ```
    module.exports = Object.freeze({
        URL: "ws://localhost",
        PORT: 8000,
        MSG_TYPES: {
            INITIALIZE: 'initialize',
            MESSAGE: 'message',
            UPDATEMESSAGES: 'update_messages',
            ERROR: 'error'
        },
    });
   ```
3. Build the Webpack distribution
   ```sh
   npx webpack
   ```
   
4. Start the web server
   ```sh
   npm start
   ```
   
5. Navigate to the web client
   ```url
   localhost:8000
   ```
   
## Built With

* [JQuery](https://jquery.com)
* [Socket.IO](https://socket.io)
* [Webpack](https://webpack.js.org/)
  
  
  
  
