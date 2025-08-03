import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Exam,
  Question,
  ExamSubmission,
  ExamSessionState,
  QuestionState
} from '@/types/exam';

export function ExamTaker() {
  const { examId } = useParams();
  const { toast } = useToast();
  const [exam, setExam] = useState<Exam | null>(null);
  const [sessionState, setSessionState] = useState<ExamSessionState>({
    examId: examId || '',
    currentQuestionIndex: 0,
    timeRemaining: 0,
    questions: [],
    isFullscreen: false,
  });

  const [submission, setSubmission] = useState<ExamSubmission>({
    id: crypto.randomUUID(),
    examId: examId || '',
    userId: '', // TODO: Get from auth context
    startedAt: new Date().toISOString(),
    answers: [],
    status: 'in-progress',
  });

  useEffect(() => {
    const loadExam = async () => {
      try {
        // TODO: Load exam from Supabase
        // const { data: examData } = await supabase
        //   .from('exams')
        //   .select('*')
        //   .eq('id', examId)
        //   .single();
        
        // if (examData) {
        //   setExam(examData);
        //   setSessionState(prev => ({
        //     ...prev,
        //     timeRemaining: examData.duration * 60,
        //     questions: examData.questions.map(q => ({
        //       id: q.id,
        //       status: 'unread'
        //     }))
        //   }));
        // }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load exam. Please try again.',
          variant: 'destructive',
        });
      }
    };

    loadExam();
  }, [examId, toast]);

  useEffect(() => {
    if (!sessionState.timeRemaining) return;

    const timer = setInterval(() => {
      setSessionState(prev => ({
        ...prev,
        timeRemaining: prev.timeRemaining - 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionState.timeRemaining]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // TODO: Log attempt to leave page
        toast({
          title: 'Warning',
          description: 'Leaving the exam page was detected. This will be reported.',
          variant: 'destructive',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [toast]);

  const handleAnswer = useCallback((questionId: string, answer: string | boolean | number) => {
    setSubmission(prev => ({
      ...prev,
      answers: [
        ...prev.answers.filter(a => a.questionId !== questionId),
        { questionId, answer }
      ]
    }));

    setSessionState(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.id === questionId ? { ...q, status: 'answered', answer } : q
      )
    }));
  }, []);

  const handleQuestionNavigation = (index: number) => {
    if (index >= 0 && index < (exam?.questions.length || 0)) {
      setSessionState(prev => ({
        ...prev,
        currentQuestionIndex: index,
        questions: prev.questions.map((q, i) =>
          i === index && q.status === 'unread' ? { ...q, status: 'read' } : q
        )
      }));
    }
  };

  const handleSubmitExam = async () => {
    try {
      const finalSubmission: ExamSubmission = {
        ...submission,
        completedAt: new Date().toISOString(),
        status: 'completed',
        timeSpent: (exam?.duration || 0) * 60 - sessionState.timeRemaining
      };

      // TODO: Submit to Supabase
      // await supabase.from('submissions').insert(finalSubmission);

      toast({
        title: 'Success',
        description: 'Your exam has been submitted successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit exam. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!exam) {
    return <div>Loading...</div>;
  }

  const currentQuestion = exam.questions[sessionState.currentQuestionIndex];
  const progress = (submission.answers.length / exam.questions.length) * 100;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Main exam area */}
        <div className="col-span-9">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{exam.title}</h1>
              <div className="text-xl font-mono">
                {formatTime(sessionState.timeRemaining)}
              </div>
            </div>

            <Progress value={progress} className="mb-6" />

            <div className="space-y-6">
              <div className="text-lg font-medium">
                Question {sessionState.currentQuestionIndex + 1} of {exam.questions.length}
              </div>

              <div className="space-y-4">
                <p>{currentQuestion.text}</p>
                
                {currentQuestion.imageUrl && (
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-h-60 object-contain"
                  />
                )}

                <div className="mt-4">
                  {currentQuestion.type === 'multiple-choice' && (
                    <div className="space-y-2">
                      {currentQuestion.options?.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full justify-start ${
                            submission.answers.find(a => a.questionId === currentQuestion.id)?.answer === String(index)
                              ? 'bg-primary/10'
                              : ''
                          }`}
                          onClick={() => handleAnswer(currentQuestion.id, String(index))}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}

                  {currentQuestion.type === 'true-false' && (
                    <div className="flex space-x-4">
                      <Button
                        variant="outline"
                        className={
                          submission.answers.find(a => a.questionId === currentQuestion.id)?.answer === true
                            ? 'bg-primary/10'
                            : ''
                        }
                        onClick={() => handleAnswer(currentQuestion.id, true)}
                      >
                        True
                      </Button>
                      <Button
                        variant="outline"
                        className={
                          submission.answers.find(a => a.questionId === currentQuestion.id)?.answer === false
                            ? 'bg-primary/10'
                            : ''
                        }
                        onClick={() => handleAnswer(currentQuestion.id, false)}
                      >
                        False
                      </Button>
                    </div>
                  )}

                  {currentQuestion.type === 'numeric' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        className="w-40 px-3 py-2 border rounded-md"
                        value={
                          (() => {
                            const answer = submission.answers.find(a => a.questionId === currentQuestion.id)?.answer;
                            return typeof answer === 'number' ? answer : ''
                          })()
                        }
                        onChange={(e) => handleAnswer(currentQuestion.id, Number(e.target.value))}
                        step="any"
                      />
                      {currentQuestion.unit && (
                        <span className="text-gray-600">{currentQuestion.unit}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => handleQuestionNavigation(sessionState.currentQuestionIndex - 1)}
                disabled={sessionState.currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              {sessionState.currentQuestionIndex === exam.questions.length - 1 ? (
                <Button onClick={handleSubmitExam}>Submit Exam</Button>
              ) : (
                <Button
                  onClick={() => handleQuestionNavigation(sessionState.currentQuestionIndex + 1)}
                >
                  Next
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* Question navigation sidebar */}
        <div className="col-span-3">
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Questions</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-4 gap-2">
                {sessionState.questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={q.status === 'answered' ? 'default' : 'outline'}
                    className={`aspect-square ${
                      sessionState.currentQuestionIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleQuestionNavigation(index)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
