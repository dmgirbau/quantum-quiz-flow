import { useAuth } from '@/hooks/useAuth';
import { StudentDashboard } from '@/components/StudentDashboard';
import { ProfessorDashboard } from '@/components/ProfessorDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';

const Dashboard = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'professor':
      return <ProfessorDashboard />;
    case 'student':
    default:
      return <StudentDashboard />;
  }
};

export default Dashboard;