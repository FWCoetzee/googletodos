import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Github, Linkedin, Mail } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import franklinPhoto from '@/assets/franklin-photo.jpg';

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          {/* Back button */}
          <div className="mb-8">
            <Link to="/">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Tasks
              </Button>
            </Link>
          </div>

          {/* Main content */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8 md:p-12">
            <div className="flex flex-col items-center text-center">
              {/* Profile photo */}
              <Avatar className="h-32 w-32 ring-4 ring-primary/20 shadow-lg mb-6">
                <AvatarImage 
                  src={franklinPhoto} 
                  alt="Franklin Coetzee"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-3xl">
                  FC
                </AvatarFallback>
              </Avatar>

              {/* Name and title */}
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Franklin Coetzee
              </h1>
              <p className="text-muted-foreground text-lg mb-6">Creator & Developer</p>

              {/* Divider */}
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent rounded-full mb-8" />

              {/* About text */}
              <div className="space-y-4 text-muted-foreground max-w-xl">
                <p className="text-lg">
                  Hi there! I'm Franklin Coetzee, the creator of this task management application.
                </p>
                <p>
                  I built this app to help people stay organized and productive. It features a clean, 
                  modern interface with drag-and-drop functionality, due date tracking, and real-time 
                  updates to make managing your tasks as seamless as possible.
                </p>
                <p>
                  This project was built using React, TypeScript, Tailwind CSS, and Framer Motion 
                  for smooth animations. The backend is powered by Lovable Cloud for secure 
                  authentication and data persistence.
                </p>
              </div>

              {/* Social links */}
              <div className="flex gap-4 mt-8">
                <Button variant="outline" size="icon" asChild>
                  <a href="mailto:salazar3593@gmail.com" aria-label="Email">
                    <Mail className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="https://github.com/fwcoetzee" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <Github className="h-5 w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href="https://linkedin.com/in/franklincoetzee1985" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Built with ❤️ using Lovable</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default About;
