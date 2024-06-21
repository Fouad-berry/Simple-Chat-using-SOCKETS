import './App.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import {io} from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  // On déclare 2 states, donc, l'equivalent des variables, qui me permettront de conserver, 
  // le name ainsi que le message
  const [name, setName] = useState('anonymous');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [messages, setMessages] = useState([]);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    })

    socket.on('userCount', (userTotal) => {
      setUserCount(userTotal);
    })

    socket.on('typing', (user) => {
      setFeedback(`${user.name} is typing...`);
    });

    socket.on('stopTyping', () => {
      setFeedback('');
    })

    return () => {
      socket.off('message');
      socket.off('userCount');
      socket.off('typing');
      socket.off('stopTyping');
    }

  }, [messages, feedback]);

  const handleNameChange = (e) => {
    setName(e.target.value); // Ici on prend la valeur de l'input qui vient d'etre modifiée, et on utilise SetName pour changer la valeur du name
    socket.emit('setUsername', e.target.value);
  }

  const handleMessageChange = (e) => {
    setMessage(e.target.value); // Ici on prend la valeur de l'input qui vient d'etre modifiée, et on utilise SetName pour changer la valeur du name
    socket.emit('typing', { name });
  }

  const handleMessageSend = (e) => {
    e.preventDefault();
    const newMessage = {
      text: message,
      author: name,
      date: new Date().toLocaleString(),
      senderId: socket.id,
    }
    socket.emit('message', newMessage);
    setMessage('');
    socket.emit('stopTyping');
  }

  return (
    <>
      <h1 className='title'>iChat</h1>
      <div className="mainChat">
        <div className="flex">
          <div className="userList">
            <h3>Users : {userCount}</h3>
            <ul>
              <li>All</li>
              <li>Toto</li>
              <li>Bob</li>
              <li>Alice</li>
            </ul>
          </div>
          <div className="chat">
            <div className="name">
              <span className="nameForm">
                <FontAwesomeIcon icon={faUser} />
                <input type="text"
                  className="nameInput"
                  id="nameInput"
                  value={name}
                  onChange={handleNameChange}
                  maxLength="20"
                />
              </span>
            </div>
            <ul className="conversation">
              {messages.map((msg, index) => (
                <li key={index} className={msg.senderId === socket.id ? 'messageRight' : 'messageLeft'}>
                  <p className="message">{msg.text}</p>
                  <span>{msg.author} - {msg.date}</span>
                </li>
              ))}
              {feedback && (
                <li className="messageFeedback">
                  <p className="feedback">{feedback}</p>
                </li>
              )}
            </ul>
            <form className="messageForm" onSubmit={handleMessageSend}>
              <input type="text" 
                name="message" 
                className='messageInput' 
                value={message}
                onKeyUp={() => {
                  if(!message) {
                    socket.emit('stopTyping');
                  }
                }}
                onChange={handleMessageChange} 
              />
              <div className="vDivider"></div>
              <button type="submit" className='sendButton'>Send <FontAwesomeIcon icon={faPaperPlane}/></button>
            </form>
          </div>
        </div>

      </div>
    </>
  )
}

export default App
