import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Landing from './components/Landing';
import ChatPage from './components/ChatPage';
import './App.css';

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Landing/>}/>
        <Route path='/chat' element={<ChatPage/>}/>
        <Route/>
      </Routes>
    </Router>
  )
}

export default App
