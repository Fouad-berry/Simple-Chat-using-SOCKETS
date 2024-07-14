import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [name, setName] = useState('anonymous');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState('');
  const [messages, setMessages] = useState([]);
  const [privateMessages, setPrivateMessages] = useState({});
  const [userCount, setUserCount] = useState(0);
  const [userList, setUserList] = useState([]);
  const [activeChat, setActiveChat] = useState('All');

  useEffect(() => {
    socket.emit('setUsername', name);

    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on('messageHistory', (history) => {
      setMessages(history);
    });

    socket.on('privateMessage', (message) => {
      const { senderId } = message;
      setPrivateMessages((prevPrivateMessages) => {
        const conversationKey = [senderId, socket.id].sort().join('_');
        return {
          ...prevPrivateMessages,
          [conversationKey]: [...(prevPrivateMessages[conversationKey] || []), message]
        };
      });
    });

    socket.on('privateMessageHistory', (history) => {
      const receiverId = activeChat;
      const conversationKey = [receiverId, socket.id].sort().join('_');
      setPrivateMessages((prevPrivateMessages) => ({
        ...prevPrivateMessages,
        [conversationKey]: history
      }));
    });

    socket.on('updateUserList', (users) => {
      setUserList(users);
    });

    socket.on('userCount', (userTotal) => {
      setUserCount(userTotal);
    });

    socket.on('typing', (user) => {
      setFeedback(`${user.name} is typing...`);
    });

    socket.on('stopTyping', () => {
      setFeedback('');
    });

    return () => {
      socket.off('message');
      socket.off('privateMessage');
      socket.off('messageHistory');
      socket.off('privateMessageHistory');
      socket.off('userCount');
      socket.off('typing');
      socket.off('stopTyping');
      socket.off('updateUserList');
    };
  }, [messages, privateMessages, feedback, userList, activeChat]);

  const handleNameChange = (e) => {
    setName(e.target.value);
    socket.emit('setUsername', e.target.value);
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    socket.emit('typing', { name });
  };

  const handleMessageSend = (e) => {
    e.preventDefault();
    const newMessage = {
      text: message,
      author: name,
      date: new Date().toLocaleString(),
      senderId: socket.id,
    };
    if (activeChat === 'All') {
      socket.emit('message', newMessage);
    } else {
      socket.emit('privateMessage', {
        receiverId: activeChat,
        message: newMessage
      });
    }
    setMessage('');
    socket.emit('stopTyping');
  };

  const handleUserClick = (userId) => {
    setActiveChat(userId);
    socket.emit('requestPrivateHistory', userId);
  };

  return (
    <>
      <h1 className='title'>iChat</h1>
      <div className="mainChat">
        <div className="flex">
          <div className="userList">
            <h3>The Users : {userCount}</h3>
            <ul>
              <li onClick={() => {
                setActiveChat('All');
                socket.emit('requestGeneralHistory');
              }} className={`userClickable ${activeChat === 'All' ? 'active' : ''}`}>All</li>
              {Object.keys(userList).map((user, index) => (
                <li key={index} onClick={() => handleUserClick(user)} className={`userClickable ${activeChat === user ? 'active' : ''}`}>
                  {userList[user]}
                </li>
              ))}
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
              {activeChat === 'All' ? (
                messages.map((msg, index) => (
                  <li key={index} className={msg.senderId === socket.id ? 'messageRight' : 'messageLeft'}>
                    <p className="message">{msg.text}</p>
                    <span>{msg.author} - {msg.date}</span>
                  </li>
                ))
              ) : (
                (privateMessages[[activeChat, socket.id].sort().join('_')] || []).map((msg, index) => (
                  <li key={index} className={msg.senderId === socket.id ? 'messageRight' : 'messageLeft'}>
                    <p className="message">{msg.text}</p>
                    <span>{msg.author} - {msg.date}</span>
                  </li>
                ))
              )}
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
                  if (!message) {
                    socket.emit('stopTyping');
                  }
                }}
                onChange={handleMessageChange}
              />
              <div className="vDivider"></div>
              <button type="submit" className='sendButton'>Sent the message <FontAwesomeIcon icon={faPaperPlane} /></button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
