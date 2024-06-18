import './App.css'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import { faPaperPlane, faUser } from '@fortawesome/free-solid-svg-icons';

function App() {

  return (
    <>
      <h1 className='title'>iChat</h1>
      <div className="mainChat">
        <div className="name">
          <span>
            <FontAwesomeIcon icon={faUser} />
            <input type="text"
              className="nameInput"
              id="nameInput"
              value=""
              maxLength="20"
            />
          </span>
        </div>
        <ul className="conversation">
          <li className="messageLeft">
            <p className="message">Bonjour tout le monde !</p>
            <span>author - 18 juin 2024</span>
          </li>
          <li className="messageRight">
            <p className="message">Ca va?</p>
            <span>author - 18 juin 2024</span>
          </li>
          <li className="messageFeedback">
            <p className="feedback">Toto is typing...</p>
          </li>
        </ul>
        <form className="messageForm">
          <input type="text" name="message" className='messageInput' value="" />
          <div className="vDivider"></div>
          <button type="submit">Send <FontAwesomeIcon icon={faPaperPlane}/></button>
        </form>
      </div>
    </>
  )
}

export default App
