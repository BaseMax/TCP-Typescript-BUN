/*
How can improve and scale it?
1. network side -> split requests to servers 
2. we need to use database and not in-memory (meilisearch, clickhouse, elasticsearch) I think REDIS is one of good
3. Improve searching - not iterate on all items we need to search by key
    - We can even categorise by first char or ip range
4. To be able to detect and ban TCP attacks
*/

const HOSTNAME = "127.0.0.1"
const PORT = 3000;

interface User {
    nickname: string;
    socket: any; // TODO: Change to Bun.Socket
}

const clients = new Map<string, User>();
const broadcast = (sender: any, dataMsg: string) => {
    console.log(`Forwarding ${dataMsg} to everyone - room`)
    for (const client of clients) {
        if (sender === undefined || (client[1] && client[1].socket !== sender)) {
            client[1].socket.write(dataMsg);
        }
    }
};

const getUser = (socket: any) => {
    for (const client of clients) {
        if (client[1].socket === socket) {
            return client[1];
        }
    }
    return undefined;
};

const removeClient = (socket: any) => {
    for (const client of clients) {
        if (client[1].socket === socket) {
            let msg: string = `User '${client[0]}' left.\n`;
            broadcast(socket, msg);
            clients.delete(client[0]);
        }
    }
};

const welcome = (socket: any) => {
    if (!socket) return;

    if (clients.size === 1) {
        socket.write(`Welcome to the room. You are the only one in the room.\n`);
    } else {
        socket.write(`Welcome to the room. Number of online users - ${clients.size}.\n`)

        const user_nicknames: string[] = [];
        clients.forEach((client: User) => client.socket !== socket ? user_nicknames.push(client.nickname) : undefined);
        socket.write("List of online users are: " + user_nicknames.join(", "));
    }
};

const server = Bun.listen({
    hostname: HOSTNAME,
    port: PORT,
    socket: {
        open(socket: any) {
            console.log("Client connected:", socket.remoteAddress);
            socket.write("Welcome to the community. Please type your nickname:\n> ");
        },
        data(socket: any, data: any) {
            // TODO: add a custom parameter to socket
            const msg: string = data.toString().trim();
            if (msg === "") return;

            const isNew: User | undefined = getUser(socket);
            console.log("isNew:", isNew);
            if (isNew === undefined) {
                if (clients.has(msg)) {
                    socket.write("Error: this nickname already exists, please choose another nickname.\n> ");
                    return;
                } else {
                    const user: User = {
                        nickname: msg,
                        socket: socket,
                    };
                    clients.set(msg, user);
                    welcome(socket);
                }
            } else {
                broadcast(socket, isNew.nickname + ": " + msg + "\r\n");
            }
        },
        close(socket: any) {
            console.log("Client disconnected:", socket.remoteAddress);
            removeClient(socket);
        },
        drain(socket: any) {
            console.log("drain");
        },
        error(socket, error) {
            console.log("Socket error:", error);
        },
    },
});

console.log(`TCP Server running on ${HOSTNAME}:${PORT}`);
console.log(server);
