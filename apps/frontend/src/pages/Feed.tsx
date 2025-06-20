import { useAuth } from '../context/AuthContext';

const Feed = () => {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Welcome, {user?.username} 👋</h2>
      <img src={user?.avatar} alt="avatar" className="w-16 h-16 rounded-full" />
      <p>This is your feed. Coming soon...</p>
    </div>
  );
};

export default Feed;
