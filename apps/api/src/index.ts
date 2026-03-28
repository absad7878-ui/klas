// apps/api/src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import meRoutes from './routes/me.routes';
import classRoutes from './routes/class.routes';
import attendanceRoutes from './routes/attendance.routes';
import teacherRoutes from './routes/teacher.routes';
import publicRoutes from './routes/public.routes';
import assignmentRoutes from './routes/assignments.routes';
import scoreRoutes from './routes/scores.routes';
import feeRoutes from './routes/fees.routes';
import smsRoutes from './routes/sms.routes';
import examRoutes from './routes/exam.routes';
import subscriptionRoutes   from './routes/subscription.routes';
import forgotPasswordRoutes from './routes/forgot-password.routes';
import termsRoutes from './routes/terms.routes';
import path from 'path';
import schoolRoutes from './routes/school.routes';
import authRoutes from './routes/auth.routes';
import superAdminRoutes from './routes/super-admin.routes';
import studentRoutes from './routes/student.routes';
import announcementRoutes from './routes/announcements.routes';
import parentAuthRouter from './routes/parent.auth.routes';


const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Health check — keeps Render awake via UptimeRobot
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = [
      'https://klas.ng',
      'https://www.klas.ng',
      'http://localhost:3000',
      'http://localhost:4000',
    ];

    // Allow any *.klas.ng subdomain (school subdomains)
    if (origin.endsWith('.klas.ng')) return callback(null, true);

    // Allow explicitly listed origins
    if (allowed.includes(origin)) return callback(null, true);

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/parent',      parentAuthRouter);  
app.use('/announcements', announcementRoutes);
app.use('/terms',        termsRoutes);
app.use('/subscription', subscriptionRoutes);
app.use('/auth',         forgotPasswordRoutes);
app.use('/auth',         authRoutes);
app.use('/exams',        examRoutes);
app.use('/sms',          smsRoutes);
app.use('/attendance',   attendanceRoutes);
app.use('/fees',         feeRoutes);
app.use('/public',       publicRoutes);
app.use('/scores',       scoreRoutes);
app.use('/assignments',  assignmentRoutes);
app.use('/classes',      classRoutes);
app.use('/teachers',     teacherRoutes);
app.use('/students',     studentRoutes);
app.use('/api/me',       meRoutes);
app.use('/super-admin',  superAdminRoutes);
app.use('/schools',      schoolRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  console.log(`DATABASE_URL from env: ${process.env.DATABASE_URL ? 'present' : 'MISSING'}`);
});