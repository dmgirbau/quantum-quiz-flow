-- Create enum types
CREATE TYPE question_type AS ENUM ('multiple-choice', 'true-false', 'numeric');
CREATE TYPE submission_status AS ENUM ('in-progress', 'completed', 'abandoned');

-- Create questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type question_type NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    options TEXT[], -- For multiple choice questions
    correct_answer JSONB NOT NULL, -- Stores string/boolean/number as JSON
    unit TEXT, -- For numeric questions
    points INTEGER NOT NULL DEFAULT 1,
    exam_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create exams table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id),
    published BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add foreign key constraint to questions table
ALTER TABLE questions
ADD CONSTRAINT fk_exam
FOREIGN KEY (exam_id)
REFERENCES exams(id)
ON DELETE CASCADE;

-- Create exam submissions table
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES exams(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    score NUMERIC,
    time_spent INTEGER, -- in seconds
    status submission_status NOT NULL DEFAULT 'in-progress',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create submission answers table
CREATE TABLE submission_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES exam_submissions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id),
    answer JSONB NOT NULL, -- Stores string/boolean/number as JSON
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(submission_id, question_id)
);

-- Create RLS policies
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_answers ENABLE ROW LEVEL SECURITY;

-- Exams policies
CREATE POLICY "Professors can create exams"
ON exams FOR INSERT TO authenticated
WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE role = 'professor'
));

CREATE POLICY "Professors can update their own exams"
ON exams FOR UPDATE TO authenticated
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Everyone can view published exams"
ON exams FOR SELECT TO authenticated
USING (published = true OR auth.uid() = created_by);

-- Questions policies
CREATE POLICY "Questions are viewable with exam"
ON questions FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM exams
        WHERE exams.id = questions.exam_id
        AND (published = true OR created_by = auth.uid())
    )
);

CREATE POLICY "Professors can manage their exam questions"
ON questions FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM exams
        WHERE exams.id = questions.exam_id
        AND created_by = auth.uid()
    )
);

-- Submissions policies
CREATE POLICY "Students can create and view their own submissions"
ON exam_submissions FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professors can view submissions for their exams"
ON exam_submissions FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM exams
        WHERE exams.id = exam_submissions.exam_id
        AND created_by = auth.uid()
    )
);

-- Submission answers policies
CREATE POLICY "Users can manage their own answers"
ON submission_answers FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM exam_submissions
        WHERE exam_submissions.id = submission_answers.submission_id
        AND exam_submissions.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM exam_submissions
        WHERE exam_submissions.id = submission_answers.submission_id
        AND exam_submissions.user_id = auth.uid()
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON exam_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON submission_answers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create index for common queries
CREATE INDEX idx_exam_submissions_exam_id ON exam_submissions(exam_id);
CREATE INDEX idx_exam_submissions_user_id ON exam_submissions(user_id);
CREATE INDEX idx_questions_exam_id ON questions(exam_id);
CREATE INDEX idx_submission_answers_submission_id ON submission_answers(submission_id);
CREATE INDEX idx_submission_answers_question_id ON submission_answers(question_id);
