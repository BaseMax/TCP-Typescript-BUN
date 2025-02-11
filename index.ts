const HOSTNAME = "127.0.0.1";
const PORT = 3000;

interface User {
    nickname: string;
    socket: any;
}

// Maps for tracking connected users
const clients = new Map<string, User>();
const socketToUser = new Map<any, string>();

/**
 * Broadcast a message to all connected clients, except the sender.
 */
const broadcast = (sender: any | null, message: string) => {
    console.log(`📢 Broadcasting: ${message}`);
    
    for (const user of clients.values()) {
        if (user.socket !== sender) {
            user.socket.write(message);
        }
    }
};

/**
 * Get the user associated with a socket.
 */
const getUser = (socket: any): User | undefined => {
    const nickname = socketToUser.get(socket);
    return nickname ? clients.get(nickname) : undefined;
};

/**
 * Remove a user from the chat when they disconnect.
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
 * Send a welcome message to a newly joined user.
 */
const welcomeUser = (socket: any) => {
    const nickname = socketToUser.get(socket);
    if (!nickname) return;

    const onlineUsers = [...clients.keys()].filter(user => user !== nickname);
    const userCount = clients.size;

    const newLine = "\r\n"; // Ensure cross-platform compatibility (Windows: \r\n, Unix: \n)
    const message = userCount === 1
        ? `🎉 Welcome! You are the only user here.${newLine}`
        : `🎉 Welcome! There are ${userCount} users online.${newLine}👥 Online users: ${onlineUsers.join(", ")}${newLine}`;

    socket.write(message);
};

/**
 * Handle new client connections and interactions.
 */
const server = Bun.listen({
    hostname: HOSTNAME,
    port: PORT,
    socket: {
        open(socket: any) {
            console.log(`✅ Client connected: ${socket.remoteAddress}`);
            socket.write("👋 Welcome! Enter your nickname:\r\n> ");
        },
        data(socket: any, rawData: Buffer) {
            const msg = rawData.toString().trim();
            if (!msg) return;

            let user = getUser(socket);

            if (!user) {
                if (clients.has(msg)) {
                    socket.write("❌ Error: Nickname already taken, choose another:\r\n> ");
                    return;
                }

                user = { nickname: msg, socket };
                clients.set(msg, user);
                socketToUser.set(socket, msg);

                console.log(`👤 User registered: ${msg}`);
                welcomeUser(socket);
            } else {
                broadcast(socket, `💬 ${user.nickname}: ${msg}\r\n`);
            }
        },
        close(socket: any) {
            console.log(`🔌 Client disconnected: ${socket.remoteAddress}`);
            removeClient(socket);
        },
        error(socket: any, err: Error) {
            console.error(`⚠️ Socket error (${socket.remoteAddress}): ${err.message}`);
            removeClient(socket);
        },
    },
});

console.log(`🚀 TCP Chat Server is running on ${HOSTNAME}:${PORT}`);
