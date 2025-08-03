import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FeedbackGeneratorProps {
  correctAnswers: number;
  totalQuestions: number;
  subject: string;
  timeSpent: number;
}

export function FeedbackGenerator({
  correctAnswers,
  totalQuestions,
  subject,
  timeSpent
}: FeedbackGeneratorProps) {
  const [feedback, setFeedback] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      const score = (correctAnswers / totalQuestions) * 100;
      const timePerQuestion = timeSpent / totalQuestions;
      
      const prompt = `As a helpful tutor, provide encouraging feedback for a student who:
- Scored ${score.toFixed(1)}% (${correctAnswers}/${totalQuestions} correct)
- Spent an average of ${timePerQuestion.toFixed(1)} seconds per question
- Took an exam in ${subject}

Provide specific advice for improvement while maintaining a positive tone.`;

      const response = await fetch(
        'https://api-inference.huggingface.co/models/google/flan-t5-large',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: prompt }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate feedback');
      }

      const data = await response.json();
      setFeedback(data[0].generated_text);
    } catch (error) {
      console.error('Error generating feedback:', error);
      setFeedback('I appreciate your effort in completing this exam. Keep practicing and don\'t hesitate to ask for help when needed!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Personalized Feedback</h2>
      
      {!feedback && !isLoading && (
        <Button onClick={generateFeedback}>
          Generate Feedback
        </Button>
      )}

      {isLoading && (
        <div className="flex items-center space-x-2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span>Generating personalized feedback...</span>
        </div>
      )}

      {feedback && (
        <div className="prose">
          <p className="text-lg">{feedback}</p>
          
          <div className="mt-4">
            <h3 className="text-lg font-medium">Quick Tips:</h3>
            <ul className="list-disc list-inside">
              <li>Review questions where you spent more time than average</li>
              <li>Practice similar problems to build confidence</li>
              <li>Consider studying with a peer to share knowledge</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
