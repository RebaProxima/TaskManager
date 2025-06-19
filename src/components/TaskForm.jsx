import React, { useState } from 'react'
import { db, auth } from '../firebase'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { toast } from 'react-toastify'

function TaskForm() {
  const [task, setTask] = useState('');
  const [type, setType] = useState('standard');
  const [reminderTime, setReminderTime] = useState('');
  const [sleepStart, setSleepStart] = useState('');
  const [sleepEnd, setSleepEnd] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      toast.error('You must be logged in to add a task.');
      return;
    }

    if (!task) return toast.warning('Please enter a task name.');

    const newTask = {
      task,
      type,
      completed: false,
      createdAt: Timestamp.now(),
      userId: user.uid, // ✅ this is essential!
    };

    if (type === 'standard') {
      if (!reminderTime) return toast.warning('Select a reminder time.');
      newTask.dueTime = Timestamp.fromDate(new Date(reminderTime));
    } else {
      if (!sleepStart || !sleepEnd) return toast.warning('Select both start and end time.');
      newTask.startTime = Timestamp.fromDate(new Date(sleepStart));
      newTask.endTime = Timestamp.fromDate(new Date(sleepEnd));
    }

    try {
      await addDoc(collection(db, 'tasks'), newTask);
      toast.success('✅ Task added successfully!');
      setTask('');
      setReminderTime('');
      setSleepStart('');
      setSleepEnd('');
    } catch (err) {
      console.error('Error adding task:', err);
      toast.error('❌ Failed to add task.');
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label>
        Task Name:
        <input
          type="text"
          placeholder="e.g. Study, Jog, Sleep"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          required
        />
      </label>

      <label>
        Task Type:
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="standard">Standard Task</option>
          <option value="sleep">Sleep</option>
        </select>
      </label>

      {type === 'standard' ? (
        <label>
          Reminder Time:
          <input
            type="datetime-local"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            required
          />
        </label>
      ) : (
        <>
          <label>
            Sleep Start:
            <input
              type="datetime-local"
              value={sleepStart}
              onChange={(e) => setSleepStart(e.target.value)}
              required
            />
          </label>
          <label>
            Sleep End:
            <input
              type="datetime-local"
              value={sleepEnd}
              onChange={(e) => setSleepEnd(e.target.value)}
              required
            />
          </label>
        </>
      )}

      <button type="submit">➕ Add Task</button>
    </form>
  );
}

export default TaskForm
