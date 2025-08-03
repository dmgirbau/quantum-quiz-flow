import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';

interface Exam {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  total_points: number;
  status: string;
  subjects: { name: string };
  topics: { name: string };
  created_at: string;
}

interface ExamAttempt {
  id: string;
  exam_id: string;
  score: number;
  total_possible_score: number;
  percentage: number;
  is_completed: boolean;
  finished_at: string;
}

export const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch available exams
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select(`
          id,
          title,
          description,
          duration_minutes,
          total_points,
          status,
          created_at,
          subjects(name),
          topics(name)
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      // Fetch user's exam attempts
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('exam_attempts')
        .select('*')
        .eq('student_id', user?.id)
        .order('finished_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      setExams(examsData || []);
      setAttempts(attemptsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttemptForExam = (examId: string) => {
    return attempts.find(attempt => attempt.exam_id === examId);
  };

  const getAverageScore = () => {
    const completedAttempts = attempts.filter(attempt => attempt.is_completed);
    if (completedAttempts.length === 0) return 0;
    const sum = completedAttempts.reduce((acc, attempt) => acc + attempt.percentage, 0);
    return Math.round(sum / completedAttempts.length);
  };

  const getTotalExamsCompleted = () => {
    return attempts.filter(attempt => attempt.is_completed).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            ¡Hola, {user?.user_metadata?.first_name || 'Estudiante'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Aquí tienes un resumen de tu progreso académico
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exámenes Completados</p>
                  <p className="text-2xl font-bold">{getTotalExamsCompleted()}</p>
                </div>
                <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-success/10 to-success/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Promedio General</p>
                  <p className="text-2xl font-bold">{getAverageScore()}%</p>
                </div>
                <div className="h-12 w-12 bg-success/20 rounded-full flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent/10 to-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Exámenes Disponibles</p>
                  <p className="text-2xl font-bold">{exams.length}</p>
                </div>
                <div className="h-12 w-12 bg-accent/20 rounded-full flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Exams */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Exámenes Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay exámenes disponibles en este momento</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {exams.map((exam) => {
                  const attempt = getAttemptForExam(exam.id);
                  
                  return (
                    <Card key={exam.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{exam.title}</h3>
                              <Badge variant="secondary">
                                {exam.subjects?.name} - {exam.topics?.name}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground mb-4">{exam.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {exam.duration_minutes} minutos
                              </div>
                              <div className="flex items-center gap-1">
                                <Trophy className="h-4 w-4" />
                                {exam.total_points} puntos
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(exam.created_at).toLocaleDateString()}
                              </div>
                            </div>

                            {attempt && attempt.is_completed && (
                              <div className="mt-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium">Tu resultado:</span>
                                  <Badge variant={attempt.percentage >= 70 ? "default" : "destructive"}>
                                    {attempt.percentage}%
                                  </Badge>
                                </div>
                                <Progress value={attempt.percentage} className="h-2" />
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4">
                            {attempt && attempt.is_completed ? (
                              <Button 
                                variant="outline" 
                                onClick={() => navigate(`/exam/${exam.id}/results`)}
                              >
                                Ver Resultados
                              </Button>
                            ) : (
                              <Button 
                                variant="exam"
                                onClick={() => navigate(`/exam/${exam.id}`)}
                                className="gap-2"
                              >
                                <Play className="h-4 w-4" />
                                {attempt ? 'Continuar' : 'Comenzar'} Examen
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results */}
        {attempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resultados Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {attempts.slice(0, 5).map((attempt) => {
                  const exam = exams.find(e => e.id === attempt.exam_id);
                  if (!exam) return null;

                  return (
                    <div key={attempt.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-3 w-3 rounded-full ${
                          attempt.percentage >= 70 ? 'bg-success' : 'bg-destructive'
                        }`} />
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {attempt.finished_at ? 
                              new Date(attempt.finished_at).toLocaleDateString() : 
                              'En progreso'
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {attempt.is_completed ? `${attempt.percentage}%` : 'En progreso'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.score}/{attempt.total_possible_score} puntos
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};