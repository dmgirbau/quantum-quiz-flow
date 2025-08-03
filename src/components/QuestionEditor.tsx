import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Question } from '@/types/exam';

interface QuestionEditorProps {
  question: Question;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

export function QuestionEditor({ question, onSave, onCancel }: QuestionEditorProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question>(question);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleTextChange = (text: string) => {
    setCurrentQuestion((prev) => ({ ...prev, text }));
  };

  const handlePointsChange = (points: string) => {
    setCurrentQuestion((prev) => ({ ...prev, points: Number(points) }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // TODO: Upload image to storage and get URL
      // const imageUrl = await uploadImage(file);
      // setCurrentQuestion((prev) => ({ ...prev, imageUrl }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    if (currentQuestion.type === 'multiple-choice' && currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
    }
  };

  const handleCorrectAnswerChange = (value: string | boolean | number) => {
    setCurrentQuestion((prev) => ({ ...prev, correctAnswer: value }));
  };

  const handleUnitChange = (unit: string) => {
    if (currentQuestion.type === 'numeric') {
      setCurrentQuestion((prev) => ({ ...prev, unit }));
    }
  };

  const renderQuestionTypeFields = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleCorrectAnswerChange(String(index))}
                  className={currentQuestion.correctAnswer === String(index) ? 'bg-green-100' : ''}
                >
                  Correct
                </Button>
              </div>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={currentQuestion.correctAnswer === true}
                onCheckedChange={() => handleCorrectAnswerChange(true)}
              />
              <Label>True is correct</Label>
            </div>
          </div>
        );

      case 'numeric':
        return (
          <div className="space-y-4">
            <div>
              <Label>Correct Answer</Label>
              <Input
                type="number"
                value={(() => {
                  const answer = currentQuestion.correctAnswer;
                  return typeof answer === 'number' ? answer : '';
                })()}
                onChange={(e) => handleCorrectAnswerChange(Number(e.target.value))}
                placeholder="Enter correct numeric value"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Input
                value={currentQuestion.unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                placeholder="Enter unit (e.g., m/s, kg, N)"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open onOpenChange={() => onCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {question.id ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label>Question Text</Label>
            <Textarea
              value={currentQuestion.text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter your question"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={currentQuestion.points}
              onChange={(e) => handlePointsChange(e.target.value)}
              min={1}
              className="mt-1 w-24"
            />
          </div>

          <div>
            <Label>Image (optional)</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1"
            />
            {currentQuestion.imageUrl && (
              <img
                src={currentQuestion.imageUrl}
                alt="Question"
                className="mt-2 max-h-40 object-contain"
              />
            )}
          </div>

          {renderQuestionTypeFields()}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave(currentQuestion)}>
              Save Question
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
