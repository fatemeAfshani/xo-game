import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Message } from '../types.js';

export default function Messages({ gameId, socket, username }: { gameId: string; socket: Socket; username: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    socket.on('sendMessage', (message: Message) => {
      setNewMessage('');
      setMessages((preArray) => [...preArray, message]);
    });

    socket.on('messageHistory', (messages: Message[]) => {
      setMessages(messages);
    });
  }, [socket]);

  const sendMessage = useCallback(() => {
    socket.emit('newMessage', { message: newMessage, username, gameId });
  }, [gameId, newMessage, socket, username]);

  return (
    <div className="container">
      <div className="sticky-bottom">
        <h4>messages</h4>

        <div className="row my-3">
          <div className="col">
            <div className="scrollable-element">
              {messages?.length > 0 &&
                messages.map((message, index) => {
                  return (
                    <div className="border rounded mb-2" key={index}>
                      <div className="d-flex justify-content-between align-items-center px-2 pt-2">
                        {' '}
                        <p>{message.username}</p>
                        <p>{message.timestamp}</p>
                      </div>
                      <div className="row px-4 pb-2 h6"> {message.message}</div>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="row my-3 ">
            <div className="col-10">
              <input
                type="text"
                className="form-control"
                placeholder="message"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>
            <div className="col-2">
              <button type="button" className="btn btn-dark px-3 mx-1" onClick={sendMessage}>
                submit{' '}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
