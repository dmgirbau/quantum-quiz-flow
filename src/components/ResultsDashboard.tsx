import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { saveAs } from 'file-saver';
import { ExamSubmission, Exam } from '@/types/exam';

interface ResultsDashboardProps {
  examId: string;
}

interface StudentResult extends ExamSubmission {
  studentName: string;
  percentageScore: number;
}

export function ResultsDashboard({ examId }: ResultsDashboardProps) {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // TODO: Fetch from Supabase
        // const { data: examData } = await supabase
        //   .from('exams')
        //   .select('*')
        //   .eq('id', examId)
        //   .single();
        
        // const { data: submissions } = await supabase
        //   .from('submissions')
        //   .select('*, profiles(name)')
        //   .eq('examId', examId);

        // setExam(examData);
        // setResults(submissions.map(s => ({
        //   ...s,
        //   studentName: s.profiles.name,
        //   percentageScore: (s.score / examData.questions.length) * 100
        // })));
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [examId]);

  const generateStatistics = () => {
    if (!results.length) return null;

    const totalStudents = results.length;
    const averageScore = results.reduce((acc, r) => acc + r.percentageScore, 0) / totalStudents;
    const averageTime = results.reduce((acc, r) => acc + (r.timeSpent || 0), 0) / totalStudents;

    const scoreDistribution = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${(i + 1) * 10}`,
      count: results.filter(r => 
        r.percentageScore >= i * 10 && r.percentageScore < (i + 1) * 10
      ).length
    }));

    return { totalStudents, averageScore, averageTime, scoreDistribution };
  };

  const exportToCsv = () => {
    if (!results.length || !exam) return;

    const headers = [
      'Student Name',
      'Score (%)',
      'Time Spent (minutes)',
      'Submission Date',
      'Questions Correct',
      'Questions Incorrect'
    ];

    const rows = results.map(result => [
      result.studentName,
      result.percentageScore.toFixed(2),
      ((result.timeSpent || 0) / 60).toFixed(2),
      new Date(result.completedAt || '').toLocaleString(),
      result.score,
      exam.questions.length - (result.score || 0)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, `${exam.title}_results.csv`);
  };

  if (loading) {
    return <div>Loading results...</div>;
  }

  const stats = generateStatistics();
  if (!stats || !exam) {
    return <div>No results available</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{exam.title} - Results</h1>
        <Button onClick={exportToCsv}>Export to CSV</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Total Students</h3>
          <p className="text-3xl font-bold">{stats.totalStudents}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Average Score</h3>
          <p className="text-3xl font-bold">{stats.averageScore.toFixed(1)}%</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-2">Average Time</h3>
          <p className="text-3xl font-bold">{(stats.averageTime / 60).toFixed(1)} min</p>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Score Distribution</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Time Spent</TableHead>
                <TableHead>Submission Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id}>
                  <TableCell>{result.studentName}</TableCell>
                  <TableCell>{result.percentageScore.toFixed(1)}%</TableCell>
                  <TableCell>{((result.timeSpent || 0) / 60).toFixed(1)} min</TableCell>
                  <TableCell>
                    {result.completedAt
                      ? new Date(result.completedAt).toLocaleString()
                      : 'In Progress'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        result.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {result.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}
