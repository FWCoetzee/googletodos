import { Link } from 'react-router-dom';
import { PageTransition } from '@/components/PageTransition';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ContactForm } from '@/components/ContactForm';

const Contact = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <div className="container max-w-3xl mx-auto px-4 py-12">
          {/* Back button */}
          <div className="mb-8">
            <Link to="/about">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to About
              </Button>
            </Link>
          </div>

          {/* Contact Form */}
          <div className="bg-card/50 backdrop-blur-sm rounded-2xl shadow-lg border border-border p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              Have a question or want to work together? Send me a message!
            </p>
            <ContactForm />
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

export default Contact;
