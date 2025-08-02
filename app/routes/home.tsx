import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

// 1. SPLIT TEXT REVEAL EFFECT
const SplitTextReveal = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  
  const text = children;
  const words = text.split(' ');

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{
            duration: 0.8,
            delay: index * 0.1,
            ease: [0.25, 0.4, 0.25, 1]
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// 2. TYPEWRITER EFFECT ON SCROLL
const TypewriterOnScroll = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (isInView) {
      let i = 0;
      const timer = setInterval(() => {
        setDisplayedText(children.slice(0, i));
        i++;
        if (i > children.length) {
          clearInterval(timer);
        }
      }, 50);
      
      return () => clearInterval(timer);
    }
  }, [isInView, children]);

  return (
    <div ref={ref} className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="border-r-2 border-current ml-1"
      />
    </div>
  );
};

// 3. FADE UP WITH STAGGER
const FadeUpStagger = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });
  
  const lines = children.split('\n');
  
  return (
    <div ref={ref} className={className}>
      {lines.map((line, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{
            duration: 0.6,
            delay: index * 0.2,
            ease: "easeOut"
          }}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
};

// 4. SCROLL PROGRESS TEXT REVEAL
const ScrollProgressReveal = ({ children, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [50, 0, 0, -50]);
  
  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 5. LETTER BY LETTER REVEAL
const LetterReveal = ({ children, className = "" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  return (
    <div ref={ref} className={className}>
      {children.split('').map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.05,
            delay: index * 0.02,
            ease: "easeOut"
          }}
          className="inline-block"
          style={{ minWidth: char === ' ' ? '0.25em' : 'auto' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </div>
  );
};

// UPDATED HOME COMPONENT WITH TEXT EFFECTS
export default function Home() {
  const { auth, kv } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loadingResumes, setLoadingResumes] = useState(false);

  useEffect(() => {
    if(!auth.isAuthenticated) navigate('/auth?next=/');
  }, [auth.isAuthenticated]);

  useEffect(() => {
    const loadResumes = async () => {
      setLoadingResumes(true);
      const resumes = (await kv.list('resume:*', true));
      const parsedResumes = resumes?.map((resume) => (
          JSON.parse(resume.value)
      ));
      setResumes(parsedResumes || []);
      setLoadingResumes(false);
    };
    loadResumes();
  }, []);

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
      <Navbar />
      <SplashCursor/>
      
      <section className="main-section">
        <div className="page-heading py-16 space-y-8">
          {/* Option 1: Split Text Reveal */}
          <SplitTextReveal className="text-4xl md:text-6xl font-bold text-center">
            Track Your Applications & Resume Ratings
          </SplitTextReveal>
          
          {/* Option 2: Typewriter Effect */}
          {!loadingResumes && resumes?.length === 0 ? (
            <TypewriterOnScroll className="text-xl md:text-2xl text-center text-gray-600 max-w-4xl mx-auto">
              No resumes found. Upload your first resume to get feedback.
            </TypewriterOnScroll>
          ) : (
            <FadeUpStagger className="text-xl md:text-2xl text-center text-gray-600 max-w-4xl mx-auto">
              Review your submissions and check AI-powered feedback.
            </FadeUpStagger>
          )}
          
          {/* Option 3: Letter by Letter Reveal for Subtitle */}
          <LetterReveal className="text-lg text-center text-gray-500">
            Smart feedback for your dream job!
          </LetterReveal>
        </div>

        {/* Loading State with Scroll Effect */}
        {loadingResumes && (
          <ScrollProgressReveal className="flex flex-col items-center justify-center">
            <motion.img 
              src="/images/resume-scan-2.gif" 
              className="w-[200px]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </ScrollProgressReveal>
        )}

        {/* Resume Gallery with Entrance Animation */}
        {!loadingResumes && resumes.length > 0 && (
          <motion.div 
            className="resumes-section"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div style={{ height: '600px', position: 'relative' }}>
              <ResumeGallery 
                radius={200}
                itemSize={120}
                autoRotate={true}
                rotationSpeed={100}
                centerContent={
                  <div className="text-center">
                    <motion.h3 
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      My Resumes
                    </motion.h3>
                    <motion.p 
                      className="text-white/80"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.7 }}
                    >
                      {resumes.length} Resume{resumes.length !== 1 ? 's' : ''}
                    </motion.p>
                  </div>
                }
              >
                {resumes.map((resume) => (
                  <ResumeCard key={resume.id} resume={resume} />
                ))}
              </ResumeGallery>
            </div>
          </motion.div>
        )}
        
        {/* Upload Button with Bounce Effect */}
        {!loadingResumes && resumes?.length === 0 && (
          <motion.div 
            className="flex flex-col items-center justify-center mt-10 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                Upload Resume
              </Link>
            </motion.div>
          </motion.div>
        )}
      </section>
    </main>
  );
}