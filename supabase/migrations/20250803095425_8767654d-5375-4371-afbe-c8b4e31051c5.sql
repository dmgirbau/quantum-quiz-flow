-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'professor', 'student');
CREATE TYPE public.question_type AS ENUM ('multiple_choice', 'true_false', 'numeric_with_unit');
CREATE TYPE public.question_status AS ENUM ('not_visited', 'visited', 'answered');
CREATE TYPE public.exam_status AS ENUM ('draft', 'published', 'archived');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create subjects table
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create topics table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exams table
CREATE TABLE public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  total_points DECIMAL(5,2) DEFAULT 0,
  status exam_status DEFAULT 'draft',
  instructions TEXT,
  show_results_immediately BOOLEAN DEFAULT true,
  allow_review BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  points DECIMAL(5,2) DEFAULT 1,
  correct_answer TEXT,
  correct_numeric_value DECIMAL(10,4),
  correct_unit TEXT,
  explanation TEXT,
  image_url TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question_options table (for multiple choice)
CREATE TABLE public.question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exam_attempts table
CREATE TABLE public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES public.exams(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER,
  score DECIMAL(5,2),
  total_possible_score DECIMAL(5,2),
  percentage DECIMAL(5,2),
  is_completed BOOLEAN DEFAULT false,
  tab_switches INTEGER DEFAULT 0,
  fullscreen_exits INTEGER DEFAULT 0,
  UNIQUE(exam_id, student_id)
);

-- Create student_answers table
CREATE TABLE public.student_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  selected_option_id UUID REFERENCES public.question_options(id) ON DELETE CASCADE,
  answer_text TEXT,
  numeric_value DECIMAL(10,4),
  unit TEXT,
  is_correct BOOLEAN,
  points_earned DECIMAL(5,2) DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attempt_id, question_id)
);

-- Create question_navigation table to track question status
CREATE TABLE public.question_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.exam_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  status question_status DEFAULT 'not_visited',
  visited_at TIMESTAMP WITH TIME ZONE,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(attempt_id, question_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_navigation ENABLE ROW LEVEL SECURITY;

-- Create security definer function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS app_role
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT role FROM public.user_roles WHERE user_roles.user_id = $1 LIMIT 1;
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for user_roles
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for subjects
CREATE POLICY "Everyone can view subjects" ON public.subjects
  FOR SELECT USING (true);

CREATE POLICY "Admins and professors can manage subjects" ON public.subjects
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'professor'));

-- Create RLS policies for topics
CREATE POLICY "Everyone can view topics" ON public.topics
  FOR SELECT USING (true);

CREATE POLICY "Admins and professors can manage topics" ON public.topics
  FOR ALL USING (public.get_user_role(auth.uid()) IN ('admin', 'professor'));

-- Create RLS policies for exams
CREATE POLICY "Students can view published exams" ON public.exams
  FOR SELECT USING (
    status = 'published' OR 
    public.get_user_role(auth.uid()) IN ('admin', 'professor') OR
    created_by = auth.uid()
  );

CREATE POLICY "Professors can manage their exams" ON public.exams
  FOR ALL USING (
    created_by = auth.uid() OR 
    public.get_user_role(auth.uid()) = 'admin'
  );

CREATE POLICY "Professors can create exams" ON public.exams
  FOR INSERT WITH CHECK (
    public.get_user_role(auth.uid()) IN ('admin', 'professor')
  );

-- Create RLS policies for questions
CREATE POLICY "Users can view questions of accessible exams" ON public.questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.exams e 
      WHERE e.id = exam_id AND (
        e.status = 'published' OR 
        e.created_by = auth.uid() OR
        public.get_user_role(auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "Professors can manage questions for their exams" ON public.questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.exams e 
      WHERE e.id = exam_id AND (
        e.created_by = auth.uid() OR
        public.get_user_role(auth.uid()) = 'admin'
      )
    )
  );

-- Create RLS policies for question_options
CREATE POLICY "Users can view options of accessible questions" ON public.question_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.exams e ON e.id = q.exam_id
      WHERE q.id = question_id AND (
        e.status = 'published' OR 
        e.created_by = auth.uid() OR
        public.get_user_role(auth.uid()) = 'admin'
      )
    )
  );

CREATE POLICY "Professors can manage options for their questions" ON public.question_options
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.questions q
      JOIN public.exams e ON e.id = q.exam_id
      WHERE q.id = question_id AND (
        e.created_by = auth.uid() OR
        public.get_user_role(auth.uid()) = 'admin'
      )
    )
  );

-- Create RLS policies for exam_attempts
CREATE POLICY "Students can view their own attempts" ON public.exam_attempts
  FOR SELECT USING (
    student_id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('admin', 'professor')
  );

CREATE POLICY "Students can create their own attempts" ON public.exam_attempts
  FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Students can update their own attempts" ON public.exam_attempts
  FOR UPDATE USING (student_id = auth.uid());

-- Create RLS policies for student_answers
CREATE POLICY "Students can manage their own answers" ON public.student_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.exam_attempts ea
      WHERE ea.id = attempt_id AND ea.student_id = auth.uid()
    ) OR
    public.get_user_role(auth.uid()) IN ('admin', 'professor')
  );

-- Create RLS policies for question_navigation
CREATE POLICY "Students can manage their own navigation" ON public.question_navigation
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.exam_attempts ea
      WHERE ea.id = attempt_id AND ea.student_id = auth.uid()
    ) OR
    public.get_user_role(auth.uid()) IN ('admin', 'professor')
  );

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email
  );
  
  -- Assign default student role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'student');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample data
INSERT INTO public.subjects (name, description) VALUES
('Physics', 'Study of matter, energy, and their interactions'),
('Mathematics', 'Study of numbers, quantities, shapes, and patterns');

INSERT INTO public.topics (subject_id, name, description) VALUES
((SELECT id FROM public.subjects WHERE name = 'Physics'), 'Mechanics', 'Study of motion and forces'),
((SELECT id FROM public.subjects WHERE name = 'Physics'), 'Thermodynamics', 'Study of heat and energy transfer'),
((SELECT id FROM public.subjects WHERE name = 'Mathematics'), 'Algebra', 'Study of mathematical symbols and operations'),
((SELECT id FROM public.subjects WHERE name = 'Mathematics'), 'Calculus', 'Study of continuous change and motion');