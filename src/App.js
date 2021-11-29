/* eslint-disable jsx-a11y/anchor-is-valid */
import './App.css';
import { useState } from 'react';
import classNames from 'classnames';
import { db } from './firebase';
import { collection, addDoc, getDocs } from "firebase/firestore";

const getKey = () => Math.random().toString(32).substring(2);

function Todo() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');

  const f = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "todo"));
      const todoList = []
      await querySnapshot.forEach((doc) => {
        todoList.push(doc.data());
      });
      setItems(todoList);
    } catch (e) {
      console.log("Error adding document: ", e);
    }
  }
  f()

  const handleAdd = text => {
    setItems([...items, { key: getKey(), text, done: false }]);
  };

  const handleFilterChange = value => setFilter(value);

  const displayItems = items.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'TODO') return !item.done;
    if (filter === 'DONE') return item.done;
  });

  const handleCheck = checked => {
    const newItems = items.map(item => {
      if (item.key === checked.key) {
        item.done = !item.done;
      }
      return item;
    });
    setItems(newItems);
  };

  return (
    <div className="panel">
      <div className="panel-heading">
        <span>⚛️ React ToDo</span>
      </div>
      <Input onAdd={handleAdd} />
      <Filter
        onChange={handleFilterChange}
        value={filter}
      />
      {displayItems.map(item => (
        <TodoItem
          key={item.text}
          item={item}
          onCheck={handleCheck}
         />
      ))}
      <div className="panel-block">
        {displayItems.length} items
      </div>
    </div>
  );
}

function Input({ onAdd }) {
  const [text, setText] = useState('');

  const handleChange = e => setText(e.target.value);

  const handleKeyDown = async e => {
    if (e.key === 'Enter') {
      await addDoc(collection(db, "todo"), {
        id: '',
        text: text,
        done: false
      });
      onAdd(text);
      setText('');
    }
  };

  return (
    <div className="panel-block">
      <input
        className="input"
        type="text"
        placeholder="Enter to add"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

function Filter({ value, onChange }) {
  const handleClick = (key, e) => {
    e.preventDefault();
    onChange(key);
  };

  return (
    <div className="panel-tabs">
      <a
        href="#"
        onClick={handleClick.bind(null, 'ALL')}
        className={classNames({ 'is-active': value === 'ALL' })}
      >All</a>
      <a
        href="#"
        onClick={handleClick.bind(null, 'TODO')}
        className={classNames({ 'is-active': value === 'TODO' })}
      >ToDo</a>
      <a
        href="#"
        onClick={handleClick.bind(null, 'DONE')}
        className={classNames({ 'is-active': value === 'DONE' })}
      >Done</a>
    </div>
  );
}

function TodoItem({ item, onCheck }) {
  const handleChange = () => {
    onCheck(item);
  };

  return (
    <label className="panel-block">
      <input
        type="checkbox"
        checked={item.done}
        onChange={handleChange}
      />
      <span
        className={classNames({
          'has-text-grey-light': item.done
        })}
      >
        {item.text}
      </span>
    </label>
  );
}

function App() {
  return (
    <div className="container is-fluid">
      <Todo />
    </div>
  );
}

export default App;