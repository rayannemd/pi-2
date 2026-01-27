import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"

let stompClient = null

export const connectSocket = (onMessageReceived) => {
  const socket = new SockJS(import.meta.env.VITE_WS_URL)

  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,

    onConnect: () => {
      stompClient.subscribe("/topic/chat", (message) => {
        onMessageReceived(JSON.parse(message.body))
      })
    },
  })

  stompClient.activate()
}

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: "/app/chat.send",
      body: JSON.stringify(message),
    })
  }
}
