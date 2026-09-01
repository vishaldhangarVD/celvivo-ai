"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectItemText,
} from "@/components/ui/select";
import { 
  Building2, 
  Briefcase, 
  GraduationCap, 
  ArrowRight, 
  Loader2,
  ShieldCheck,
  Upload,
  Trash2,
  FileText,
  Command,
  Zap,
  ChevronRight,
  RotateCcw,
  Layers
} from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { INTERVIEW_STAGES, STAGE_ROUTES } from '@/lib/interview-stages';
import { analyzeResume } from '@/ai/flows/ai-resume-analysis';

const COMPANIES = [
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "Cognizant", domain: "cognizant.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "NVIDIA", domain: "nvidia.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "Cisco", domain: "cisco.com" },
  { name: "Intel", domain: "intel.com" },
  { name: "SAP", domain: "sap.com" },
  { name: "HCLTech", domain: "hcltech.com" },
  { name: "Tech Mahindra", domain: "techmahindra.com" },
  { name: "LTIMindtree", domain: "ltimindtree.com" },
  { name: "Mphasis", domain: "mphasis.com" },
  { name: "Zoho", domain: "zoho.com" },
  { name: "Freshworks", domain: "freshworks.com" },
  { name: "Other", domain: "" }
];

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Data Scientist", "Data Analyst", "Machine Learning Engineer", "DevOps Engineer",
  "Cloud Engineer", "Cyber Security Analyst", "UI/UX Designer", ".NET Developer",
  "Python Developer", "Java Developer", "Other"
];

const EXPERIENCE_LEVELS = ["Fresher", "0–1 Years", "1–3 Years", "3–5 Years", "5+ Years"];

const CompanyLogo = ({ name, className }: { name: string, className?: string }) => {
  const size = "100%";
  
  switch (name) {
    case "Google":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.61-1.48 2.54-3.67 2.54-6.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      );
    case "Microsoft":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#f25022" d="M1 1h10.5v10.5H1z"/><path fill="#7fbb00" d="M12.5 1H23v10.5H12.5z"/><path fill="#00a4ef" d="M1 12.5h10.5V23H1z"/><path fill="#ffb900" d="M12.5 12.5H23V23H12.5z"/>
        </svg>
      );
    case "Amazon":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#000" d="M12.6 3.9c-2.3 0-4.6.4-6.4 1.2-1.3.6-1.5 1.1-1.5 1.9 0 .8.5 1.3 1.5 1.3.4 0 .9-.1 1.4-.4.8-.4 1.9-.6 3.1-.6.7 0 1.4.1 1.9.3.9.3 1.2.7 1.2 1.5v1.2c-1.3-.1-3-.1-4.8.1-2.9.2-5.1 1.3-5.1 3.8 0 2.2 1.8 3.5 4.3 3.5 1.9 0 3.5-.8 4.7-2.3.2.7.7 1.3 1.9 1.3.8 0 1.6-.3 2.1-.8V12c0-5.1-2.8-8.1-7.4-8.1zm1.3 12.4c-.4.8-1.3 1.3-2.3 1.3-.9 0-1.6-.5-1.6-1.4 0-1.1 1-1.6 2.5-1.7 1-.1 1.4-.1 1.4-.1v1.9z"/><path fill="#FF9900" d="M4.6 20.2c4.4 2.4 10.3 2.5 14.8.5.5-.2.6-.8.2-1.1-.3-.2-.8-.1-1.1 0-4 1.8-9.3 1.7-13.3-.4-.4-.3-.9 0-.6.5z"/><path fill="#FF9900" d="M20 18.2c-.3-.4-1.6-.3-2.2-.2-.2.1-.2.3 0 .5.8.5 2.1.8 2.5.4.4-.3.2-1.6-.3-2.1-.1-.2-.3-.1-.3.1.1.7-.1 1.9.3 1.3z"/>
        </svg>
      );
    case "Meta":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#0668E1" d="M16.5 6.1c-1.3 0-2.5.5-3.4 1.4L11 9.6c-.6.6-1.4 1-2.3 1-1.8 0-3.3-1.4-3.3-3.3S6.8 4 8.6 4c1.1 0 2.1.5 2.8 1.4l.6.8h3.1l-.7-1C13.2 3.8 11.4 3 9.5 3 6 3 3.1 5.9 3.1 9.4s2.9 6.4 6.4 6.4c1.4 0 2.7-.5 3.6-1.3l2.6-3.1c.6-.6 1.4-1 2.3-1 1.8 0 3.3 1.4 3.3 3.3s-1.5 3.3-3.3 3.3c-1.1 0-2.1-.5-2.8-1.4l-.6-.8H11.4l.7 1c1.2 1.4 3 2.3 4.9 2.3 3.5 0 6.4-2.9 6.4-6.4s-3.4-6.4-6.9-6.4z"/>
        </svg>
      );
    case "Apple":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05 1.78-3.36 1.78s-1.74-.75-3.4-.75-2.1.73-3.38.75c-1.28.02-2.35-.91-3.33-1.86-2.6-2.52-4.59-7.14-4.59-11.02 0-3.87 2-5.91 3.93-5.91 1.05 0 1.95.66 3.01.66 1.04 0 2.14-.73 3.35-.73 1.13 0 2.65.41 3.68 1.99-2.53 1.34-2.12 5.09.43 6.27-.85 1.98-1.95 3.94-3.34 4.82zM12.02 4.09c-.06-2.48 2.05-4.54 4.41-4.59.27 2.65-2.22 4.74-4.41 4.59z"/>
        </svg>
      );
    case "IBM":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#0062ff" d="M0 4h5.6v1.4H0zm6.8 0h5.6v1.4H6.8zm6.8 0H19.2v1.4h-5.6zm5.6 0H24v1.4h-1.6zM0 7h5.6v1.4H0zm6.8 0h5.6v1.4H6.8zm6.8 0H19.2v1.4h-5.6zm5.6 0H24v1.4h-1.6zM0 10h5.6v1.4H0zm6.8 0h5.6v1.4H6.8zm6.8 0H19.2v1.4h-5.6zm5.6 0H24v1.4h-1.6zM0 13h5.6v1.4H0zm6.8 0h5.6v1.4H6.8zm6.8 0H19.2v1.4h-5.6zm5.6 0H24v1.4h-1.6zM0 16h5.6v1.4H0zm6.8 0h5.6v1.4H6.8zm6.8 0H19.2v1.4h-5.6zm5.6 0H24v1.4h-1.6zM0 19h5.6v1.4H0zm6.8 0h5.6v1.4H6.8zm6.8 0H19.2v1.4h-5.6zm5.6 0H24v1.4h-1.6z"/>
        </svg>
      );
    case "Accenture":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#A100FF" d="M1.5 2L18.5 12L1.5 22V2Z"/>
        </svg>
      );
    case "Deloitte":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="currentColor" d="M1.5 5v14h3.5c1.9 0 3.4-.4 4.5-1.1 1.4-.9 2.1-2.4 2.1-4.4 0-1.6-.5-2.8-1.5-3.8-1-1-2.6-1.5-4.8-1.5H1.5zm1.5 1.5h1.7c1.7 0 2.8.3 3.6.9.7.6 1.1 1.6 1.1 2.9 0 1.6-.4 2.7-1.2 3.4-.8.7-2 1-3.6 1H3V6.5z"/><circle cx="21" cy="17.5" r="2.5" fill="#86bc25"/>
        </svg>
      );
    case "TCS":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#0054a6" d="M2.5 4h1.8v16H2.5V4zm2.7 0H8v1.8H5.2V9h2.3v1.8H5.2v3.2H8V16H5.2V4zm3.6 0h1.8v1.8h1.8V4h1.8v12h-1.8v-1.8h-1.8V16H8.8V4z"/><path fill="#c21a30" d="M20 6c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z"/>
        </svg>
      );
    case "Infosys":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#007cc3" d="M1 1h22v22H1V1zm2 2v18h18V3H3zm2 2h3v3H5V5zm4 0h3v3H9V5zm4 0h3v3h-3V5zm-8 4h3v3H5V9zm4 0h3v3H9V9zm4 0h3v3h-3V9zm-8 4h3v3H5v-3zm4 0h3v3H9v-3zm4 0h3v3h-3v-3z"/>
        </svg>
      );
    case "NVIDIA":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#76B900" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 17.5c-3.04 0-5.5-2.46-5.5-5.5s2.46-5.5 5.5-5.5 5.5 2.46 5.5 5.5-2.46 5.5-5.5 5.5z"/>
        </svg>
      );
    case "Oracle":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#F80000" d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
        </svg>
      );
    case "Salesforce":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#00A1E0" d="M23.7 13.9c-.1-1-.4-1.9-.9-2.7-1.3-2.3-3.8-3.4-6.3-3.1-1.3-3.2-4.5-5.2-8.1-5.2-3.8 0-7.2 2.3-8.6 5.8C-1.5 9.5-2.5 11.6-2.5 14c0 4.4 3.6 8 8 8h11c4.4 0 8-3.6 8-8-.1-.1-.2-.1-.8-.1z"/>
        </svg>
      );
    case "Adobe":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#FF0000" d="M14.58 2.5l9.42 22h-6.28l-3.61-9.06h-4.32l3.61 9.06H4l9.42-22h1.16zM6.16 24.5H0V2.5h9.42L6.16 24.5z"/>
        </svg>
      );
    case "Cisco":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#00BCEB" d="M3 14h2v6H3zm4-4h2v10H7zm4-4h2v14h-2zm4 0h2v14h-2zm4 4h2v10h-2zm4 4h2v6h-2z"/>
        </svg>
      );
    case "Intel":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#0071C5" d="M12 2C5.37 2 0 7.37 0 14s5.37 12 12 12 12-5.37 12-12S18.63 2 12 2zm-4.5 18h-2V10h2v8zm3 0h-2v-8h2v8zm5-4.5h-3v4.5h-2V10h5v3.5z"/>
        </svg>
      );
    case "SAP":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#008FD3" d="M0 6h24v12H0z"/>
          <path fill="#FFFFFF" d="M4 15h3l1-3h5l1 3h3L10 8h-1L4 15zm6-5l1.5-4 1.5 4h-3z"/>
        </svg>
      );
    case "HCLTech":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#005696" d="M2 6h4v5h4V6h4v12h-4v-4H6v4H2V6zm14 0h4v12h-4V6z"/>
        </svg>
      );
    case "Tech Mahindra":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#E31E24" d="M2 6h20l-3 3H5v4h14l-3 3H5v6H2V6z"/>
        </svg>
      );
    case "LTIMindtree":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#F05A28" d="M12 2l8 8-8 8-8-8 8-8zm0 4l-4 4 4 4 4-4-4-4z"/>
        </svg>
      );
    case "Mphasis":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#005A9C" d="M4 6l8 6 8-6v12l-8-6-8 6V6z"/>
        </svg>
      );
    case "Zoho":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <rect fill="#F44336" x="2" y="2" width="9" height="9"/><rect fill="#4CAF50" x="13" y="2" width="9" height="9"/><rect fill="#2196F3" x="2" y="13" width="9" height="9"/><rect fill="#FFEB3B" x="13" y="13" width="9" height="9"/>
        </svg>
      );
    case "Freshworks":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#00A1E0" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
        </svg>
      );
    case "Wipro":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <circle cx="12" cy="12" r="10" fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="2 2"/>
          <circle cx="12" cy="12" r="6" fill="#7C3AED"/>
        </svg>
      );
    case "Cognizant":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#0033A0" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.76 0 5.26-1.12 7.07-2.93l-2.83-2.83C15.02 17.46 13.58 18 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.58 0 3.02.54 4.24 1.76l2.83-2.83C17.26 3.12 14.76 2 12 2z"/>
        </svg>
      );
    case "Capgemini":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ width: size, height: size }} preserveAspectRatio="xMidYMid meet">
          <path fill="#0070AD" d="M12 2L4 12l8 8 8-10-8-8z"/>
        </svg>
      );
    default:
      return <Building2 className={cn("text-accent", className)} style={{ width: size, height: size }} />;
  }
};

export default function InterviewSetupPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher");
  const [isInitializing, setIsInitializing] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [resumeBase64, setResumeBase64] = useState<string | null>(null);

  const journeyRef = useMemo(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid, 'journey', 'active');
  }, [db, user?.uid]);

  const { data: journey } = useDoc(journeyRef);

  useEffect(() => {
    if (journey) {
      if (journey.company) setCompany(journey.company);
      if (journey.role) setRole(journey.role);
      if (journey.experience) setExperience(journey.experience);
    }
  }, [journey]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.type !== 'application/pdf') {
        toast({ variant: "destructive", title: "Format Error", description: "Only PDF blueprints are supported." });
        return;
      }
      setFile(selected);
      setIsVerifying(true);
      
      const base64 = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        reader.readAsDataURL(selected);
      });
      
      setResumeBase64(base64);
      setTimeout(() => {
        setIsUploaded(true);
        setIsVerifying(false);
        toast({ title: "Blueprint Detected", description: "Identity file loaded successfully." });
      }, 1000);
    }
  };

  const handleProceed = async (targetPath: 'aptitude' | 'interview') => {
    if (!db || !user?.uid || !resumeBase64) {
      toast({ variant: "destructive", title: "Calibration Incomplete", description: "Please upload your resume to begin." });
      return;
    }

    setIsInitializing(true);
    const sessionId = journey?.sessionId || Math.random().toString(36).substring(7);

    try {
      const analysisResult = await analyzeResume({
        resumeDataUri: resumeBase64,
        targetRole: role,
        experienceLevel: experience,
        targetCompany: company
      });

      const finalStage = targetPath === 'aptitude' ? INTERVIEW_STAGES.APTITUDE : INTERVIEW_STAGES.HR_INTERVIEW;
      const step = targetPath === 'aptitude' ? 4 : 8;

      await setDoc(journeyRef!, {
        sessionId,
        role,
        experience,
        company,
        resumeName: file?.name || "resume.pdf",
        resumeBase64: resumeBase64,
        resumeAnalysis: analysisResult,
        currentStage: finalStage,
        step,
        aptitudeStatus: "not_started",
        aptitudeReport: null,
        aptitudeQuestions: null,
        aptitudeAnswers: null,
        codingReport: null,
        codingUnlocked: false,
        codingQuestions: null,
        updatedAt: serverTimestamp(),
        createdAt: journey?.createdAt || serverTimestamp()
      }, { merge: true });

      if (targetPath === 'aptitude') {
        router.push(STAGE_ROUTES.APTITUDE);
      } else {
        router.push(`${STAGE_ROUTES.HR_INTERVIEW}${sessionId}`);
      }
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Protocol Fault", description: "Failed to persist identity node." });
      setIsInitializing(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-accent animate-spin" />
    </div>
  );

  return (
    <div className="h-screen bg-[#050816] flex flex-col overflow-hidden relative">
      <div className="particles-bg" />
      <Navbar />

      <main className="flex-1 container mx-auto px-6 pt-24 pb-4 overflow-hidden flex flex-col min-h-0">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 flex-1 min-h-0 w-full">
          
          <div className="lg:col-span-7 flex flex-col h-full min-h-0">
            <header className="space-y-1 mb-4 shrink-0">
              <Badge className="bg-accent/20 text-accent border-none px-4 py-0.5 text-[9px] tracking-[0.4em] font-black uppercase">
                INTERVIEW PREPARATION
              </Badge>
              <h1 className="text-4xl font-bold tracking-tighter text-premium">
                Set Up Your Interview.
              </h1>
              <p className="text-sm text-muted-foreground font-light max-w-xl">
                Choose your company, job role, experience level, and upload your resume to get started.
              </p>
            </header>

            <div className="space-y-4 flex-1 min-h-0 overflow-y-auto md:overflow-visible pr-2 custom-scrollbar">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">ORGANIZATION</Label>
                <Select value={company} onValueChange={setCompany}>
                  <SelectTrigger className="h-12 glass border-white/10 bg-transparent rounded-xl px-4 text-sm font-bold uppercase tracking-widest text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <CompanyLogo name={company} />
                      </div>
                      <SelectValue placeholder="Select Organization" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {COMPANIES.map(c => (
                      <SelectItem key={c.name} value={c.name}>
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <CompanyLogo name={c.name} />
                          </div>
                          <SelectItemText>{c.name}</SelectItemText>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">JOB ROLE</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-12 glass border-white/10 bg-transparent rounded-xl px-4 text-sm font-bold uppercase tracking-widest text-white">
                    <SelectValue placeholder="Select Job Role" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 bg-[#0b0e1a] text-white">
                    {ROLES.map(r => (
                      <SelectItem key={r} value={r}>
                        <SelectItemText>{r}</SelectItemText>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">EXPERIENCE LEVEL</Label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setExperience(l)}
                      className={cn(
                        "px-4 py-2 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all",
                        experience === l 
                          ? "bg-accent/20 border-accent text-accent shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
                          : "glass border-white/5 text-white/40 hover:bg-white/5"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 ml-2">SELECTED CONFIGURATION</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Organization", val: company, icon: Building2 },
                    { label: "Job Role", val: role, icon: Briefcase },
                    { label: "Experience Level", val: experience, icon: GraduationCap }
                  ].map((item, i) => (
                    <Card key={i} className="p-3 glass border-accent/20 bg-accent/5 rounded-2xl space-y-1.5">
                       <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                         {item.label === "Organization" ? (
                           <div className="w-4 h-4 flex items-center justify-center">
                             <CompanyLogo name={item.val} />
                           </div>
                         ) : <item.icon className="w-4 h-4" />}
                       </div>
                       <div>
                         <p className="text-[11px] font-bold text-white leading-tight truncate">{item.val}</p>
                         <p className="text-[7px] font-black uppercase tracking-widest text-white/30 mt-0.5">{item.label}</p>
                       </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => document.getElementById('next-steps-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full h-14 btn-premium text-[10px] font-black uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(147,51,234,0.3)] mt-2"
              >
                CONTINUE TO NEXT STEP
              </Button>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-full min-h-0 gap-4">
            <div className="space-y-2 shrink-0">
              <h2 className="text-lg font-bold tracking-tighter ml-2 uppercase">Resume Upload</h2>
              <Card 
                onClick={() => !isVerifying && document.getElementById('resume-input')?.click()}
                className={cn(
                  "premium-card bg-white/[0.01] border-white/5 p-4 flex flex-col items-center justify-center text-center cursor-pointer group transition-all duration-500 h-[180px] relative overflow-hidden shrink-0",
                  isUploaded ? "border-green-500/20 bg-green-500/[0.02]" : "hover:border-accent/20 hover:bg-white/[0.03]"
                )}
              >
                <input type="file" id="resume-input" className="hidden" accept=".pdf" onChange={handleFileChange} />
                <AnimatePresence mode="wait">
                  {isVerifying ? (
                    <motion.div key="verifying" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-2 border-accent/10 border-t-accent animate-spin" />
                        <ShieldCheck className="w-5 h-5 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <p className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Verifying Blueprint...</p>
                    </motion.div>
                  ) : !isUploaded ? (
                    <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto border border-accent/20 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-accent" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-bold">Choose File</h3>
                        <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-black">Drag & Drop Resume area</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="uploaded" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3 w-full">
                      <div className="relative mx-auto w-12 h-14 glass rounded-lg border-white/10 flex items-center justify-center overflow-hidden">
                        <FileText className="w-6 h-6 text-white/20" />
                        <Badge className="absolute top-0.5 right-0.5 bg-red-500/20 text-red-500 border-none text-[6px] font-black px-1">PDF</Badge>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-white truncate max-w-[240px] mx-auto">{file?.name}</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setIsUploaded(false); setFile(null); }} 
                          className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-white/30 hover:text-red-400 transition-all mx-auto pt-2"
                        >
                          <Trash2 className="w-2.5 h-2.5" /> Remove Blueprint
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>

            <div id="next-steps-section" className="space-y-3 flex-1 min-h-0 flex flex-col justify-end pb-2">
              <div className="space-y-0.5 ml-2 shrink-0">
                <h3 className="text-lg font-bold tracking-tighter uppercase">NEXT STEPS</h3>
                <p className="text-[9px] text-white/40 uppercase tracking-widest">Choose how you want to proceed with your assessment</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <Card className="glass border-white/5 bg-white/[0.01] p-4 rounded-[1.5rem] flex flex-col justify-between hover:border-accent/40 transition-all group">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                      <Command className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest">Aptitude Round</h4>
                      <p className="text-[8px] text-white/30 leading-tight font-medium">Logical intelligence audit.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProceed('aptitude')}
                    disabled={isInitializing || !isUploaded}
                    className="w-full h-9 mt-3 rounded-lg glass border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-black transition-all"
                  >
                    {isInitializing ? <Loader2 className="w-3 h-3 animate-spin" /> : "CONTINUE TO APTITUDE"}
                  </Button>
                </Card>

                <Card className="glass border-white/5 bg-white/[0.01] p-4 rounded-[1.5rem] flex flex-col justify-between hover:border-purple-500/40 transition-all group">
                  <div className="space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-[10px] uppercase tracking-widest">Interview Round</h4>
                      <p className="text-[8px] text-white/30 leading-tight font-medium">AI executive simulation.</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleProceed('interview')}
                    disabled={isInitializing || !isUploaded}
                    className="w-full h-9 mt-3 rounded-lg glass border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                  >
                    {isInitializing ? <Loader2 className="w-3 h-3 animate-spin" /> : "CONTINUE TO INTERVIEW"}
                  </Button>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
