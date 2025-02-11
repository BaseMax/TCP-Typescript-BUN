# TCP-Typescript-BUN

A lightweight and efficient TCP chat server built with TypeScript and Bun. This project demonstrates how to handle multiple client connections, broadcast messages, and manage user sessions using Bun's high-performance networking capabilities.

## Features

- 🚀 Blazing-fast TCP server powered by Bun
- 👥 Multi-user support with real-time message broadcasting
- 🔒 Automatic user registration with nickname validation
- 🔌 Handles disconnections gracefully
- 🎉 Welcomes new users and provides an online user list

## Installation

Make sure you have Bun installed on your system.

**Clone the repository:**

```
git clone https://github.com/BaseMax/TCP-Typescript-BUN.git
cd TCP-Typescript-BUN
```

**Install dependencies:**

```
bun install
```

## Usage

To start the server, run:

```
bun run index.ts
```

By default, the server runs on 127.0.0.1:3000. You can connect to it using a TCP client like nc (Netcat):

```
nc 127.0.0.1 3000
```

## How It Works

When a client connects, they are prompted to enter a nickname.

If the nickname is unique, they join the chatroom and receive a welcome message.

Messages sent by a user are broadcasted to all other connected clients.

If a user disconnects, a notification is sent to the remaining users.

## Project Structure

- `index.ts` - Main entry point of the TCP server
- `package.json` - Project dependencies and scripts
- `bun.lockb` - Bun's lock file for package management

## Contributing

Contributions are welcome! Feel free to fork the repo, create a feature branch, and submit a pull request.

## License

This project is open-source and available under the MIT License.

Copyright 2025, Max Base
