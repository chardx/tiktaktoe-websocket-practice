import express from 'express'
import cors from 'cors'
import { WebSocketServer } from 'ws';

const app = express();
const router = express.Router();

//Web Socket setup
const sockserver = new WebSocketServer({ port: 443 })


const history = new Array(9).fill(null)
const currentMove = 0;
const xIsNext = currentMove % 2 === 0;
const squares = history[currentMove];

sockserver.on("connection", ws => {
    console.log(" client Connected")
    ws.send("Connection Established");

    ws.on("close", () => console.log("Client disconnected"));
    ws.on("message", data => {
        sockserver.clients.forEach(client => {
            console.log(`distributing message: ${data}`)
            const playerInput = data
            const result = processPlayerInput(playerInput);
            client.send(`${data}`)
        })
    })
    ws.on('error', () => console.log("Web Socket error!"))
})


app.listen(3000, () => {
    console.log('Ready')
})



const calculateWinner = () => {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}


const processPlayerInput = (i) => {
    console.log(i);
    if (calculateWinner(squares) || squares[i]) {
        return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
        nextSquares[i] = "X";
    } else {
        nextSquares[i] = "O";
    }
    onPlay(nextSquares);
}

const winner = calculateWinner(squares);
let status;
if (winner) {
    status = "Winner: " + winner;
} else {
    status = "Next player: " + (xIsNext ? "X" : "O");
}
