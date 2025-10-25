'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ReviewFormProps {
  transactionId: string;
}

export default function ReviewForm({ transactionId }: ReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, rating, comment }),
    });
    alert('Recenzja dodana!');
  };

  return (
    <div className="mt-4">
      <h2>Oceń Transakcję</h2>
      <Input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} />
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Komentarz" />
      <Button onClick={submitReview}>Wyślij Recenzję</Button>
    </div>
  );
}
