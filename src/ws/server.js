import { WebSocket, WebSocketServer } from "ws";
import mongoose from "mongoose";

const matchSubscribers = new Map()

function subscribe (matchId, socket) {
    if(!matchSubscribers.has(matchId)) matchSubscribers.set(matchId, new Set());
    matchSubscribers.get(matchId).add(socket);
}

function unsubscribe (matchId, socket) {
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers) return;
    subscribers.delete(socket);
    if(subscribers.size === 0) matchSubscribers.delete(matchId);
}

function cleanupSubscriptions (socket) {
    for(const matchId of socket.subscriptions){
        unsubscribe(matchId, socket);
        socket.subscriptions.clear();
    }
}

export function broadcastMatch (matchId, payload) {
    const subscribers = matchSubscribers.get(matchId);
    if(!subscribers || subscribers.size === 0) return;

    const message = JSON.stringify(payload);

    for(const client of subscribers){
        if (client.readyState !== WebSocket.OPEN) {
            subscribers.delete(client);
            continue;
        }

        client.send(message);
    }
}

function handleMessage (socket, data) {
    let message;
    try {
        message = JSON.parse(data.toString())
    } catch (error) {
        sendJson(socket, {type: 'error', message: 'Invalid JSON'} );
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(message.matchId)) {
        sendJson(socket, { type: "error", message: "Invalid matchId" });
        return;
    }

    const id = String(message.matchId);

    if(message?.type === 'subscribe') {
        if (!socket.subscriptions.has(id)) {
            subscribe(id, socket);
            socket.subscriptions.add(id);
        }

        sendJson(socket, { type: "subscribed", matchId: id });
        return;
    }
    if(message?.type === 'unsubscribe'){
        unsubscribe(id, socket);
        socket.subscriptions.delete(id);

        sendJson(socket, { type: "unsubscribed", matchId: id });
        return;
    }
    sendJson(socket, {
        type: "error",
        message: "Invalid message format"
    });
}
 
function sendJson (socket, payload) {
    if(socket.readyState !== WebSocket.OPEN) return;

    socket.send(JSON.stringify(payload));
}

function broadcast (wss, payload) {
    for(const client of wss.clients){
        if(client.readyState !== WebSocket.OPEN) continue;

        client.send(JSON.stringify(payload));
    }
}

export function attachWebsocketServer(server) {
    const wss = new WebSocketServer({
        server,
        path: '/ws',
        maxPayload: 1024*1024
    });

    wss.on('connection', (socket) => {
        socket.isAlive = true;

        socket.on('pong', () => {socket.isAlive = true});

        socket.subscriptions = new Set();

        sendJson(socket, {type: 'Welcome'});

        socket.on('message', (data) => {
            handleMessage(socket, data)
        })

        socket.on('error', () => {
            console.error("WS ERROR:", err);
            socket.terminate();
        });

        socket.on('close', () => {
            cleanupSubscriptions(socket);
        })
    });

    const interval = setInterval(() => {
        wss.clients.forEach((ws) => {
            if(ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        })
    }, 30000);

    wss.on('close', () => clearInterval(interval));

    function broadcastMatchCreated(match) {
        broadcast(wss, {type: 'match_created', data: match});
    }

    function broadcastCommentary(matchId, comment){
        broadcastMatch(matchId, {type: 'commentary', data: comment})
    }
    return { broadcastMatchCreated, broadcastCommentary }
}