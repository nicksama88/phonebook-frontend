import React, { useState, useEffect } from 'react'
import Persons from './components/Persons'
import { Notification, Error} from './components/Notifications'
import peopleService from './services/people'

const PersonForm = ({ 
  addPerson, 
  newName, 
  handleNameChange, 
  newNumber, 
  handleNumberChange
  }) => {
  return(
    <form onSubmit={addPerson}>
        <div>
          name: <input value={newName} onChange={handleNameChange} />
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange} />
        </div>
        <div>
          <button type="submit">add</button>
        </div>
      </form>
  )
}

const Filter = ({ newFilter, handleFilterChange }) => {
  return (
    <div>
      filter shown with <input value={newFilter} onChange={handleFilterChange} />
    </div>
  )
}

const App = () => {
  const [ persons, setPersons ] = useState([]) 
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ newFilter, setNewFilter ] = useState('')
  const [ notificationMessage, setNewNotification ] = useState(null)
  const [ errorMessage, setNewError ] = useState(null)

  useEffect(() => {
    peopleService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const createMessage = ({ text='', type }) => {
    if (type === 'notification') {
      setNewNotification(text)
      setTimeout(() => {
        setNewNotification(null)
      }, 5000)
    } else if (type === 'error') {
      setNewError(text)
      setTimeout(() => {
        setNewError(null)
      }, 5000)
    }
    
  }

  const addPerson = (event) => {
    event.preventDefault()
    const newPersonObject = {
      name: newName,
      number: newNumber,
    }

    if (persons.some(e => e.name.toLowerCase() === newName.toLowerCase())) {
      const replace = window.confirm(`${newName} is already added to phone book, ` +
      'replace the old number with a new one?')

      if (replace) {
        const personToChange = {...persons.find(p => p.name.toLowerCase() === newName.toLowerCase())}
        personToChange.number = newNumber
        peopleService
          .updateNumber(personToChange)
          .then(returnedPerson => {
            setPersons(persons.map(person => 
              person.name.toLowerCase() === newName.toLowerCase() ?
              returnedPerson : person))
            createMessage({
              text:`${returnedPerson.name}'s number has been updated to ${returnedPerson.number}`,
              type:'notification'
            })
          })
          .catch(error => {
            createMessage({
              text: `${error.response.data.error}`,
              type: 'error'
            })
            console.log(error.response.data)
          })
      }

    } else {
      peopleService
        .create(newPersonObject)
        .then( returnedData => {
          setPersons(persons.concat(returnedData))
          createMessage({
            text:`Added ${newPersonObject.name}`,
            type:'notification'
          })
        })
        .catch(error => {
          createMessage(
            {
              text:`${error.response.data.error}`,
              type:'error'
            }
          )
          console.log(error.response.data)
        })
    }
    setNewName('')
    setNewNumber('')
  }

  const deletePerson = (id, name) => {
    peopleService
      .remove(id)
      .then(wasRequestSuccessful => {
        if (wasRequestSuccessful) {
          setPersons(persons.filter(person => person.id !== id))
          createMessage({
            text:`User ${name} deleted`,
            type:'notification'
          })
        }
      })
  }

  const personsToShow = 
    newFilter.length === 0
    ? persons
    : persons.filter(person => person.name.toLowerCase().includes(newFilter.toLowerCase()))

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setNewFilter(event.target.value)
  }

  const handleDeletePerson = (event) => {
    const chooseDelete = window.confirm(`Delete ${event.target.name}?`)
    if (chooseDelete) {
      deletePerson(event.target.id, event.target.name)
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification message={notificationMessage} />
      <Error message={errorMessage} />

      <Filter newFilter={newFilter} handleFilterChange={handleFilterChange}/>

      <h3>Add a new</h3>

      <PersonForm 
        addPerson={addPerson}
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>

      <Persons
        persons={personsToShow}
        handleDeletePerson={handleDeletePerson}
      />

    </div>
  )
}

export default App