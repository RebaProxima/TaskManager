import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, addDoc, onSnapshot, doc, deleteDoc } from 'firebase/firestore'
import './TaskList.css' // or use Goals.css if you want

function Goals() {
  const [goals, setGoals] = useState([])
  const [goalText, setGoalText] = useState('')
  const [goalType, setGoalType] = useState('short-term')
  const [goalYearMonth, setGoalYearMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'goals'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setGoals(data)
    })
    return () => unsub()
  }, [])

  const addGoal = async (e) => {
    e.preventDefault()
    if (!goalText.trim()) return

    await addDoc(collection(db, 'goals'), {
      text: goalText.trim(),
      type: goalType,
      yearMonth: goalYearMonth,
      createdAt: new Date(),
    })

    setGoalText('')
    const now = new Date()
    setGoalYearMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
  }

  const deleteGoal = async (id) => {
    await deleteDoc(doc(db, 'goals', id))
  }

  const shortTermGoals = goals.filter(g => g.type === 'short-term')
  const longTermGoals = goals.filter(g => g.type === 'long-term')

  return (
    <div className="tasklist-container goals-container">
      <h2>Your Goals</h2>
      <form onSubmit={addGoal} className="tasklist-form goals-form">
        <input
          type="text"
          placeholder="Enter your goal"
          value={goalText}
          onChange={(e) => setGoalText(e.target.value)}
          required
          className="goal-input"
        />

        <select
          value={goalType}
          onChange={(e) => setGoalType(e.target.value)}
          className="goal-select"
        >
          <option value="short-term">Short-term</option>
          <option value="long-term">Long-term</option>
        </select>

        <input
          type="month"
          value={goalYearMonth}
          onChange={(e) => setGoalYearMonth(e.target.value)}
          required
          className="goal-month"
        />

        <button type="submit" className="goal-add-button">Add Goal</button>
      </form>

      <div className="goal-list-section">
        <h3 className="goal-list-title">Short-term Goals</h3>
        <ul className="active-list">
          {shortTermGoals.length === 0 && <li>No short-term goals yet.</li>}
          {shortTermGoals.map(goal => (
            <li key={goal.id} className="task-item">
              <strong>{goal.text}</strong><br />
              <span>📅 Target: {goal.yearMonth}</span>
              <button onClick={() => deleteGoal(goal.id)} className="delete-button">🗑️</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="goal-list-section">
        <h3 className="goal-list-title">Long-term Goals</h3>
        <ul className="active-list">
          {longTermGoals.length === 0 && <li>No long-term goals yet.</li>}
          {longTermGoals.map(goal => (
            <li key={goal.id} className="task-item">
              <strong>{goal.text}</strong><br />
              <span>📅 Target: {goal.yearMonth}</span>
              <button onClick={() => deleteGoal(goal.id)} className="delete-button">🗑️</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Goals
