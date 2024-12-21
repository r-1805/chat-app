import { useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Регистрация нового пользователя
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Сохраняем информацию о пользователе в Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: email,
          displayName: displayName || email.split('@')[0],
          tag: tag.startsWith('@') ? tag : '@' + tag,
          createdAt: new Date(),
          lastSeen: new Date(),
          bio: '',
          avatarUrl: ''
        });
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-300">
      <div className="bg-dark-200 p-8 rounded-lg shadow-dark w-96 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">
          {isLogin ? 'Login' : 'Register'}
        </h2>
        
        {error && (
          <div className="bg-red-500 text-white p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-gray-300 mb-2" htmlFor="displayName">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue"
                  placeholder="How should we call you?"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2" htmlFor="tag">
                  Username Tag
                </label>
                <input
                  id="tag"
                  type="text"
                  value={tag}
                  onChange={(e) => setTag(e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value)}
                  className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue"
                  placeholder="@username"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-gray-300 mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-700 bg-dark-100 text-white placeholder-gray-500 focus:ring-accent-blue focus:border-accent-blue"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent-blue text-white p-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue transition-colors duration-200"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-4 text-gray-400 hover:text-white transition-colors duration-200"
        >
          {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}
