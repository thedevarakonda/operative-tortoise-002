import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Feed from './pages/Feed';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import Register from './pages/Register';
import NewPost from './pages/NewPost'
import EditPost from './pages/EditPost';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import PostDetail from './pages/PostDetail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute><Feed /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="register" element={<Register/>}/>
          <Route
            path="/feed"
            element={
              <PrivateRoute>
                <Feed />
              </PrivateRoute>
            }
          />
          <Route path="/new" element={<PrivateRoute><NewPost /></PrivateRoute>} />
          <Route path="/edit/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
          <Route path="/profile/:username" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
          <Route path="/post/:id" element={<PostDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;