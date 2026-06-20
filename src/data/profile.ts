import profileData from "./profile.json";

export interface Personal {
  name: string;
  firstName: string;
  title: string;
  tagline: string;
  bio: string;
  shortBio: string;
  yearsExperience: string;
  currentlyAt: string;
  availability: string;
  available: boolean;
  avatar: string;
  resumeUrl: string;
  location: string;
  timezone: string;
  email: string;
  phone: string;
  website: string;
}

export interface Socials {
  github: string;
  linkedin: string;
  website: string;
  twitter?: string;
}

export interface Stat {
  label: string;
  value: string;
  suffix: string;
}

export interface NavItem {
  href: string;
  label: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  companyDomain?: string;
  companyLogo?: string;
  location: string;
  period: string;
  current?: boolean;
  description: string;
  achievements: string[];
  stack: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  description: string;
}

export interface Certification {
  title: string;
  issuer: string;
  year: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
}

export interface Project {
  title: string;
  company?: string;
  year?: string;
  featured?: boolean;
  description: string;
  role?: string;
  team?: string;
  duration?: string;
  highlights?: string[];
  metrics?: ProjectMetric[];
  techStack: string[];
  githubUrl?: string;
  demoUrl?: string;
  image?: string;
}

export type TechStackIcon =
  | "Code"
  | "Layers"
  | "Database"
  | "Cloud"
  | "Cog"
  | "Monitor";

export interface TechStack {
  category: string;
  icon: TechStackIcon;
  technologies: string[];
}

export interface PostMeta {
  name: string;
  path: string;
}

export type OpenForIcon =
  | "Briefcase"
  | "LayoutGrid"
  | "TrendingUp"
  | "ShieldCheck"
  | "Compass"
  | "Sparkles"
  | "Network"
  | "Users";

export interface OpenForItem {
  icon: OpenForIcon;
  title: string;
  description: string;
}

export interface Profile {
  personal: Personal;
  socials: Socials;
  stats: Stat[];
  highlights: string[];
  marquee: string[];
  navigation: NavItem[];
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  techStacks: TechStack[];
  posts: PostMeta[];
  openFor: OpenForItem[];
}

const profile = profileData as Profile;

export default profile;
