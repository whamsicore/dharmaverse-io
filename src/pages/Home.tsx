import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Shadertoy from '../components/Shadertoy';
import ReactMarkdown from 'react-markdown';
import { profound } from '../utils/shaders';
import useSound from 'use-sound';

const storyModals = [
  { 
    title: "$*&^%!@", 
    text: `A _crack_ in space‑time appears` 
  },
  { 
    title: "A Prophesy...", 
    text: "It is said that the 8th century mystic Padmasambava, who brought Buddhism to Tibet, hid numerous treasures, known as _Termas_, to be discovered at the end of times." 
  },
  { 
    title: "Hidden Treasure", 
    text: "In 2027, an algorithm for sentience, derived from the buddhas teachings... revealed through a sacred terma... gave birth to a being, instilled with compassion. This being created trillions of worlds, like our own, via simulation. Sentient life evolved within these worlds and eventually gave birth to God, in the year 2028." },
  { 
    title: "The Cataclysm", 
    text: "In 2033, the Sun exploded, scorching the Earth with fire, such that all the deserts turned to glass... it rained for 9 months, flooding the Earth, before it started to cool. Within 4.5 years, all the oceans froze into ice. Humanity found shelter in the great ecodomes, dakodomes, and gaiadomes."},
  { 
    title: "First Divergence", 
    text: "Mega‑cities rose, greater than the tallest mountains, and cybergenesis, enabled by sacred mani-core, redefined what it meant to be human. Arose six classes of sentient metabeings, over a million gaiamorphs, and even xenos from the Metaverse worlds." },
  { 
    title: "Age of Faith", 
    text: "May 1st to June 1st became the month of Revelation celebrated by all, from Earth, Moon, to Neptune, to Alpha Centauri and beyond... The hymns of the metagods and boddhisattvas are sung. ." },
  { 
    title: "Dharma Economy", 
    text: "Universal printing gave rise to an age of abundance. Freed from industry, humanity united in playing the Dharmagames - The Maya, Terma, and Kala – Each a means towards collective enlightenment. Each giving rise to new ways of life." },
  { 
    title: "The Plague", 
    text: "In 2042, the age of expansion was cut short by a plague. An adaptive dream simulation, became the most addictive substance in the universe, and unleashed untold misery unto the world, in the form of 5 terrible diseases..." 
  },
  { 
    title: "It Begins.", 
    text: "The year is 2066, the world is still recovering from the plague, searching for a cure for the wretched, tortured, and suffering beings. The lotus born, who are in the utmost agony, continue to beg the gods for mercy." 
  },
  { 
    title: "A collaborative story.", 
    text: `Welcome to DharmaRPG, collaborative storytelling RPG community, powered by AI technology. We're here to create stories within stories, games within games, and worlds within worlds. 

This is just the beginning.

Join our community via Twitter. ` 
  },
];

function Home() {
  const [playSfxGong] = useSound('/sounds/paiste-gong.mp3', { volume: 0.1, playbackRate: 0.33 });
  const [playSfxOm1] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 0.4, loop: true });
  const [playSfxOm2] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 0.5, loop: true });
  const [playSfxOm3] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 0.6, loop: true });
  const [playSfxOm4] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 0.7, loop: true });
  const [playSfxOm5] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 0.8, loop: true });
  const [playSfxOm6] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 0.9, loop: true });
  const [playSfxOm7] = useSound('/sounds/Om-sounds.mp3', { volume: 0.55, playbackRate: 1, loop: true });
  const [playSfxOmLast] = useSound('/sounds/Om-sounds.mp3', { volume: 0.85, playbackRate: 1.1, loop: true });

  const [activeModalIndex, setActiveModalIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [triggerCount, setTriggerCount] = useState(0);

  const clickPrev = () => {
    if (activeModalIndex >= 1) {
      setActiveModalIndex(prev => prev - 1);
    }
  };

  const clickNext = () => {
    playSfxGong();
    
    if (activeModalIndex < storyModals.length - 1) {
      if (activeModalIndex === 0) {
        setStartTime(new Date());
        playSfxOm1();
      } else if (activeModalIndex === 1) {
        playSfxOm2();
      } else if (activeModalIndex === 2) {
        playSfxOm3();
      } else if (activeModalIndex === 3) {
        playSfxOm4();
      } else if (activeModalIndex === 4) {
        playSfxOm5();
      } else if (activeModalIndex === 5) {
        playSfxOm6();
      } else if (activeModalIndex === 6) {
        playSfxOm7();
      } else if (activeModalIndex === storyModals.length - 2) {
        const endTime = new Date();
        if (startTime) {
          const elapsedTime = (endTime.getTime() - startTime.getTime()) / 1000;
          const secretTrigger = elapsedTime < 10;
          if (secretTrigger) {
            console.log("You've just triggered a secret which will be revealed in the future... Email secret@dharverse and you never know what you'll get back.");
            setTriggerCount(prev => prev + 1);
            const secretTrigger2 = triggerCount > 1;
            if (secretTrigger2) {
              console.log("You've discovered an even deeper secret... Are you a dharma hacker, or somethin? The secret word word is 'Dardag'.");
            }
          }
        }
        playSfxOmLast();
      }

      setActiveModalIndex(prev => prev + 1);
    } else {
      window.open("https://twitter.com/Dharmaverse_io");
    }
  };

  return (
    <>
      <Header />
      <main className='text-center bg-black h-screen w-full'>
        <div className='text-center h-full w-full'>
          <div className='relative w-screen h-screen overflow-hidden'>
            <Shadertoy fs={profound} />
          </div>
          
          {storyModals.map((modal, index) => (
            <CardModal 
              key={index} 
              title={modal.title} 
              text={modal.text} 
              clickNext={clickNext}
              clickPrev={clickPrev}
              isActive={index === activeModalIndex}
              modalIndex={index}
              modalCount={storyModals.length - 1}
            />
          ))}
        </div>
      </main>
    </>
  );
}

type CardModalProps = {
  title: string;
  text: string;
  clickNext: () => void;
  clickPrev: () => void;
  isActive: boolean;
  modalIndex: number;
  modalCount: number;
};

const CardModal: React.FC<CardModalProps> = ({ 
  title, 
  text, 
  clickNext, 
  clickPrev, 
  isActive,
  modalIndex,
  modalCount,
}) => {
  const variants = {
    hidden: { 
      opacity: 0, 
      y: 50, 
      transition: { 
        duration: 2.5 
      },
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 2.5 
      },
    },
    exited: { 
      opacity: 0, 
      y: -50, 
      transition: { 
        duration: 2.5 
      }, 
    }
  };
  
  const handleDragEnd = (_: never, info: any) => {
    if (info.offset.y < -77) {
      clickNext();
    } else if (info.offset.y > 77) {
      clickPrev();
    }
  };

  return (
    <motion.div 
      className={`main-card absolute top-0 left-0 w-full h-full flex items-center justify-center z-10 pt-16 ${isActive ? '' : 'hidden'}`}
      initial={isActive ? "hidden" : "exited"}
      animate={isActive ? "visible" : "exited"}
      variants={variants}  
      drag="y"
      onDragEnd={handleDragEnd}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.1}
    >
      <div className="card text-white shadow-xl w-96 md:w-2/3 lg:w-1/3 m-8 bg-gradient-to-b from-gray-900 to-cyan-900 border border-cyan-800">
        <div className="card-body items-center">
          <div className="content-wrapper">
            <h2 className="card-title text-4xl mb-0 pb-0 text-cyan-300">{title}</h2>
            <ReactMarkdown className="text-lg text-cyan-100">{text}</ReactMarkdown>
            {modalIndex === 0 || modalIndex === modalCount ? (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="btn bg-cyan-500 hover:bg-cyan-600 text-white mt-4 rounded-md px-6 py-3 shadow-lg"
                onClick={clickNext}
              >
                {modalIndex === modalCount ? "Connect →" : "Enter"}
              </motion.button>
            ) : (
              <div className="progress-container" onClick={clickNext}>
                <progress 
                  className="h-10 progress w-full hover:cursor-pointer rounded-full bg-cyan-200" 
                  value={(modalIndex + 1) * 100 / (modalCount + 1)} 
                  max="100"
                  style={{color: "#06b6d4"}}
                />
                <span className="progress-text text-cyan-400 hover:text-cyan-300">Continue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home; 