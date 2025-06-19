import React, { useEffect, useState, useRef } from 'react'
import { db } from '../firebase'
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  query,
  where,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { Link } from 'react-router-dom'
import './TaskList.css'
import { toast } from 'react-toastify'

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [showReasonInput, setShowReasonInput] = useState(null);
  const [reasonText, setReasonText] = useState('');
  const [user, setUser] = useState(null);
  const notifiedTasksRef = useRef(new Set()); 

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
  if (!user) return;

  const q = query(collection(db, 'tasks'), where('userId', '==', user.uid));
  const unsub = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((docSnap) => {
      const t = docSnap.data();
      return {
        id: docSnap.id,
        ...t,
        dueTime: t.dueTime?.toDate?.() || null,
        startTime: t.startTime?.toDate?.() || null,
        endTime: t.endTime?.toDate?.() || null,
        completedAt: t.completedAt?.toDate?.() || null,
        failedAt: t.failedAt?.toDate?.() || null,
      };
    });
    setTasks(data);
    checkAndNotifyDueTasks(data);
  });

    return () => unsub();
  }, [user]);

useEffect(() => {
  if (tasks.length === 0) return;

  const interval = setInterval(() => {
    const now = new Date();

    tasks.forEach((task) => {
      const taskTime = task.type === 'sleep' ? task.startTime : task.dueTime;
      if (!taskTime || task.completed || task.reason) return;

      const timeDiff = taskTime.getTime() - now.getTime();

      if (timeDiff <= 120000 && timeDiff >= 0 && !notifiedTasksRef.current.has(task.id)) {
        toast.info(`⏰ Reminder: Task "${task.task}" is due now!`);
        notifiedTasksRef.current.add(task.id);
      }
    });
   }, 30000);

    return () => clearInterval(interval);
   }, [tasks]);

  const handleComplete = async (task) => {
    await updateDoc(doc(db, 'tasks', task.id), {
      completed: true,
      reason: '',
      completedAt: Timestamp.now(),
    });
    setShowReasonInput(null);
    setReasonText('');
  };

  const handleNotDone = (taskId) => {
    setShowReasonInput(taskId);
    setReasonText('');
  };

  const submitReason = async (taskId) => {
    if (!reasonText.trim()) return;
    await updateDoc(doc(db, 'tasks', taskId), {
      completed: false,
      reason: reasonText.trim(),
      failedAt: Timestamp.now(),
    });
    setShowReasonInput(null);
    setReasonText('');
  };

  const doneCount = tasks.filter((t) => t.completed).length;
  const undoneCount = tasks.filter((t) => t.reason).length;

  const guiltMessage =
    undoneCount >= doneCount && undoneCount > 0
      ? "You're making excuses. Time to step up!"
      : '';

  const formatTime = (time) => {
    if (time instanceof Date && !isNaN(time)) {
      return time.toLocaleString();
    }
    return 'Not Available';
  };

  if (!user) {
    return <p>Loading user...</p>;
  }

  const checkAndNotifyDueTasks = (taskList) => {
    const now = new Date();

    taskList.forEach((task) => {
      const taskTime = task.type === 'sleep' ? task.startTime : task.dueTime;
      if (!taskTime || task.completed || task.reason) return;

      const timeDiff = taskTime.getTime() - now.getTime();

      if (timeDiff <= 60000 && timeDiff >= 0 && !notifiedTasksRef.current.has(task.id)) {
        toast.info(`⏰ Reminder: Task "${task.task}" is due now!`);
        notifiedTasksRef.current.add(task.id);
      }
    });
  };

  return (
    <div className="tasklist-container">
      <div className="tasklist-header">
        <h2>Your Tasks</h2>
        <Link to="/home" className="back-link">🔙 Back to Home</Link>
      </div>

      {guiltMessage && <p className="guilt">{guiltMessage}</p>}

      <ul className="active-list">
        {tasks
          .filter((t) => !t.completed && !t.reason)
          .map((task) => (
            <li key={task.id} className="task-item">
              <strong>{task.task}</strong><br />
              {task.type === 'sleep' ? (
                <span>
                  🛌 {formatTime(task.startTime)} – {formatTime(task.endTime)}
                </span>
              ) : (
                <span>🕒 Due: {formatTime(task.dueTime)}</span>
              )}
              <div>
                <button onClick={() => handleComplete(task)}>✅ Done</button>
                <button onClick={() => handleNotDone(task.id)}>❌ Not Done</button>
              </div>
              {showReasonInput === task.id && (
                <div className="reason-box">
                  <input
                    type="text"
                    value={reasonText}
                    placeholder="Reason for not completing"
                    onChange={(e) => setReasonText(e.target.value)}
                  />
                  <button onClick={() => submitReason(task.id)}>Submit</button>
                </div>
              )}
            </li>
          ))}
      </ul>

      <h3>✅ Completed Tasks</h3>
      <ul className="history-list">
        {tasks
          .filter((t) => t.completed)
          .map((task) => (
            <li key={task.id} className="done-item">
              <strong>{task.task}</strong> – completed at {formatTime(task.completedAt)}
            </li>
          ))}
      </ul>

      <h3>❌ Missed Tasks</h3>
      <ul className="history-list">
        {tasks
          .filter((t) => t.reason)
          .map((task) => (
            <li key={task.id} className="fail-item">
              <strong>{task.task}</strong> – missed at {formatTime(task.failedAt)}<br />
              <em>Reason: {task.reason}</em>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default TaskList
