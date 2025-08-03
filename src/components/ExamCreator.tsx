import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Question, QuestionType, Exam } from '@/types/exam';
import { v4 as uuidv4 } from 'uuid';

interface ExamFormData {
  title: string;
  description: string;
  subject: string;
  duration: number;
}

export function ExamCreator() {
  const { register, handleSubmit, formState: { errors } } = useForm<ExamFormData>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const { toast } = useToast();

  const handleAddQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: uuidv4(),
      type,
      text: '',
      points: 1,
      correctAnswer: type === 'true-false' ? false : '',
      options: type === 'multiple-choice' ? ['', '', '', ''] : undefined,
      unit: type === 'numeric' ? '' : undefined,
    };
    setCurrentQuestion(newQuestion);
  };

  const handleQuestionSave = (question: Question) => {
    setQuestions(prev => [...prev, question]);
    setCurrentQuestion(null);
    toast({
      title: 'Question added',
      description: 'The question has been successfully added to the exam.',
    });
  };

  const handleQuestionEdit = (index: number) => {
    setCurrentQuestion(questions[index]);
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionDelete = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    toast({
      title: 'Question removed',
      description: 'The question has been removed from the exam.',
    });
  };

  const onSubmit = async (data: ExamFormData) => {
    if (questions.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one question to the exam.',
        variant: 'destructive',
      });
      return;
    }

    const exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
      ...data,
      questions,
      published: false,
    };

    try {
      // TODO: Save exam to Supabase
      toast({
        title: 'Success',
        description: 'Exam created successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create exam. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Exam</h1>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter exam title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                {...register('description', { required: 'Description is required' })}
                placeholder="Enter exam description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Select onValueChange={(value) => register('subject').onChange({ target: { value } })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                <Input
                  type="number"
                  {...register('duration', {
                    required: 'Duration is required',
                    min: { value: 1, message: 'Duration must be at least 1 minute' },
                  })}
                  placeholder="Enter duration in minutes"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Questions</h2>
          
          <div className="mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddQuestion('multiple-choice')}
              className="mr-2"
            >
              Add Multiple Choice
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddQuestion('true-false')}
              className="mr-2"
            >
              Add True/False
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddQuestion('numeric')}
            >
              Add Numeric
            </Button>
          </div>

          <ScrollArea className="h-[400px] rounded-md border p-4">
            {questions.map((question, index) => (
              <Card key={question.id} className="p-4 mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Question {index + 1}</p>
                    <p className="text-sm text-gray-600">{question.text}</p>
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuestionEdit(index)}
                      className="mr-2"
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuestionDelete(index)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </ScrollArea>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Preview
          </Button>
          <Button type="submit">Create Exam</Button>
        </div>
      </form>

      {currentQuestion && (
        // Question editor modal will be implemented here
        <div>Question Editor Modal</div>
      )}
    </div>
  );
}
