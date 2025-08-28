import {Routes, Route} from 'react-router-dom';
import RoomAccess from './pages/RoomAccess';
import Lobby from './pages/Lobby';
import Home from './pages/Home';
import Room from './pages/Room';
function App() {
  return (
    <Routes>
      <Route path='/roomAccess' element ={<RoomAccess/>}/>
      <Route path='/' element ={<Home />}/>
      <Route path='/room/:roomName' element ={<Room />}/>
      <Route path='/lobby/:userId' element ={<Lobby/>}/>
    </Routes>
  )
}

export default App
