import React from 'react'

const Person = ({ person, handleDeletePerson }) => {
  return(
      <li>
        {person.name}
        {' '}
        {person.number}
        {' '}
        <button onClick={handleDeletePerson} id = {person.id} name = {person.name}>
          delete
        </button>
      </li>
  )
}

const Persons = ({ persons, handleDeletePerson }) => {

  return(
      <ul>
      {persons.map(person =>
        <Person
          key={person.name}
          person={person}
          handleDeletePerson={handleDeletePerson}
        />
      )}
    </ul>
  )
}

export default Persons