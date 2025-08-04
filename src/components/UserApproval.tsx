import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Check, X, Clock } from 'lucide-react';

interface PendingUser {
  id: string;
  user_id: string;
  role: 'admin' | 'professor' | 'student' | 'pending_student' | 'pending_professor';
  status: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
}

const UserApproval = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAdmin) {
      fetchPendingUsers();
    }
  }, [isAdmin]);

  const fetchPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          status,
          created_at
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch profile data separately
      const usersWithProfiles = await Promise.all(
        (data || []).map(async (userRole) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name, email')
            .eq('id', userRole.user_id)
            .single();
          
          return {
            ...userRole,
            first_name: profile?.first_name || '',
            last_name: profile?.last_name || '',
            email: profile?.email || ''
          };
        })
      );
      
      setPendingUsers(usersWithProfiles);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios pendientes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveUser = async (userId: string, role: 'admin' | 'professor' | 'student' | 'pending_student' | 'pending_professor') => {
    try {
      const { error } = await supabase.rpc('approve_user_role', {
        target_user_id: userId,
        approved_role: role
      });

      if (error) throw error;

      toast({
        title: 'Usuario aprobado',
        description: 'El usuario ha sido aprobado exitosamente',
      });

      fetchPendingUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo aprobar el usuario',
        variant: 'destructive',
      });
    }
  };

  const rejectUser = async (userRoleId: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ status: 'rejected' })
        .eq('id', userRoleId);

      if (error) throw error;

      toast({
        title: 'Usuario rechazado',
        description: 'La solicitud ha sido rechazada',
      });

      fetchPendingUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudo rechazar el usuario',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Usuarios Pendientes de Aprobación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Usuarios Pendientes de Aprobación
          <Badge variant="secondary">{pendingUsers.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingUsers.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay usuarios pendientes de aprobación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center text-white font-medium">
                      {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {user.first_name} {user.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={user.role === 'professor' ? 'default' : 'secondary'}>
                          {user.role === 'professor' ? 'Profesor' : 'Estudiante'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="exam"
                    onClick={() => approveUser(user.user_id, user.role)}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-4 w-4" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectUser(user.id)}
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                    Rechazar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserApproval;