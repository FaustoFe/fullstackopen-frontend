import React, { useState, useEffect, useRef } from 'react'
import Note from './components/Note'
import noteService from './components/services/notes'
import Notification from './components/Notification'
import loginService from './components/services/login'
import LoginForm from './components/LoginForm'
import Togglable from './components/Togglable'
import NoteForm from './components/NoteForm'

function App() {
  const [notes, setNotes] = useState([])
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [user, setUser] = useState(null)

  const noteFormRef = useRef()

  useEffect(() => {
    noteService.getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const addNote = (noteObject) => {
    noteFormRef.current.toggleVisibility()
    noteService
      .create(noteObject)
      .then(returnedNote => {
        setNotes(notes.concat(returnedNote))
      })
  }

  const toggleImportanceOf = id => {
    const note = notes.find(note => note.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService.update(id, changedNote)
      .then(returnedNote => {
        setNotes(notes.map(note => note.id !== id ? note : returnedNote))
      })
      .catch(() => {
        alert(
          `the note '${note.content}' was already deleted from server`
        )
        setNotes(notes.filter(note => note.id !== id))
      })
  }

  const handleDelete = id => {
    const note = notes.find(note => note.id === id)
    const alert = window.confirm(`Are you sure you want to delete this note?: '${note.content}'`)

    if (alert) {
      noteService.remove(id)
        .then(() => {
          setNotes(notes.filter(note => note.id !== id))
        })
        .catch(() => {
          setErrorMessage(
            `Note '${note.content}' was already removed from server}`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setNotes(notes.filter(note => note.id !== id))
        })
    }
  }

  const login = async (userObject) => {
    try {
      const user = await loginService.login(userObject)

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))

      noteService.setToken(user.token)
      setUser(user)
    } catch (exeption) {
      setErrorMessage('Wrong credentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const notesToShow = showAll ? notes : notes.filter(notes => notes.important)

  return (
    <>
      <h1>Notes</h1>

      <Notification message={errorMessage}/>

      {!user &&
        <Togglable buttonLabel='login'>
          <LoginForm loginUser={login} />
        </Togglable>
      }
      {user &&
        <div>
          <p>{user.name} logged-in</p>
          <Togglable buttonLabel='new note' ref={noteFormRef}>
            <NoteForm createNote={addNote} />
          </Togglable>
        </div>
      }
      <button onClick={() => setShowAll(!showAll)}>
        show {showAll ? 'important' : 'all'}
      </button>
      <ul>
        {notesToShow.map(note =>
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
            handleDelete={() => handleDelete(note.id)}
          />
        )}
      </ul>

    </>
  )
}

export default App
