import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Trash2, CalendarIcon, Pencil, Check, X, Search, GripVertical } from 'lucide-react'
import { format } from 'date-fns'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const CATEGORIES = ["Personal", "Work", "Errands", "Health", "Other"]

function SortableTask({ 
  task, 
  toggleTask, 
  startEditing, 
  deleteTask, 
  editingTaskId, 
  editingText, 
  setEditingText, 
  saveEdit, 
  cancelEditing, 
  editingCategory, 
  setEditingCategory, 
  isDragDisabled 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id, disabled: isDragDisabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-3 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-sm transition-all hover:shadow-md group ${isDragging ? 'opacity-50 ring-2 ring-primary/20' : ''}`}
    >
      {!isDragDisabled && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500">
          <GripVertical className="h-4 w-4" />
        </div>
      )}
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => toggleTask(task.id)}
      />

      {editingTaskId === task.id ? (
        <div className="flex-1 flex flex-col sm:flex-row gap-2">
          <Input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveEdit(task.id)
              if (e.key === 'Escape') cancelEditing()
            }}
            className="h-8 flex-1"
            autoFocus
          />
          <div className="flex gap-2 items-center">
            <Select value={editingCategory} onValueChange={setEditingCategory}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => saveEdit(task.id)}
              className="h-8 w-8 shrink-0 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={cancelEditing}
              className="h-8 w-8 shrink-0 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <>
          <label
            htmlFor={`task-${task.id}`}
            className="flex flex-col flex-1 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm font-medium leading-none transition-colors ${task.completed ? 'text-zinc-400 line-through dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-200'
                }`}>
                {task.text}
              </span>
              {task.category && (
                <Badge variant={task.completed ? "outline" : "secondary"} className="text-[10px] px-1.5 py-0 h-4">
                  {task.category}
                </Badge>
              )}
            </div>
            {task.dueDate && (
              <span className="text-xs text-muted-foreground flex items-center mt-1.5">
                <CalendarIcon className="mr-1 h-3 w-3" />
                {format(new Date(task.dueDate), "PPP")}
              </span>
            )}
          </label>
          <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEditing(task)}
              className="h-8 w-8 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30"
              aria-label="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteTask(task.id)}
              className="h-8 w-8 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </li>
  );
}

function App() {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('todo-tasks')
    if (saved) {
      return JSON.parse(saved)
    }
    return [
      { id: 1, text: "Welcome to your new Todo List", completed: false, dueDate: null, category: "Personal" },
      { id: 2, text: "Try adding a new task below", completed: false, dueDate: null, category: "Work" }
    ]
  })
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskDate, setNewTaskDate] = useState(null)
  const [newTaskCategory, setNewTaskCategory] = useState("Other")

  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editingText, setEditingText] = useState("")
  const [editingCategory, setEditingCategory] = useState("Other")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
      dueDate: newTaskDate ? newTaskDate.toISOString() : null,
      category: newTaskCategory
    }

    setTasks([...tasks, newTask])
    setNewTaskText("")
    setNewTaskDate(null)
    setNewTaskCategory("Other")
  }

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const startEditing = (task) => {
    setEditingTaskId(task.id)
    setEditingText(task.text)
    setEditingCategory(task.category || "Other")
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditingText("")
    setEditingCategory("Other")
  }

  const saveEdit = (id) => {
    if (!editingText.trim()) return
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, text: editingText.trim(), category: editingCategory } : task
    ))
    setEditingTaskId(null)
    setEditingText("")
    setEditingCategory("Other")
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase())
    if (filterType === "active") return matchesSearch && !task.completed
    if (filterType === "completed") return matchesSearch && task.completed
    return matchesSearch
  })

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
              placeholder="Task"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="flex-1"
            />
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`flex-1 sm:w-[150px] justify-start text-left font-normal ${!newTaskDate && "text-muted-foreground"}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTaskDate ? format(newTaskDate, "PPP") : <span>Date</span>}
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

          {tasks.length > 0 && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                />
              </div>
              
              <Tabs defaultValue="all" onValueChange={setFilterType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div className="pt-2">
            {tasks.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-6">All caught up!</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-6">No tasks match your search.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredTasks.map(t => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-3">
                    {filteredTasks.map(task => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        toggleTask={toggleTask}
                        startEditing={startEditing}
                        deleteTask={deleteTask}
                        editingTaskId={editingTaskId}
                        editingText={editingText}
                        setEditingText={setEditingText}
                        saveEdit={saveEdit}
                        cancelEditing={cancelEditing}
                        editingCategory={editingCategory}
                        setEditingCategory={setEditingCategory}
                        isDragDisabled={filterType !== "all" || searchQuery !== ""}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  )
}

export default App
