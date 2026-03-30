import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Trash2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('todo-tasks')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      { id: 1, text: "Welcome to your new Todo List", completed: false, dueDate: null },
      { id: 2, text: "Try adding a new task below", completed: false, dueDate: null }
    ]
  })
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState(null)

  useEffect(() => {
    localStorage.setItem('todo-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (e) => {
    e.preventDefault()
    if (!newTaskText.trim()) return

    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      dueDate: newTaskDate ? newTaskDate.toISOString() : null
    }

    setTasks([...tasks, newTask])
    setNewTaskText("")
    setNewTaskDate(null)
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  return (
    <div className="min-h-screen p-4 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <Card className="w-full max-w-md shadow-xl border-zinc-200 dark:border-zinc-800">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">Todo List</CardTitle>
          <CardDescription>
            You have {tasks.length} task{tasks.length !== 1 ? 's' : ''} remaining.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <form onSubmit={addTask} className="flex gap-2 flex-col sm:flex-row">
            <Input 
              type="text" 
              placeholder="What needs to be done?" 
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-[180px] justify-start text-left font-normal ${!newTaskDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDate ? format(newTaskDate, "PPP") : <span>Set a due date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTaskDate}
                    onSelect={setNewTaskDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Button type="submit">Add</Button>
            </div>
          </form>

          <div className="pt-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-6">All caught up!</p>
            ) : (
              <ul className="space-y-3">
                {tasks.map(task => (
                  <li 
                    key={task.id} 
                    className="flex items-center space-x-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md group"
                  >
                    <Checkbox 
                      id={`task-${task.id}`} 
                      checked={task.completed}
                      onCheckedChange={() => toggleTask(task.id)}
                    />
                    <label 
                      htmlFor={`task-${task.id}`} 
                      className="flex flex-col flex-1 cursor-pointer"
                    >
                      <span className={`text-sm font-medium leading-none transition-colors ${
                        task.completed ? 'text-zinc-400 line-through dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-200'
                      }`}>
                        {task.text}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground flex items-center mt-1">
                          <CalendarIcon className="mr-1 h-3 w-3" />
                          {format(new Date(task.dueDate), "PPP")}
                        </span>
                      )}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTask(task.id)}
                      className="h-8 w-8 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

export default App
