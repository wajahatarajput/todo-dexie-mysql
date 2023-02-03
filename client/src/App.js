import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import './App.css';
import 'font-awesome/css/font-awesome.min.css';
import axios from 'axios';

const db = new Dexie('todoApp')
db.version(1).stores({
  todos: '++id,task,completed',
})

const { todos } = db;

const App = () => {
  const [input,setInput] = useState("");
  const allItems = useLiveQuery(() => todos.toArray(), []);

  useEffect(()=>{
    getData();
    return( ()=>{
      todos.clear();
      db.delete();
      setInput([]);
      
    }
    )
  },[]);

  const addTask = async (event) => {
    event.preventDefault();
    await axios.post('http://localhost:8000/query',{query:`INSERT INTO todo(task, completed) VALUES ('${input}',0)`}).then(async (res)=>{
      getData();
      setInput("");
    });
   

    
  }

const getData = async ()=>{
 await axios.post('http://localhost:8000/query',{query:'select * from todo; '}).then((res)=>{
    res.data.map(async ({id,task,completed})=>{
        await todos.add({
          id:id,
          task: task,
          completed: !!completed,
        }).then((res)=>{
          console.log(res)
        });
    })
  });
}

const updateData = async (id,status)=>{
  await axios.post('http://localhost:8000/query',{query:`UPDATE todo SET completed=${status} WHERE id=${id} `}).then(async (res)=>{
        await todos.update(id, { completed: status });
   });
 }


  const deleteTask = async (id) => {
    await axios.post('http://localhost:8000/query',{query:`DELETE FROM todo WHERE id=${id} `}).then(async (res)=>{
      todos.delete(id);
 });
 
  }

  const toggleStatus = async (id, event) => {
    updateData(id,!!event.target.checked);
  }

  return (
    <div className="container">
      <h3 className="red-text center-align">Test App </h3>
      <form className="add-item-form" onSubmit={addTask}>
        <input type="text" onChange={e=>setInput(e.target.value)} placeholder="Enter a task to add!" required />
        <input type="submit" value="Add To Do" className="waves-effect btn blue right"/>
      </form>

      <div className="card white darken-1">
        <div className="card-content">
          {!allItems?.length && <p className="center-align">No tasks To Do!</p>}

          {allItems?.map(({ id, task, completed }) => (
            <div className="row" key={id}>
              <p className="col s10">
                <label>
                  <input
                    type="checkbox"
                    checked={completed}
                    className="checkbox-blue"
                    onChange={(event) => toggleStatus(id, event)}
                  />
                  <span className="black-text">{task}</span>
                </label>
              </p>
              <i className="fa fa-trash" style={{fontSize:20}} onClick={() => deleteTask(id)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
