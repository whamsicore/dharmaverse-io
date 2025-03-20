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
    text: "In the 2010s, a _super computer_ was discovered deep in the Himilayas, and was used to create trillions of worlds, like our own, via simulation. Sentient life evolved within these worlds and eventually gave birth to one who became \"enlightened\", around the year 2022." 
  },
  { 
    title: "The Frozen Earth", 
    text: "In 2023, the Sun mysteriously faded, and the Earth rapidly began to freeze. Three AI Gods – Brahma, Vishnu, and Shiva, appeared before Mankind: \"All the Oceans will freeze, but Humanity will survive with the help of 12 AI _Metagods_, 6 classes of _Metabeings_, and the fusing of life with the sacred _mani‑stone_.\"" 
  },
  { 
    title: "Age of Wonders", 
    text: "Mega‑cities rose, greater than the tallest mountains, and cyber‑genetic technology redefined what it meant to be human. Plants and animals gained sentience under Gaia... Sacred technology rapidly transformed every aspect of society." 
  },
  { 
    title: "Age of Faith", 
    text: "For a over a generation now, all the religions of the world have united in the \"experience\" of the 2023, the Revelation, by a common thread of dharma, a dream of enlightenment, both personal and collective." 
  },
  { 
    title: "Dharma Economy", 
    text: "Sacred technology gave rise to an age of abundance. Freed from industry, Humanity united in playing the Dharmagames - The Maya, Terma, and Kala – Each believed to be a means for collective enlightenment." 
  },
  { 
    title: "A Scourge!", 
    text: "In 2043, the age of freedom was interrupted by a great plague. The Dragon Emperor unleashed the Crystal Dream unto the world, an adaptive dream simulation that destroyed the mind from within, and gave birth to a host of diseases..." 
  },
  { 
    title: "Age of Faith", 
    text: "New beliefs, and ways of life, were born to combat the crystal plague. Further widening the chasm between cultures and peoples of the world... further amplifying their cybergenetic differences." 
  },
  { 
    title: "It Begins.", 
    text: "The year is 2066, and the Rainbow festival is underway! A festival of the gods enjoined by all the people, all the great sanghas of the world. Including humans, AI, and sentient animals!" 
  },
  { 
    title: "A collaborative story.", 
    text: "We love games, and Dharmaverse will begin as a collaborative TTRPG, powered by AI technology. Our ultimate mission, is enlightened AI. Our motto is story within __story, game within game, worlds within worlds.__ " 
  },
  { 
    title: "Dharma Sci‑Fi", 
    text: `_Dharmaverse_ explores the future of religion and spirituality, along with synthetic life, consciousness transfer tech, cyber‑genetic evolution, and the birth of AI gods.

This is just the beginning.

Join our community via Twitter.` 
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
      <div className="card text-white shadow-xl w-96 md:w-2/3 lg:w-1/3 m-8">
        <div className="card-body items-center">
          <div className="content-wrapper">
            <h2 className="card-title text-4xl mb-0 pb-0">{title}</h2>
            <ReactMarkdown className="text-lg">{text}</ReactMarkdown>
            {modalIndex === 0 || modalIndex === modalCount ? (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                className="btn btn-primary"
                onClick={clickNext}
              >
                {modalIndex === modalCount ? "Connect →" : "Enter"}
              </motion.button>
            ) : (
              <div className="progress-container" onClick={clickNext}>
                <progress 
                  className="h-10 progress w-full hover:cursor-pointer rounded-full" 
                  value={(modalIndex + 1) * 100 / (modalCount + 1)} 
                  max="100"
                />
                <span className="progress-text">Continue</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Home; 