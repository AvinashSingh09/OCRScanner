import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();

        const adminUser = import.meta.env.VITE_ADMIN_USERNAME;
        const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;

        if (username === adminUser && password === adminPass) {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/');
        } else {
            setError('Invalid credentials. Access Denied.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF8F5] font-sans text-[#1C1917]">
            <div className="w-full max-w-md bg-white border border-[#1C1917] p-8 md:p-10 shadow-[6px_6px_0px_0px_rgba(28,25,23,0.1)] relative">
                {/* Minimal Top Corner Details */}
                <div className="absolute top-3 left-3 text-[10px] font-mono tracking-widest text-stone-400">
                    OCR SCANNER
                </div>
                <div className="absolute top-3 right-3 text-[10px] font-mono tracking-widest text-stone-400">
                    LOGIN
                </div>

                <div className="text-center mt-4 mb-8">
                    <h1 className="text-4xl font-serif font-light text-[#1C1917] tracking-tight mb-2">
                        Admin Login
                    </h1>
                    <div className="w-12 h-[1px] bg-[#1C1917] mx-auto my-3" />
                    <p className="text-xs font-mono tracking-widest text-stone-500 uppercase">
                        Please sign in to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-[11px] font-mono tracking-widest text-stone-600 uppercase mb-2">
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-300 rounded-none text-[#1C1917] placeholder-stone-400/60 focus:outline-none focus:border-[#1C1917] font-sans text-sm transition-colors"
                            placeholder="Enter username"
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-mono tracking-widest text-stone-600 uppercase mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FAF8F5] border border-stone-300 rounded-none text-[#1C1917] placeholder-stone-400/60 focus:outline-none focus:border-[#1C1917] font-sans text-sm transition-colors"
                            placeholder="Enter password"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-mono text-center">
                            ✕ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3.5 px-4 bg-[#1C1917] hover:bg-stone-800 text-[#FAF8F5] font-sans font-medium uppercase tracking-widest text-xs transition-colors shadow-sm duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                        Sign In
                        <span className="text-sm font-light">→</span>
                    </button>
                </form>

                {/* Aesthetic Footer Detail */}
                <div className="mt-8 pt-4 border-t border-stone-200 text-center">
                    <p className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
                        OCR Scanner Studio
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

