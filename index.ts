const HOSTNAME = "127.0.0.1";
const PORT = 3000;

// User interface defining a chat user with a nickname and socket connection
interface User {
    nickname: string;
    socket: any;
}

// Maps to track connected users
const clients = new Map<string, User>(); // Stores nickname -> User object
const socketToUser = new Map<any, string>(); // Stores socket -> nickname

/**
 * Broadcasts a message to all connected clients except the sender.
 * @param sender - The socket of the sender (excluded from broadcast)
 * @param message - The message to broadcast
 */
const broadcast = (sender: any | null, message: string) => {
    console.log(`📢 Broadcasting: ${message}`);
    clients.forEach(user => {
        if (user.socket !== sender) {
            user.socket.write(message);
        }
    });
};

/**
 * Retrieves the user associated with a given socket.
 * @param socket - The socket connection of the user
 * @returns The User object if found, otherwise undefined
 */
const getUser = (socket: any): User | undefined => {
    const nickname = socketToUser.get(socket);
    return nickname ? clients.get(nickname) : undefined;
};

/**
 * Registers a new user with a given nickname.
 * @param socket - The socket connection of the user
 * @param nickname - The chosen nickname for the user
 */
const registerUser = (socket: any, nickname: string) => {
    if (clients.has(nickname)) {
        socket.write("❌ Error: Nickname already taken, choose another:\r\n> ");
        return;
    }
    clients.set(nickname, { nickname, socket });
    socketToUser.set(socket, nickname);
    console.log(`👤 User registered: ${nickname}`);
    welcomeUser(socket);
};

/**
 * Removes a user from the chat when they disconnect.
 * @param socket - The socket connection of the user
 */
const removeClient = (socket: any) => {
    const nickname = socketToUser.get(socket);
    if (!nickname) return;

    clients.delete(nickname);
    socketToUser.delete(socket);
    console.log(`❌ User '${nickname}' disconnected.`);
    broadcast(socket, `👋 User '${nickname}' left the chat.\r\n`);
};

/**
 * Sends a welcome message to a newly joined user.
 * @param socket - The socket connection of the user
 */
const welcomeUser = (socket: any) => {
    const nickname = socketToUser.get(socket);
    if (!nickname) return;

    const onlineUsers = [...clients.keys()].filter(user => user !== nickname);
    const userCount = clients.size;
    const newLine = "\r\n"; // Cross-platform compatibility
    const message = userCount === 1
        ? `🎉 Welcome! You are the only user here.${newLine}`
        : `🎉 Welcome! There are ${userCount} users online.${newLine}👥 Online users: ${onlineUsers.join(", ")}${newLine}`;
    
    socket.write(message);
};

/**
 * Handles incoming data from a client.
 * @param socket - The socket connection of the user
 * @param rawData - The raw data received from the client
 */
const handleData = (socket: any, rawData: Buffer) => {
    const msg = rawData.toString().trim();
    if (!msg) return;

    const user = getUser(socket);
    if (!user) {
        registerUser(socket, msg);
    } else {
        broadcast(socket, `💬 ${user.nickname}: ${msg}\r\n`);
    }
};

/**
 * Handles a new client connection.
 * @param socket - The socket connection of the new client
 */
const handleOpen = (socket: any) => {
    console.log(`✅ Client connected: ${socket.remoteAddress}`);
    socket.write("👋 Welcome! Enter your nickname:\r\n> ");
};

/**
 * Handles client disconnection.
 * @param socket - The socket connection of the disconnected client
 */
const handleClose = (socket: any) => {
    console.log(`🔌 Client disconnected: ${socket.remoteAddress}`);
    removeClient(socket);
};

/**
 * Handles errors that occur in a socket connection.
 * @param socket - The socket connection where the error occurred
 * @param err - The error object
 */
const handleError = (socket: any, err: Error) => {
    console.error(`⚠️ Socket error (${socket.remoteAddress}): ${err.message}`);
    removeClient(socket);
};

// Starts the TCP chat server
const server = Bun.listen({
    hostname: HOSTNAME,
    port: PORT,
    socket: {
        open: handleOpen,
        data: handleData,
        close: handleClose,
        error: handleError,
    },
});

console.log(`🚀 TCP Chat Server is running on ${HOSTNAME}:${PORT}`);
