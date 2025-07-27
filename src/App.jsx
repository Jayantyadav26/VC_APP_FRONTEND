import {Routes, Route} from 'react-router-dom';
import RoomAccess from './pages/RoomAccess';
import Lobby from './pages/Lobby';

function App() {
  return (
    <Routes>
      <Route path='/' element ={<RoomAccess/>}/>
      <Route path='/lobby/:userId' element ={<Lobby/>}/>
    </Routes>
  )
}

export default App
