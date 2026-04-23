'use client';
import { useState } from 'react';

export default function SubscribeEmail() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inputText }),
      });
      if (response.status === 200) {
        setInputText('Subscribed!');
      } else {
        setInputText('Email already exists!');
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="border border-white rounded-lg w-full lg:w-[310px] mt-[10px] pl-3 sm:pl-6 flex justify-between">
        <input
          required
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          type="email"
          className="bg-transparent w-full py-3 placeholder:text-white text-[16px]"
          placeholder="Email Address"
        />
        <button
          type="submit"
          className="text-[14px] flex items-center justify-center w-[140px] border-l border-l-white px-2"
        >
          {loading ? '...' : 'Subscribe'}
        </button>
      </div>
    </form>
  );
}
