import React, { useState, useEffect } from 'react'
import TaskForm from '../components/TaskForm'
import { auth } from '../firebase'
import { Link } from 'react-router-dom'
import './Home.css'

function Home() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greetingMessage, setGreetingMessage] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setGreetingMessage(getMessageBasedOnTime(now));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getMessageBasedOnTime = (time) => {
    const hour = time.getHours();

    if (hour >= 3 && hour < 12) {
      return '☀️ Good Morning! Are you happy with the life you are living?';
    } else if (hour >= 12 && hour < 18) {
      return '🌤 Good Afternoon! Whatever you did since you woke up — do you think it will take you far in life?';
    } else if (hour >= 18 && hour < 24) {
      return '🌙 Good Evening! So before you sleep — are you proud of what you did today? Will it build or destroy your future? Sleep well.';
    } else {
      return '🌌 It’s late night. Reflect deeply — is this really the path you want?';
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">📅 Discipline Dashboard</h1>
      <p className="motivational-message">{greetingMessage}</p>
      <p className="home-time">🕒 {currentTime.toLocaleString()}</p>

      <h2 className="home-subtitle">Add a Task</h2>
      <TaskForm />

      <div className="tasklist-link">
        <Link to="/tasks">📋 View My Task List</Link>
      </div>

      <div className="goals-link">
        <Link to="/goals">🎯 My Goals</Link>
      </div>
    </div>
  );
}

export default Home
