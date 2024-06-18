import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
        <h1 className='title'>eChat</h1>
        <div className='mainChat'>
        <div className='name'>
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
        <div className='conversation'>
        <form className="messageForm"></form>
        </div>
      </div>
    </>
  )
}

export default App
